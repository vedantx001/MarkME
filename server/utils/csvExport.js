const excel = require('exceljs');

const generateMonthlyExcel = async (students, sessions, records, year, month) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Attendance');

    // 1. Determine Date Range
    // Goal: 1st of month to Today (if current month) or End of Month (if past)
    const today = new Date();

    // Ensure year/month are integers
    const reportYear = parseInt(year);
    const reportMonth = parseInt(month);

    const startDate = new Date(reportYear, reportMonth - 1, 1);

    // Check if the report month is the current month
    const isCurrentMonth = today.getFullYear() === reportYear && (today.getMonth() + 1) === reportMonth;

    let endDate;
    if (isCurrentMonth) {
        endDate = today;
    } else {
        // Last day of the specified month
        endDate = new Date(reportYear, reportMonth, 0);
    }

    // Helper to format date key YYYY-MM-DD
    const formatDateKey = (date) => {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Helper for header DD/MM/YYYY
    const formatHeaderDate = (date) => {
        return date.toLocaleDateString('en-GB');
    };

    // 2. Build Lookup Map
    // Map: combination of date_studentId -> status
    // First, map sessionId to Date Key
    const sessionDateMap = {}; // sessionId -> YYYY-MM-DD
    sessions.forEach(session => {
        if (session.date) {
            sessionDateMap[session._id.toString()] = formatDateKey(session.date);
        }
    });

    const lookupMap = new Map(); // Key: "YYYY-MM-DD_studentId" -> Val: status
    records.forEach(record => {
        const dateKey = sessionDateMap[record.sessionId.toString()];
        if (dateKey && record.studentId) {
            const key = `${dateKey}_${record.studentId.toString()}`;
            lookupMap.set(key, record.status);
        }
    });

    // 3. Define Columns
    // Static columns
    // Fix: Updated key to 'rollNumber' as requested
    const columns = [
        { header: 'Roll No', key: 'rollNumber', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
    ];

    // Dynamic columns: Iterate from startDate to endDate
    const dateKeys = []; // Keep track of column keys (YYYY-MM-DD) in order
    const currentDate = new Date(startDate);

    // Loop until we pass the endDate
    // Note: Compare using time value or consistent parts
    // To handle time part differences, reset time to midnight for loop
    currentDate.setHours(0, 0, 0, 0);
    const stopDate = new Date(endDate);
    stopDate.setHours(23, 59, 59, 999); // Include the end date fully

    while (currentDate <= stopDate) {
        const dateKey = formatDateKey(currentDate);
        const headerText = formatHeaderDate(currentDate);

        columns.push({ header: headerText, key: dateKey, width: 12 });
        dateKeys.push(dateKey);

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    worksheet.columns = columns;

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // 4. Add Rows
    students.forEach(student => {
        const rowData = {
            rollNumber: student.rollNumber || '-', // Updated field
            name: student.name
        };

        // Fill status for each date column
        dateKeys.forEach(dateKey => {
            const lookUpKey = `${dateKey}_${student._id.toString()}`;
            const status = lookupMap.get(lookUpKey);
            rowData[dateKey] = status || '-'; // Default to '-' if no record
        });

        const row = worksheet.addRow(rowData);

        // 5. Conditional Formatting
        dateKeys.forEach(dateKey => {
            const cell = row.getCell(dateKey);
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