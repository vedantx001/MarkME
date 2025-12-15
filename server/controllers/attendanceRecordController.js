const AttendanceRecord = require('../model/AttendanceRecord');

/**
 * Update a single attendance record
 * Route: PUT /api/attendance-records/:sessionId/records/:recordId
 */
exports.updateRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { status } = req.body;

        if (!status || !['P', 'A'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "P" or "A".' });
        }

        const updatedRecord = await AttendanceRecord.findByIdAndUpdate(
            recordId,
            {
                status: status,
                edited: true,
                source: 'TEACHER',
                confidence: null // Clear confidence as this is a manual override
            },
            { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.status(200).json(updatedRecord);

    } catch (error) {
        console.error('Error in updateRecord:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Bulk update multiple attendance records
 * Route: PUT /api/attendance-records/:sessionId/records
 * Body: { updates: [{ recordId: '...', status: 'P' }, ...] }
 */
exports.bulkUpdateRecords = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.recordId },
                update: {
                    status: update.status,
                    edited: true,
                    source: 'TEACHER',
                    confidence: null
                }
            }
        }));

        const result = await AttendanceRecord.bulkWrite(bulkOps);

        res.status(200).json({
            message: 'Records updated successfully',
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error in bulkUpdateRecords:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
