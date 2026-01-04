const axios = require('axios');

// Get AI Service URL from environment variables
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

if (!AI_SERVICE_URL) {
    throw new Error("AI_SERVICE_URL is not defined");
}

if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is not defined");
}


// Create a single axios instance with timeout
const apiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    headers: {
      "X-API-KEY": process.env.AI_API_KEY
    },
    timeout: 180000, // 30 seconds
});

/**
 * Helper to handle and log axios errors before re-throwing
 */
const handleAxiosError = (error, context) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`AI Service Error [${context}]:`, {
            status: error.response.status,
            data: error.response.data,
        });
    } else if (error.request) {
        // The request was made but no response was received
        console.error(`AI Service Network Error [${context}]: No response received`, error.message);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`AI Service Client Error [${context}]:`, error.message);
    }
    throw error;
};

const aiClient = {
    /**
     * Generates a face embedding for a student by calling the AI service.
     * @param {string} studentId - The ID of the student.
     * @param {string} classId - The ID of the class (required for saving embedding).
     * @param {string} imageUrl - The URL of the student's face image.
     * @returns {Promise<Object>} - The response data from the AI service.
     */
    generateEmbedding: async (studentId, classId, imageUrl) => {
        try {
            const response = await apiClient.post('/api/ai/generate-embedding', {
                studentId,
                classId,
                imageUrl,
            });
            return response.data;
        } catch (error) {
            handleAxiosError(error, 'generateEmbedding');
        }
    },

    /**
     * Recognizes students in classroom images by calling the AI service.
     * @param {string} classId - The ID of the class.
     * @param {string[]} imageUrls - Array of image URLs to process (max 4).
     * @returns {Promise<Object>} - The response data containing presentStudentIds.
     */
    recognizeAttendance: async (classId, imageUrls) => {
        try {
            const response = await apiClient.post('/api/ai/recognize', {
                classId,
                imageUrls,
            });
            return response.data;
        } catch (error) {
            handleAxiosError(error, 'recognizeAttendance');
        }
    },
};

module.exports = aiClient;
