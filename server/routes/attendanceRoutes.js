const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const AttendanceRecord = require("../models/AttendanceRecord.js");
const Classroom = require("../models/Classroom.js");
const Student = require("../models/Student.js");
const Photo = require("../models/Photo.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Multer setup to handle image uploads (memory, we forward to AI service)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helpers
function normalizeDate(d = new Date()) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

// ===============================
// POST /api/attendance/:classId
// Upload image(s), send to FastAPI service, create/update record for the day
// ===============================
router.post("/:classId", authMiddleware, upload.array("images", 6), async (req, res) => {
  try {
    if (!["teacher", "admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { classId } = req.params;
    const classroom = await Classroom.findById(classId);
    if (!classroom) return res.status(404).json({ msg: "Class not found" });

    // If teacher, ensure they own the classroom
    if (req.user.role === "teacher" && String(classroom.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ msg: "You can only mark attendance for your own classroom" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No images uploaded" });
    }

    const forceRefresh = String(req.query.refresh || "").toLowerCase() === "true";

    const students = await Student.find({ classroomId: classId });
    const nameMap = new Map();
    students.forEach(s => nameMap.set(s.name.trim().toLowerCase(), s));
    students.forEach(s => nameMap.set(String(s.rollNo).trim().toLowerCase(), s));

    const recognizedNames = new Set();

    // Determine whether to attach classroomId to AI service.
    // Attach only when the classroom has at least one student (preferably with a photoId).
    let attachClassroomId = false;
    try {
      if (students && students.length > 0) {
        const hasPhoto = students.some(s => !!s.photoId);
        // Attach if at least one student exists. Prefer attaching when photoIds exist.
        attachClassroomId = hasPhoto || students.length > 0;
      }
    } catch (e) {
      attachClassroomId = false;
    }

    // Send all images to FastAPI (parallel)
    await Promise.all(
      req.files.map(async (file) => {
        try {
          // Save photo document first
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          await Photo.create({
            ownerType: 'classroom',
            ownerId: classroom._id,
            url: base64,
            storage: 'local'
          });

          // Build form
          const sendToAI = async (includeClassroom) => {
            const form = new FormData();
            form.append("file", file.buffer, { filename: file.originalname });
            if (includeClassroom) {
              form.append("classroomId", classId);
            }
            if (forceRefresh) form.append("refresh", "true");
            const response = await axios.post(
              process.env.FASTAPI_URL || "http://127.0.0.1:8000/mark-attendance/",
              form,
              { headers: form.getHeaders(), timeout: 30000 }
            );
            return response.data;
          };

          // First attempt: include classroomId (only if attachClassroomId true)
          let aiData = null;
          if (attachClassroomId) {
            try {
              aiData = await sendToAI(true);
            } catch (e) {
              console.warn("AI service error (with classroomId) for file", file.originalname, e.message);
            }
          } else {
            // don't include classroom id
            try {
              aiData = await sendToAI(false);
            } catch (e) {
              console.warn("AI service error (GLOBAL preferred) for file", file.originalname, e.message);
            }
          }

          // If first attempt included classroomId but AI returned zero references (common when stored as ObjectId),
          // retry WITHOUT classroomId to allow GLOBAL matching.
          if (aiData && aiData.reference_count === 0 && attachClassroomId) {
            console.log(`[Attendance] AI returned 0 references for class ${classId}. Retrying without classroomId (GLOBAL mode).`);
            try {
              const retryData = await sendToAI(false);
              if (retryData) aiData = retryData;
            } catch (retryErr) {
              console.warn("AI retry (GLOBAL) error for file", file.originalname, retryErr.message);
            }
          }

          // Process AI result if any
          if (aiData) {
            if (aiData.reference_count === 0) {
              console.warn(`[Attendance] AI reported 0 references for file ${file.originalname}.`);
            }
            const arr = Array.isArray(aiData.recognized_students) ? aiData.recognized_students : [];
            arr.forEach(n => {
              if (typeof n === 'string') {
                const cleaned = n.trim().toLowerCase();
                if (cleaned && cleaned !== 'unknown') recognizedNames.add(cleaned);
              }
            });
            if (aiData.threshold) {
              console.log(`[Attendance] AI threshold=${aiData.threshold}`);
            }
            if (aiData.debug) {
              try {
                const byFace = {};
                aiData.debug.forEach(d => {
                  const f = d.face || 0;
                  if (!byFace[f]) byFace[f] = [];
                  byFace[f].push(d);
                });
                Object.entries(byFace).forEach(([f, list]) => {
                  const sorted = list.sort((a,b) => a.dist - b.dist).slice(0,3);
                  console.log(`[Attendance] Face ${f} top candidates:`, sorted.map(s => `${s.candidate}:${s.dist.toFixed(3)}`));
                });
              } catch {}
            }
          }

        } catch (aiErr) {
          console.warn("AI service error for file", file.originalname, aiErr.message);
        }
      })
    );

    console.log(`[Attendance] AI recognized (filtered) ->`, Array.from(recognizedNames));

    const today = normalizeDate();

    // Build entries
    const entries = students.map(stu => ({
      studentId: stu._id,
      status: recognizedNames.has(stu.name.trim().toLowerCase()) ? "present" : "absent",
      matchedEmbeddingId: null
    }));

    // Upsert attendance record for the day
    let attendance = await AttendanceRecord.findOne({ classroomId: classId, date: today });
    if (attendance) {
      attendance.entries = entries;
      attendance.teacherId = attendance.teacherId || req.user.id;
      await attendance.save();
    } else {
      attendance = await AttendanceRecord.create({
        classroomId: classId,
        date: today,
        entries,
        teacherId: req.user.id
      });
    }

    const populated = await AttendanceRecord.findById(attendance._id)
      .populate("entries.studentId", "name rollNo")
      .populate("teacherId", "name email");

    res.status(200).json({
      msg: "Attendance marked successfully",
      recognized: Array.from(recognizedNames),
      record: populated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
});

// ... (other routes unchanged) ...

// GET /api/attendance/:classId (optional ?date=YYYY-MM-DD)
router.get("/:classId", authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const dateParam = req.query.date ? new Date(req.query.date) : new Date();
    if (isNaN(dateParam)) return res.status(400).json({ msg: "Invalid date" });

    const day = normalizeDate(dateParam);

    const attendance = await AttendanceRecord.findOne({ classroomId: classId, date: day })
      .populate("entries.studentId", "name rollNo")
      .populate("teacherId", "name email");

    if (!attendance) {
      return res.status(200).json({
        _id: null,
        classroomId: classId,
        date: day,
        entries: [],
        teacherId: null
      });
    }

    res.status(200).json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/attendance/:classId/range
router.get("/:classId/range", authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ msg: "start and end required" });
    const s = normalizeDate(new Date(start));
    const e = normalizeDate(new Date(end));
    if (isNaN(s) || isNaN(e)) return res.status(400).json({ msg: "Invalid date(s)" });
    if (e < s) return res.status(400).json({ msg: "end must be >= start" });

    const records = await AttendanceRecord.find({
      classroomId: classId,
      date: { $gte: s, $lte: e }
    })
      .sort({ date: 1 })
      .populate("entries.studentId", "name rollNo")
      .populate("teacherId", "name email");

    res.status(200).json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/attendance/:classId/latest
router.get("/:classId/latest", authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const record = await AttendanceRecord.findOne({ classroomId: classId })
      .sort({ date: -1 })
      .populate("entries.studentId", "name rollNo")
      .populate("teacherId", "name email");
    if (!record) return res.status(404).json({ msg: "No record found" });
    res.status(200).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/attendance/:recordId/entry/:studentId
router.patch("/:recordId/entry/:studentId", authMiddleware, async (req, res) => {
  try {
    if (!["teacher", "admin", "principal"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    const { recordId, studentId } = req.params;
    const { status } = req.body;
    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    const record = await AttendanceRecord.findById(recordId);
    if (!record) return res.status(404).json({ msg: "Attendance record not found" });

    const entry = record.entries.find(e => String(e.studentId) === String(studentId));
    if (!entry) return res.status(404).json({ msg: "Student entry not found in this record" });

    entry.status = status;
    await record.save();

    const populated = await AttendanceRecord.findById(recordId)
      .populate("entries.studentId", "name rollNo")
      .populate("teacherId", "name email");

    res.status(200).json({ msg: "Entry updated", record: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
