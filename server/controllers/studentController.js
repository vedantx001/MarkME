// /server/controllers/studentController.js
const Student = require("../model/Student");
const Classroom = require("../model/Classroom");
const School = require("../model/School");
const excelParser = require("../utils/excelParser");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryHelper");

exports.getStudents = async (req, res) => {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const students = await Student.find({ classId }).sort({ rollNumber: 1 });
    res.json(students);

  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createStudent = async (req, res) => {
  try {
    const user = req.user;
    const { classId, name, rollNumber, dob, gender, profileImageUrl } = req.body;

    if (!classId || !name || !rollNumber) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const classExists = await Classroom.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Classroom not found." });

    // Prevent duplicate roll numbers
    const existing = await Student.findOne({ classId, rollNumber });
    if (existing) return res.status(400).json({ message: "Roll number already exists in this class." });

    const newStudent = await Student.create({
      schoolId: user.schoolId,
      classId,
      name,
      rollNumber,
      dob,
      gender,
      profileImageUrl
    });

    res.status(201).json(newStudent);

  } catch (err) {
    console.error("createStudent error:", err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
};


// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const updated = await Student.findByIdAndUpdate(
      studentId,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Student not found." });

    res.json(updated);

  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Find Student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 2. Handle Cloudinary Image Deletion
    if (student.profileImageUrl) {
      try {
        // Extract public_id from secure URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1570979139/folder/sample.jpg

        // 1. Split by '/upload/'
        const parts = student.profileImageUrl.split('/upload/');

        if (parts.length === 2) {
          let publicIdWithVersion = parts[1];

          // 2. Remove version if present (e.g., v123456789/)
          // Cloudinary versions start with 'v' followed by numbers and a slash
          const versionRegex = /^v\d+\//;
          let publicIdWithExt = publicIdWithVersion.replace(versionRegex, '');

          // 3. Remove file extension
          const lastDotIndex = publicIdWithExt.lastIndexOf('.');
          let publicId = publicIdWithExt;
          if (lastDotIndex !== -1) {
            publicId = publicIdWithExt.substring(0, lastDotIndex);
          }

          if (publicId) {
            await deleteFromCloudinary(publicId);
            console.log(`Deleted Cloudinary image: ${publicId}`);
          }
        }

      } catch (cloudErr) {
        // Non-blocking error
        console.error("Cloudinary deletion failed, but proceeding with student deletion:", cloudErr);
      }
    }

    // 3. Delete Student from MongoDB
    await Student.findByIdAndDelete(studentId);

    res.json({ message: "Student deleted." });

  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// BULK UPLOAD
exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required." });

    const { classId } = req.body;
    if (!classId) return res.status(400).json({ message: "classId required." });

    const classExists = await Classroom.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Classroom not found." });

    const parsed = await excelParser(req.file.path);

    let results = [];
    let validRows = [];

    for (let row of parsed) {
      let errors = [];

      if (!row.name) errors.push("name required");
      if (!row.rollNumber) errors.push("rollNumber required");

      if (errors.length) {
        results.push({ row: row.rowIndex, success: false, errors });
        continue;
      }

      // Check DB duplicates
      const exists = await Student.findOne({ classId, rollNumber: row.rollNumber });
      if (exists) {
        results.push({
          row: row.rowIndex,
          success: false,
          errors: ["Duplicate rollNumber in DB"]
        });
        continue;
      }

      validRows.push({
        schoolId: req.user.schoolId,
        classId,
        name: row.name,
        rollNumber: row.rollNumber,
        dob: row.dob || null,
        gender: row.gender || null,
        profileImageUrl: row.profileImageUrl || null
      });

      results.push({ row: row.rowIndex, success: true, errors: [] });
    }

    if (validRows.length > 0) {
      await Student.insertMany(validRows, { ordered: false });
    }

    res.json({ uploaded: validRows.length, results });

  } catch (err) {
    console.error("bulkUpload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateStudentProfileImage = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    // 1. Find Student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 2. Fetch related data for path: School Name & Class Name
    // req.user.schoolId should match student.schoolId usually, but let's use the student's data source of truth or req.user as reliable context.
    // The requirement says: "Use req.user.schoolId (or schoolName if available)"
    // And path: <schoolName>/students/<className>/face-images/

    // We need the School Name
    const school = await School.findById(req.user.schoolId);
    if (!school) return res.status(404).json({ message: "School not found." });

    // We need the Class Name
    const classroom = await Classroom.findById(student.classId);
    if (!classroom) return res.status(404).json({ message: "Classroom not found (linked to student)." });

    const schoolName = school.name.trim(); // Sanitize if needed? Cloudinary handles spaces usually, but allow standard string
    const className = classroom.name.trim();

    // 3. Construct Path
    // Pattern: <schoolName>/students/<className>/face-images/
    const folderPath = `${schoolName}/students/${className}/face-images/`;

    // 4. Upload to Cloudinary
    // Use rollNumber as public_id
    const publicId = student.rollNumber; // Ensure this is string

    const imageUrl = await uploadToCloudinary(req.file.buffer, folderPath, publicId.toString());

    // 5. Update Student
    student.profileImageUrl = imageUrl;
    await student.save();

    // 6. Return updated student
    res.json(student);

  } catch (err) {
    console.error("updateStudentProfileImage error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
