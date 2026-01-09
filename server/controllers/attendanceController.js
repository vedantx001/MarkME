
const AttendanceRecord = require("../model/AttendanceRecord");
const Student = require("../model/Student");
const AttendanceSession = require("../model/AttendanceSession"); // Added
const ClassroomImage = require("../model/ClassroomImage"); // Added
const Classroom = require("../model/Classroom"); // Added for schoolId lookup
const aiClient = require("../utils/aiClient");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper"); // Added

exports.processAttendance = async (req, res) => {
    try {
        let { sessionId, classId, imageUrls } = req.body;

        // Normalize imageUrls to array
        if (typeof imageUrls === 'string') {
            // Allow sending JSON array as a string in multipart bodies
            try {
                const parsed = JSON.parse(imageUrls);
                imageUrls = parsed;
            } catch {
                // fall through to treat as single url
            }
        }
        imageUrls = imageUrls ? (Array.isArray(imageUrls) ? imageUrls : [imageUrls]) : [];

        // Normalize uploaded files: multer array -> req.files
        const uploadedFiles = Array.isArray(req.files) ? req.files : [];

        if (!classId) {
            return res.status(400).json({ message: "classId is required." });
        }

        // 0. Handle File Upload(s) (req.files from middleware)
        if (uploadedFiles.length > 0) {
            try {
                const classroom = await Classroom.findById(classId).populate('schoolId');
                const schoolName = classroom?.schoolId?.name?.trim() || 'Undefined_School';
                const className = classroom?.name?.trim() || 'Undefined_Class';
                const dateStr = new Date().toISOString().split('T')[0];

                const folderPath = `${schoolName}/attendance/${className}/${dateStr}`;

                // Upload concurrently (faster on mobile; reduces chance of proxy timeouts)
                const batchTs = Date.now();
                const uploadResults = await Promise.all(
                    uploadedFiles.map(async (file, idx) => {
                        const publicId = `cls_img_${batchTs}_${idx}_${Math.round(Math.random() * 1e9)}`;
                        const secureUrl = await uploadToCloudinary(file.buffer, folderPath, publicId);
                        return secureUrl;
                    })
                );

                for (const secureUrl of uploadResults) {
                    if (!secureUrl || typeof secureUrl !== 'string' || secureUrl.trim() === '') {
                        console.error('❌ Cloudinary FAILURE: Invalid URL returned.');
                        return res.status(500).json({ message: "Error: Image could not be uploaded to the cloud. Recognition aborted." });
                    }

                    console.log(`✅ Cloudinary SUCCESS: ${secureUrl}`);
                    imageUrls.push(secureUrl);
                }
            } catch (uploadErr) {
                console.error(`❌ Cloudinary FAILURE: ${uploadErr.message}`);
                return res.status(500).json({ message: "Error: Image could not be uploaded to the cloud. Recognition aborted.", error: uploadErr.message });
            }
        }

        if (imageUrls.length === 0) {
            return res.status(400).json({ message: "At least one image (URL or upload) is required." });
        }

        // 0.5 Auto-Session Management
        if (!sessionId) {
            // Find or Create Session for Today
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            let session = await AttendanceSession.findOne({ classId, date: startOfDay });

            if (!session) {
                try {
                    // Create new session
                    const classroom = await Classroom.findById(classId);
                    if (!classroom) return res.status(404).json({ message: "Classroom not found." });

                    session = new AttendanceSession({
                        schoolId: classroom.schoolId,
                        classId,
                        date: startOfDay,
                        status: 'PENDING',
                        teacherId: req.user.id
                    });
                    await session.save();
                } catch (sessionErr) {
                    // Handle Race Condition: If duplicate key error (E11000), 
                    // it means another request created the session just now. Fetch it.
                    if (sessionErr.code === 11000) {
                        session = await AttendanceSession.findOne({ classId, date: startOfDay });
                        if (!session) throw sessionErr; // Should not happen if dup key exists
                    } else {
                        throw sessionErr;
                    }
                }
            }
            sessionId = session._id.toString();
        }

        // Save ClassroomImage record for history
        if (uploadedFiles.length > 0 && imageUrls.length > 0) {
            // Persist only the URLs that came from uploads in this request (the most recent ones)
            const uploadedUrls = imageUrls.slice(-uploadedFiles.length);
            await Promise.all(
                uploadedUrls.map((url) =>
                    new ClassroomImage({
                        sessionId,
                        imageUrl: url,
                        uploadedAt: new Date(),
                    }).save()
                )
            );
        }

        // 1. Call AI Service
        let presentStudentIds = [];
        try {
            const aiResponse = await aiClient.recognizeAttendance(classId, imageUrls);
            presentStudentIds = aiResponse.presentStudentIds || [];
        } catch (aiError) {
            console.error("AI Service Failed:", aiError.message);
            return res.status(503).json({ message: "AI Service unavailable. Attendance not processed." });
        }

        // 2. Fetch Student Universe
        const students = await Student.find({ classId });
        if (students.length === 0) {
            return res.json({ present: 0, absent: 0, message: "No students in this class." });
        }

        // 3. Mark Attendance (Atomic & Concurrent-Safe)

        // Strategy:
        // A. Ensure ALL students exist with default status 'A' (Absent).
        //    Use upsert=true with $setOnInsert. Safe against race conditions (unique index).
        // B. Mark DETECTED students as 'P' (Present).
        //    Only update if NOT edited by teacher. 
        //    If record missing (race with A), insert as 'P'.

        const bulkOpsDefaults = [];
        const bulkOpsPresents = [];
        const presentSet = new Set(presentStudentIds);

        // Op Group 1: Upsert Defaults (Everyone -> 'A')
        // Only inserts if record doesn't exist. Does NOT overwrite 'P'.
        students.forEach(student => {
            bulkOpsDefaults.push({
                updateOne: {
                    filter: { sessionId, studentId: student._id },
                    update: {
                        $setOnInsert: {
                            status: 'A',
                            source: 'SYSTEM',
                            edited: false,
                            confidence: null
                        }
                    },
                    upsert: true
                }
            });
        });

        // Op Group 2: Update Presents (Detected -> 'P')
        // Only for unedited records.
        presentStudentIds.forEach(studentId => {
            // 2a. Update existing if unedited
            bulkOpsPresents.push({
                updateOne: {
                    filter: { sessionId, studentId: studentId, edited: false },
                    update: {
                        $set: { status: 'P', source: 'SYSTEM' }
                    }
                }
            });
        });

        // 5. Execute DB Updates (Sequential Batches)

        // Batch 1: Ensure Records Exist
        if (bulkOpsDefaults.length > 0) {
            try {
                await AttendanceRecord.bulkWrite(bulkOpsDefaults, { ordered: false });
            } catch (bulkError) {
                // Ignore E11000 (Duplicate Key) - means record exists, which is good.
                if (bulkError.code !== 11000 && !bulkError.writeErrors?.every(e => e.code === 11000)) {
                    console.warn("Defaults BulkWrite errors:", bulkError.message);
                }
            }
        }

        // Batch 2: Mark Presents
        if (bulkOpsPresents.length > 0) {
            try {
                await AttendanceRecord.bulkWrite(bulkOpsPresents, { ordered: false });
            } catch (bulkError) {
                console.warn("Presents BulkWrite errors:", bulkError.message);
            }
        }

        // 6. Fetch Final Stats (Post-Write for Accuracy)
        const finalRecords = await AttendanceRecord.find({ sessionId });
        const presentCount = finalRecords.filter(r => r.status === 'P').length;
        const absentCount = finalRecords.filter(r => r.status === 'A').length;

        // 7. Response (hydrate client UI)
        const records = await AttendanceRecord.find({ sessionId })
            .populate('studentId', 'name rollNumber profileImageUrl');

        res.json({
            sessionId,
            classId,
            present: presentCount,
            absent: absentCount,
            total: students.length,
            processed: bulkOpsDefaults.length + bulkOpsPresents.length,
            records
        });

    } catch (err) {
        console.error("processAttendance error:", err);
        res.status(500).json({ message: "Server error processing attendance.", error: err.message });
    }
};
