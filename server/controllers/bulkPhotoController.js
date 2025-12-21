const AdmZip = require("adm-zip");

const path = require("path");
const Student = require("../model/Student");
const Classroom = require("../model/Classroom");
const School = require("../model/School");
const { uploadToCloudinary } = require("../utils/cloudinaryHelper");

/**
 * Bulk upload student profile photos from a ZIP file.
 * Endpoint: POST /api/students/bulk-photo-upload
 * Expects:
 *  - req.file: ZIP file containing images named by rollNumber (e.g., 101.jpg, 12.png)
 *  - req.body.classId: The target class ID
 */
exports.uploadBulkPhotos = async (req, res) => {
    try {
        const { classId } = req.body;

        // 1. Basic Validation
        if (!req.file) {
            return res.status(400).json({ message: "ZIP file is required." });
        }
        if (!classId) {
            return res.status(400).json({ message: "classId is required." });
        }

        // 2. Fetch Context (Classroom & School)
        const classroom = await Classroom.findById(classId);
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        const school = await School.findById(classroom.schoolId);
        if (!school) {
            // Fallback: search by req.user.schoolId if available, though classroom.schoolId is more direct
            return res.status(404).json({ message: "School associated with classroom not found." });
        }

        const schoolName = school.name.trim();
        const className = classroom.name.trim();

        // Construct base folder path: <schoolName>/students/<className>/face-images/
        const folderPath = `${schoolName}/students/${className}/face-images/`;

        // 3. Process ZIP
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();

        // Filter for valid images (ignore directories and MacOS artifacts)
        const imageEntries = zipEntries.filter(entry => {
            if (entry.isDirectory) return false;
            if (entry.entryName.includes("__MACOSX") || entry.entryName.includes(".DS_Store")) return false;

            const ext = path.extname(entry.name).toLowerCase();
            return [".jpg", ".jpeg", ".png"].includes(ext);
        });

        if (imageEntries.length === 0) {
            return res.status(400).json({ message: "No valid image files found in ZIP." });
        }

        // 4. Set up Concurrency Limit
        // p-limit is ESM, so we use dynamic import
        const { default: pLimit } = await import("p-limit");
        const limit = pLimit(5);

        // Track results
        const results = {
            totalFilesFound: imageEntries.length,
            processed: 0,
            successful: [],
            skipped: [],
            failed: []
        };

        // 5. Processing Loop
        const uploadPromises = imageEntries.map(entry => {
            return limit(async () => {
                const filename = entry.name; // e.g., "101.jpg"
                const rollNumber = path.basename(filename, path.extname(filename)); // "101"

                try {
                    // Check if student exists in this class
                    const student = await Student.findOne({ classId, rollNumber });

                    if (!student) {
                        results.skipped.push({ file: filename, reason: `Student with roll ${rollNumber} not found in class.` });
                        return;
                    }

                    // Upload to Cloudinary
                    // We use rollNumber as the public_id to ensure overwrite
                    const buffer = entry.getData();
                    const publicId = rollNumber.toString();

                    const secureUrl = await uploadToCloudinary(buffer, folderPath, publicId);

                    // Update Student
                    student.profileImageUrl = secureUrl;
                    await student.save();

                    results.successful.push({ rollNumber, url: secureUrl });

                } catch (err) {
                    console.error(`Error processing ${filename}:`, err);
                    results.failed.push({ file: filename, error: err.message });
                } finally {
                    results.processed++;
                }
            });
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // 6. Response
        res.json({
            message: "Bulk processing complete",
            summary: {
                total: results.totalFilesFound,
                successCount: results.successful.length,
                skippedCount: results.skipped.length,
                failedCount: results.failed.length,
            },
            details: results
        });

    } catch (err) {
        console.error("uploadBulkPhotos error:", err);
        res.status(500).json({ message: "Server error during bulk upload", error: err.message });
    }
};
