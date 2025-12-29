// src/api/student.api.js

import { apiFetch } from "./http";

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=11";

function formatDateOnly(value) {
  if (!value) return "—";

  // Common case: ISO string -> "YYYY-MM-DDTHH:mm:ss..."
  const asString = String(value);
  if (asString.includes("T")) {
    const datePart = asString.split("T")[0];
    return datePart || "—";
  }

  // Already looks like YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) return asString;

  // Fallback: try parsing, then format in a human-readable way.
  const d = new Date(asString);
  if (Number.isNaN(d.getTime())) return asString;

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const toUiStudent = (s) => ({
  id: s?._id || s?.id,
  rollNo: s?.rollNumber ?? s?.rollNo,
  name: s?.name || "—",
  gender: s?.gender || "—",
  dob: formatDateOnly(s?.dob),
  photo: s?.profileImageUrl || s?.photo || DEFAULT_AVATAR,
  classId: s?.classId,
});

// ------------ Classroom list for teacher/admin grids ------------
export const fetchClassroomStudents = async (classId) => {
  const data = await apiFetch(`/students?classId=${encodeURIComponent(classId)}`, { method: "GET", auth: true });
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(toUiStudent);
};

// ------------ Student CRUD (admin/teacher) ------------
export const createStudent = async ({ classId, name, rollNumber, dob, gender, profileImageUrl }) => {
  const created = await apiFetch("/students", {
    method: "POST",
    auth: true,
    body: { classId, name, rollNumber, dob, gender, profileImageUrl },
  });
  return toUiStudent(created);
};

export const updateStudent = async (studentId, payload) => {
  const updated = await apiFetch(`/students/${studentId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
  return toUiStudent(updated);
};

export const deleteStudent = async (studentId) => {
  return apiFetch(`/students/${studentId}`, { method: "DELETE", auth: true });
};

// ------------ Bulk upload (excel + zip) ------------
export const bulkUploadStudentsExcel = async ({ classId, file }) => {
  const form = new FormData();
  form.append("classId", classId);
  form.append("file", file);
  return apiFetch("/students/bulk-upload", { method: "POST", auth: true, body: form });
};

export const bulkUploadStudentPhotosZip = async ({ classId, file }) => {
  const form = new FormData();
  form.append("classId", classId);
  form.append("file", file);
  return apiFetch("/students/bulk-photo-upload", { method: "POST", auth: true, body: form });
};

// ------------ Teacher Student detail page helpers ------------
// NOTE: The UI currently expects these functions. Server does not yet expose detailed student + streak endpoints.
// Keeping them mocked so pages don't break; can be swapped to real endpoints later.

const MOCK_STUDENT_DETAIL = {
  id: "1",
  name: "Aarav Patel",
  rollNo: 1,
  email: "aarav.patel@school.com",
  phone: "+91 98765 43210",
  attendancePercentage: 88,
  totalPresents: 22,
  totalAbsents: 3,
};

// Generator for Academic Year 2025-26 (June 1, 2025 to April 30, 2026)
const generateAcademicYearHistory = () => {
  const result = [];
  const start = new Date("2025-06-01");
  const end = new Date("2026-04-30");
  const today = new Date();

  const absences = ["2025-07-10", "2025-08-15", "2025-09-02", "2025-11-20", "2025-12-18", "2026-01-15"];
  const absenceSet = new Set(absences);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let status = null;
    if (d <= today && !isWeekend) {
      status = absenceSet.has(dateStr) ? "A" : "P";
    }

    result.push({
      date: dateStr,
      status,
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "long" }),
      year: d.getFullYear(),
      dayOfWeek: d.getDay(),
    });
  }
  return result;
};

export const fetchStudentDetail = async (studentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_STUDENT_DETAIL, id: studentId });
    }, 250);
  });
};

export const fetchStudentStreak = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateAcademicYearHistory());
    }, 250);
  });
};

// Browser-only helper: build a ZIP in-memory for the server's /bulk-photo-upload endpoint.
// (Server expects a ZIP, even for one photo.)
async function buildSinglePhotoZip({ rollNumber, file }) {
  const mod = await import("jszip");
  const JSZip = mod.default || mod;

  const zip = new JSZip();
  const ext = (file.name || "").split(".").pop()?.toLowerCase() || "jpg";
  zip.file(`${rollNumber}.${ext}`, file);

  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], `student-${rollNumber}.zip`, { type: "application/zip" });
}

export const uploadSingleStudentPhoto = async ({ classId, rollNumber, file }) => {
  const zipFile = await buildSinglePhotoZip({ rollNumber, file });
  return bulkUploadStudentPhotosZip({ classId, file: zipFile });
};
