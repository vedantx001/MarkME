const Student = require('../model/Student');
const AttendanceSession = require('../model/AttendanceSession');
const AttendanceRecord = require('../model/AttendanceRecord');
const { generateCSV } = require('../utils/csvExport');
const mongoose  = require('mongoose');
// ---------------- SESSION SUMMARY ----------------
exports.sessionSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const records = await AttendanceRecord.find({ sessionId });

    let present = 0;
    let absent = 0;

    records.forEach(r => {
      if (r.status === 'P') present++;
      else absent++;
    });

    return res.status(200).json({
      success: true,
      data: {
        present,
        absent,
        total: records.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errors: error.message
    });
  }
};

// ---------------- MONTHLY CLASS REPORT ----------------
exports.classMonthlyReport = async (req, res) => {
  try {
    // const { classId, month } = req.params; // month = YYYY-MM
    const classId = new mongoose.Types.ObjectId(req.params.classId.trim());
    const month = req.params.month.trim();
    // 1️⃣ Get all sessions for this class & month
//     const startDate = new Date(`${month}-01`);
// const endDate = new Date(startDate);
// endDate.setMonth(endDate.getMonth() + 1);
    const [year, monthNum] = month.split('-').map(Number);

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 1));


const sessions = await AttendanceSession.find({
  classId,
  date: {
    $gte: startDate,
    $lt: endDate
  }
}).sort({ date: 1 });


    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        errors: 'No sessions found for this month'
      });
    }

    // 2️⃣ Get all students of the class
    const students = await Student.find({ classId });

    // 3️⃣ Build CSV rows
    const rows = [];

    for (const student of students) {
      let presentCount = 0;
      const row = [student.rollNumber, student.name];

      for (const session of sessions) {
        const record = await AttendanceRecord.findOne({
          sessionId: session._id,
          studentId: student._id
        });

        if (record && record.status === 'P') {
          row.push('P');
          presentCount++;
        } else {
          row.push('A');
        }
      }

      row.push(presentCount);
      rows.push(row);
    }

    // 4️⃣ CSV headers
    const headers = [
      'Roll No',
      'Name',
      ...sessions.map(s => s.date),
      'Total Present'
    ];

    // 5️⃣ Generate CSV
    const csv = generateCSV(headers, rows);

    // 6️⃣ Send as file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${month}.csv`
    );

    return res.send(csv);

  } catch (error) {
    return res.status(500).json({
      success: false,
      errors: error.message
    });
  }
};
