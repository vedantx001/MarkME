// /server/utils/excelParser.js
const xlsx = require("xlsx");

module.exports = function parseExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
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
        profileImageUrl: row.profileImageUrl || ""
      });

      rowIndex++;
    }

    return parsed;

  } catch (err) {
    console.error("Excel parser error:", err);
    throw err;
  }
};
