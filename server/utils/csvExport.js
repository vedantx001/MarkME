const excel = require('exceljs');

const generateMonthlyExcel = async (students, sessions, records, year, month) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Attendance');

    const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB7DEE8' } }; // Light Blue
    const ROLLNO_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }; // Light Gray
    const NAME_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; // Light Yellow

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

        columns.push({ header: headerText, key: dateKey, width: 15 });
        dateKeys.push(dateKey);

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    worksheet.columns = columns;

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 13 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell((cell) => {
        cell.fill = HEADER_FILL;
    });

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
                cell.font = { ...(cell.font || {}), bold: true, size: 13 };
            } else if (val === 'A') {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' } // Light Red
                };
                cell.font = { ...(cell.font || {}), bold: true, size: 13 };
            }
        });
    });

    // 6. Global styling (alignment, borders, font size, special column fills)
    const rowCount = worksheet.rowCount;
    const colCount = columns.length;

    for (let r = 1; r <= rowCount; r += 1) {
        const row = worksheet.getRow(r);
        for (let c = 1; c <= colCount; c += 1) {
            const cell = row.getCell(c);

            // Center align all text
            cell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Apply thin border on all sides
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Set font size 13 everywhere, preserve existing bold
            const existingFont = cell.font || {};
            const shouldBeBold = existingFont.bold === true || cell.value === 'P' || cell.value === 'A' || r === 1;
            cell.font = { ...existingFont, size: 13, bold: shouldBeBold };

            // Special fill for Roll No & Name columns (excluding header row)
            if (r > 1 && c === 1) {
                cell.fill = ROLLNO_FILL;
            }
            if (r > 1 && c === 2) {
                cell.fill = NAME_FILL;
            }
        }
        row.commit();
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = { generateMonthlyExcel };