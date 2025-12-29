import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { createStudent, uploadSingleStudentPhoto } from "../../api/student.api";

const AddStudentForm = ({ isOpen, onClose, classroomId, onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    gender: "",
    dob: "",
    photo: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const rollNoNum = useMemo(() => Number(String(form.rollNo).trim()), [form.rollNo]);

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

    if (!classroomId) {
      setError("Missing classroom context");
      return;
    }

    if (!form.name?.trim() || !String(form.rollNo).trim()) {
      setError("Name and Roll No are required");
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
      // 1) Create student record
      await createStudent({
        classId: classroomId,
        name: form.name.trim(),
        rollNumber: rollNoNum,
        dob: form.dob || null,
        gender: form.gender || null,
        profileImageUrl: null,
      });

      // 2) Upload photo using existing /bulk-photo-upload (packaged as single-file zip)
      if (form.photo) {
        await uploadSingleStudentPhoto({
          classId: classroomId,
          rollNumber: rollNoNum,
          file: form.photo,
        });
      }

      setForm({ name: "", rollNo: "", gender: "", dob: "", photo: null });
      await onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">
        <div className="bg-[#2D3748] text-white p-5 flex justify-between">
          <h3 className="font-bold">Add Student</h3>
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
            <label className="text-sm font-semibold">Student Photo (JPG/JPEG/PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] ?? null })}
            />
            <p className="text-xs text-gray-500">
              Filename must be{" "}
              <span className="font-semibold">
                {Number.isFinite(rollNoNum) && rollNoNum > 0 ? `${rollNoNum}.jpg` : "<rollNo>.jpg"}
              </span>{" "}
              (roll number as the name).
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button disabled={submitting} type="button" onClick={onClose} className="flex-1 border rounded p-2">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="flex-1 bg-[#2D3748] text-white rounded p-2">
              {submitting ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;
