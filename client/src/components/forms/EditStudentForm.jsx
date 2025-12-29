import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { updateStudent, uploadSingleStudentPhoto } from "../../api/student.api";

const EditStudentForm = ({ isOpen, onClose, student, classroomId, onUpdated }) => {
  const [form, setForm] = useState({ name: "", rollNo: "", gender: "", dob: "", photo: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const rollNoNum = useMemo(() => Number(String(form.rollNo).trim()), [form.rollNo]);

  useEffect(() => {
    if (!isOpen || !student) return;
    setForm({
      name: student.name || "",
      rollNo: String(student.rollNo ?? ""),
      gender: student.gender === "Male" ? "M" : student.gender === "Female" ? "F" : student.gender || "",
      dob: (student.dob && String(student.dob).slice(0, 10)) || "",
      photo: null,
    });
    setError("");
  }, [isOpen, student]);

  if (!isOpen) return null;

  const validatePhoto = (file, rollNumber) => {
    if (!file) return null;

    const name = file.name || "";
    const parts = name.split(".");
    if (parts.length < 2) return "Photo filename must be <rollNumber>.<jpg|jpeg|png>";

    const ext = parts.pop()?.toLowerCase();
    const base = parts.join(".");

    if (!/^(jpg|jpeg|png)$/.test(ext || "")) return "Only JPG, JPEG, PNG files are allowed.";
    if (!/^\d+$/.test(base)) return "Photo filename must start with digits (roll number).";
    if (Number(base) !== Number(rollNumber)) return `Photo filename must be ${rollNumber}.${ext}`;

    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!student?.id) {
      setError("Missing student");
      return;
    }

    if (!form.name?.trim()) {
      setError("Name is required");
      return;
    }

    if (!Number.isFinite(rollNoNum) || rollNoNum <= 0) {
      setError("Roll No must be a valid positive number");
      return;
    }

    const photoErr = validatePhoto(form.photo, rollNoNum);
    if (photoErr) {
      setError(photoErr);
      return;
    }

    setSubmitting(true);
    try {
      await updateStudent(student.id, {
        name: form.name.trim(),
        rollNumber: rollNoNum,
        gender: form.gender || null,
        dob: form.dob || null,
      });

      if (form.photo) {
        // Server ZIP photo endpoint needs classId + rollNumber
        await uploadSingleStudentPhoto({ classId: classroomId || student.classId, rollNumber: rollNoNum, file: form.photo });
      }

      await onUpdated?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">
        <div className="bg-[#2D3748] text-white p-5 flex justify-between">
          <h3 className="font-bold">Edit Student</h3>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={submit}>
          {error && <div className="text-sm font-semibold rounded-lg px-3 py-2 bg-red-50 text-red-700">{error}</div>}

          <input
            className="w-full border p-2 rounded"
            placeholder="Student Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Roll No"
            inputMode="numeric"
            value={form.rollNo}
            onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
          />

          <select
            className="w-full border p-2 rounded"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold">Replace Photo (JPG/JPEG/PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] ?? null })}
            />
            <p className="text-xs text-gray-500">
              Filename must be <span className="font-semibold">{Number.isFinite(rollNoNum) && rollNoNum > 0 ? `${rollNoNum}.jpg` : "<rollNo>.jpg"}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button disabled={submitting} type="button" onClick={onClose} className="flex-1 border rounded p-2">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="flex-1 bg-[#2D3748] text-white rounded p-2">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentForm;
