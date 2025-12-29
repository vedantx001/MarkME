import { X, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { bulkUploadStudentsExcel, bulkUploadStudentPhotosZip } from "../../api/student.api";

const BulkStudentUploadForm = ({ isOpen, onClose, classroomId, onUploaded, mode = "excel" }) => {
  const [excel, setExcel] = useState(null);
  const [zip, setZip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const title = useMemo(() => (mode === "zip" ? "Bulk Upload Photos (ZIP)" : "Bulk Upload Students (Excel)"), [mode]);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!classroomId) {
      setError("Missing classroom context");
      return;
    }

    if (mode === "excel" && !excel) {
      setError("Please select an Excel file (.xlsx) first.");
      return;
    }

    if (mode === "zip" && !zip) {
      setError("Please select a Photos ZIP file (.zip). Upload Excel first.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "excel") {
        const r = await bulkUploadStudentsExcel({ classId: classroomId, file: excel });
        setResult(r);
      } else {
        const r = await bulkUploadStudentPhotosZip({ classId: classroomId, file: zip });
        setResult(r);
      }

      await onUploaded?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Bulk upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl">
        <div className="bg-[#2D3748] text-white p-5 flex justify-between">
          <h3 className="font-bold">{title}</h3>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={submit}>
          {error && <div className="text-sm font-semibold rounded-lg px-3 py-2 bg-red-50 text-red-700">{error}</div>}

          {mode === "excel" ? (
            <>
              <label className="block font-semibold">Excel File (.xlsx)</label>
              <input type="file" accept=".xlsx,.xls" onChange={(e) => setExcel(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-gray-500">Upload Excel first to create student records, then upload ZIP for photos.</p>
            </>
          ) : (
            <>
              <label className="block font-semibold">Photos ZIP (.zip)</label>
              <input type="file" accept=".zip" onChange={(e) => setZip(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-gray-500">ZIP must contain images named by rollNumber (e.g., 101.jpg).</p>
            </>
          )}

          <button
            disabled={submitting}
            className="w-full mt-4 bg-[#2D3748] disabled:opacity-60 text-white p-2 rounded flex items-center justify-center gap-2"
          >
            <Upload size={18} /> {submitting ? "Uploading..." : "Upload"}
          </button>

          {result && (
            <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </form>
      </div>
    </div>
  );
};

export default BulkStudentUploadForm;
