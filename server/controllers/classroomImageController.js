const fs = require('fs').promises;
const path = require('path');
const ClassroomImage = require('../model/ClassroomImage');
const AttendanceSession = require('../model/AttendanceSession');
const Classroom = require('../model/Classroom');
const School = require('../model/School');
const aiClient = require('../utils/aiClient');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

/**
 * Upload images for a session and trigger AI attendance
 * Route: POST /api/classroom-images/:sessionId/images
 */
exports.uploadSessionImages = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // 1. Validate Session Exists
        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // 2. Validate Files Exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        if (req.files.length > 4) {
            return res.status(400).json({ message: 'Max 4 images allowed per request.' });
        }

        // 3. Check Image Limit (Max 4 per session total)
        const existingCount = await ClassroomImage.countDocuments({ sessionId });
        const newCount = req.files.length;

        if (existingCount + newCount > 4) {
            return res.status(400).json({
                message: `Upload limit exceeded. You can only upload ${4 - existingCount} more image(s) for this session.`
            });
        }

        // 4. Fetch Context (Classroom & School) for Cloudinary Path
        const classroom = await Classroom.findById(session.classId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found for this session.' });
        }

        const school = await School.findById(classroom.schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found for this classroom.' });
        }

        const schoolName = school.name.trim();
        const className = classroom.name.trim();
        const timestamp = Date.now();

        // Path: <schoolName>/classrooms/<className>/sessions/<sessionId>/<timestamp>
        const folderPath = `${schoolName}/classrooms/${className}/sessions/${sessionId}/${timestamp}`;

        // 5. Upload Images to Cloudinary
        const savedImages = [];
        const imageUrls = [];
        const successfulUploads = [];
        const failedUploads = [];

        for (const file of req.files) {
            try {
                // Read file buffer from disk (since middleware saved it)
                const fileBuffer = await fs.readFile(file.path);

                // Upload to Cloudinary
                // we pass null/undefined as publicId to let Cloudinary generate one (or use generic name), 
                // but requirements say "Do NOT provide a public_id (to prevent overwriting)"
                const secureUrl = await uploadToCloudinary(fileBuffer, folderPath, undefined);

                // Save to DB
                const newImage = new ClassroomImage({
                    sessionId,
                    imageUrl: secureUrl,
                    uploadedBy: req.user ? req.user.id : null, // Teacher ID
                    meta: {
                        width: 0, // Cloudinary result could provide this if we refined helper return
                        height: 0,
                        deviceInfo: 'Unknown',
                        originalName: file.originalname
                    }
                });

                const savedDoc = await newImage.save();
                savedImages.push(savedDoc);
                imageUrls.push(secureUrl);
                successfulUploads.push({ file: file.originalname, url: secureUrl });

                // Cleanup local file immediately
                await fs.unlink(file.path).catch(err => console.error("Failed to delete temp file:", err));

            } catch (err) {
                console.error(`Failed to upload ${file.originalname}:`, err);
                failedUploads.push({ file: file.originalname, error: err.message });
                // Try to clean up local file anyway
                await fs.unlink(file.path).catch(() => { });
            }
        }

        if (savedImages.length === 0 && failedUploads.length > 0) {
            return res.status(500).json({ message: "All image uploads failed.", errors: failedUploads });
        }

        // 6. Trigger AI Face Recognition
        try {
            if (imageUrls.length > 0) {
                await aiClient.triggerFaceRecognition(sessionId, session.classId, imageUrls);
            }
        } catch (aiError) {
            console.error('AI Trigger Failed:', aiError);
            // Non-blocking error for response, but worth logging
        }

        return res.status(201).json({
            message: 'Images uploaded and AI processing triggered successfully',
            totalImagesReceived: req.files.length,
            successfullyUploaded: successfulUploads.length,
            failedUploads: failedUploads,
            images: savedImages
        });

    } catch (error) {
        console.error('Error in uploadSessionImages:', error);
        // Clean up any remaining files if crash happened mid-loop
        if (req.files) {
            req.files.forEach(f => fs.unlink(f.path).catch(() => { }));
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
