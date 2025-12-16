const excel = require('exceljs');

const generateMonthlyExcel = async (students, sessions, records) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Attendance');

    // 1. Define Columns
    // Static columns
    const columns = [
        { header: 'Roll No', key: 'rollNo', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
    ];

    // Dynamic columns for each session date
    // Sort sessions by date just in case
    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedSessions.forEach(session => {
        // Format date as DD/MM/YYYY
        const dateObj = new Date(session.date);
        const dateStr = dateObj.toLocaleDateString('en-GB');
        columns.push({ header: dateStr, key: session._id.toString(), width: 12 });
    });

    worksheet.columns = columns;

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // 2. Add Rows
    students.forEach(student => {
        const rowData = {
            rollNo: student.rollNo || '-',
            name: student.name
        };

        sortedSessions.forEach(session => {
            // Find record for this student and session
            // records is expected to be an array of all AttendanceRecords passed in
            // For efficiency, caller might pass a map, but requirement says "records"
            // We'll assume 'records' is an array of Mongoose documents or plain objects.
            const record = records.find(r =>
                r.studentId.toString() === student._id.toString() &&
                r.sessionId.toString() === session._id.toString()
            );

            const status = record ? record.status : '-';
            rowData[session._id.toString()] = status;
        });

        const row = worksheet.addRow(rowData);

        // 3. Conditional Formatting
        sortedSessions.forEach(session => {
            const cell = row.getCell(session._id.toString());
            const val = cell.value;

            if (val === 'P') {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC6EFCE' } // Light Green
                };
            } else if (val === 'A') {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' } // Light Red
                };
            }
        });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = { generateMonthlyExcel };
