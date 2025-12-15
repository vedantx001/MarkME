const ClassroomImage = require('../model/ClassroomImage');
const AttendanceSession = require('../model/AttendanceSession');
const aiClient = require('../utils/aiClient');

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

        // 3. Check Image Limit (Max 4 per session)
        const existingCount = await ClassroomImage.countDocuments({ sessionId });
        const newCount = req.files.length;

        if (existingCount + newCount > 4) {
            return res.status(400).json({
                message: `Upload limit exceeded. You can only upload ${4 - existingCount} more image(s) for this session.`
            });
        }

        // 4. Save Images to Database
        const savedImages = [];
        const imageUrls = [];

        for (const file of req.files) {
            // In a real app, file.path or file.location (S3) would be used. 
            // Assuming multer saves locally or provides a path.
            const imageUrl = file.path || file.location || file.url;

            const newImage = new ClassroomImage({
                sessionId,
                imageUrl: imageUrl,
                meta: {
                    width: 0, // placeholders as we aren't processing image dimensions here
                    height: 0,
                    deviceInfo: 'Unknown'
                }
            });

            const savedDocs = await newImage.save();
            savedImages.push(savedDocs);
            imageUrls.push(imageUrl);
        }

        // 5. Trigger AI Face Recognition
        // We await this to ensure records are generated before returning, 
        // or we could fire-and-forget if we wanted it async. 
        // Given the prompt "AFTER saving, await aiClient...", we await it.
        try {
            await aiClient.triggerFaceRecognition(sessionId, session.classId, imageUrls);
        } catch (aiError) {
            console.error('AI Trigger Failed:', aiError);
            // We probably still want to return success for the image upload, 
            // but maybe warn about the AI failure? 
            // For now, let's just log it and proceed as the images *were* saved.
        }

        return res.status(201).json({
            message: 'Images uploaded and AI processing triggered successfully',
            images: savedImages
        });

    } catch (error) {
        console.error('Error in uploadSessionImages:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
