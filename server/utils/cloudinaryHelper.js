
const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary with specific resizing logic for large files.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} folderPath - The folder path in Cloudinary.
 * @param {string} publicId - The unique public ID for the file (allows overwriting).
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
const uploadToCloudinary = (fileBuffer, folderPath, publicId) => {
    return new Promise((resolve, reject) => {
        // 3MB limit in bytes
        const LARGE_FILE_THRESHOLD = 3 * 1024 * 1024;
        const isLargeFile = fileBuffer.length > LARGE_FILE_THRESHOLD;

        const uploadOptions = {
            folder: folderPath,
            public_id: publicId,
            overwrite: true,
            resource_type: 'auto',
        };

        if (isLargeFile) {
            uploadOptions.transformation = [
                { width: 2000, height: 2000, crop: "limit", quality: "auto" }
            ];
        } else {
            uploadOptions.transformation = [
                { quality: "auto" }
            ];
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        // Write buffer to stream
        uploadStream.end(fileBuffer);
    });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<Object>} - The result of the deletion.
 */
const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        if (!publicId) return resolve({ result: 'not found' }); // Nothing to delete

        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error);
                return reject(error);
            }
            resolve(result);
        });
    });
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};
