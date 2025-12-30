import { X, Upload, FileSpreadsheet, Images } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { bulkUploadStudentsExcel, bulkUploadStudentPhotosZip } from "../../api/student.api";

const BulkStudentUploadForm = ({ isOpen, onClose, classroomId, onUploaded, mode = "excel" }) => {
  const [excel, setExcel] = useState(null);
  const [zip, setZip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const title = useMemo(() => (mode === "zip" ? "Bulk Upload Photos" : "Bulk Upload Students"), [mode]);
  const description = useMemo(
    () => (mode === "zip" ? "Upload ZIP file containing student photos." : "Upload Excel sheet with student details."),
    [mode]
  );

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
    <AnimatePresence>
      {isOpen ? (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-[rgb(var(--primary-text-rgb)/0.5)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Motion.div
            className="bg-(--primary-bg) w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--primary-accent-rgb)/0.1)]"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="bg-(--primary-accent) p-6 flex justify-between items-center text-(--primary-bg)">
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-(--secondary-accent) text-sm opacity-90">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-[rgb(var(--primary-bg-rgb)/0.1)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={submit}>
              {error && (
                <div className="text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">
                  {error}
                </div>
              )}

              {mode === "excel" ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--primary-accent)">Excel File (.xlsx)</label>
                  <div className="relative">
                    <FileSpreadsheet
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                    />
                    <input
                      type="file"
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2 px-3 text-sm text-(--primary-text) pl-10 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-(--primary-accent) file:text-(--primary-bg) hover:file:opacity-80"
                      accept=".xlsx,.xls"
                      onChange={(e) => setExcel(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <p className="text-xs text-(--primary-accent) opacity-60 ml-1">
                    Upload Excel first to create student records, then upload ZIP for photos.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--primary-accent)">Photos ZIP (.zip)</label>
                  <div className="relative">
                    <Images
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                    />
                    <input
                      type="file"
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2 px-3 text-sm text-(--primary-text) pl-10 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-(--primary-accent) file:text-(--primary-bg) hover:file:opacity-80"
                      accept=".zip"
                      onChange={(e) => setZip(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <p className="text-xs text-(--primary-accent) opacity-60 ml-1">
                    ZIP must contain images named by rollNumber (e.g., 101.jpg).
                  </p>
                </div>
              )}

              <button
                disabled={submitting}
                className="w-full mt-4 bg-(--primary-accent) disabled:opacity-60 text-(--primary-bg) p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-(--primary-text) transition-all shadow-[0_10px_15px_-3px_rgb(var(--primary-accent-rgb)/0.2)] hover:-translate-y-0.5"
              >
                <Upload size={18} /> {submitting ? "Uploading..." : "Upload"}
              </button>

              {result && (
                <pre className="text-xs bg-gray-50 border rounded-xl p-3 overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </form>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default BulkStudentUploadForm;
