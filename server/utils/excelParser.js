// /server/utils/excelParser.js
const xlsx = require("xlsx");

module.exports = function parseExcel(input) {
  try {
    let workbook;
    if (Buffer.isBuffer(input)) {
      workbook = xlsx.read(input, { type: 'buffer' });
    } else {
      workbook = xlsx.readFile(input);
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    let parsed = [];
    let rowIndex = 2; // row 1 = headers

    for (let row of rows) {
      parsed.push({
        rowIndex,
        name: row.name || "",
        rollNumber: row.rollNumber || "",
        dob: row.dob || "",
        gender: row.gender || "",
        profileImageUrl: row.profileImageUrl || "" // Ensure this maps correctly
      });

      rowIndex++;
    }

    return parsed;

  } catch (err) {
    console.error("Excel parser error:", err);
    throw err;
  }
};
