// src/pages/teacher/Attendance.jsx

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import ImageUpload from "../../components/attendance/ImageUpload";
import AttendanceLegend from "../../components/attendance/AttendanceLegend";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import Loader from "../../components/common/Loader";
import { useAttendanceStore } from "../../app/store";
import { uploadClassroomImages, submitAttendance } from "../../api/attendance.api";
import { listMyClassesApi } from "../../api/classes.api";
import { useEffect, useMemo, useState } from "react";

const Attendance = () => {
  // Access global state
  const {
    stage, images, attendanceData,
    setStage, setImages, setAttendanceData,
    sessionId,
    setSessionId,
    toggleStudentStatus, resetFlow,
    syncInitialStatuses
  } = useAttendanceStore();

  const [activeClass, setActiveClass] = useState(null);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadClasses = async () => {
      try {
        setClassesLoading(true);
        const classes = await listMyClassesApi();
        if (!alive) return;
        setActiveClass(classes?.[0] || null);
      } catch (error) {
        console.error("Failed to load classes", error);
        if (alive) setActiveClass(null);
      } finally {
        if (alive) setClassesLoading(false);
      }
    };

    loadClasses();
    return () => {
      alive = false;
    };
  }, []);

  const summary = useMemo(() => {
    const present = (attendanceData || []).filter((s) => s.status === "P");
    const absent = (attendanceData || []).filter((s) => s.status === "A");
    return {
      total: (attendanceData || []).length,
      present,
      absent,
    };
  }, [attendanceData]);

  const handleProcessImages = async () => {
    if (images.length === 0) return;
    if (classesLoading) return;
    if (!activeClass?.id) {
      console.error("No class available for attendance.");
      return;
    }

    setStage("processing");

    try {
      const response = await uploadClassroomImages({
        classId: activeClass.id,
        files: images,
        sessionId,
      });

      setSessionId(response.sessionId || null);
      setAttendanceData(response.records || []);
      setStage("preview");
    } catch (error) {
      console.error("Failed to process images", error);
      setStage("upload"); // Revert on error
    }
  };

  const handleSubmit = async () => {
    try {
      if (!sessionId) {
        console.error("Missing sessionId; cannot submit attendance edits.");
        return;
      }

      const updates = (attendanceData || [])
        .filter((r) => r?.id && r?.status && r?.initialStatus && r.status !== r.initialStatus)
        .map((r) => ({ recordId: r.id, status: r.status }));

      if (updates.length > 0) {
        await submitAttendance(sessionId, updates);
        syncInitialStatuses();
      }
      setStage("submitted");
    } catch (error) {
      console.error("Submission failed");
    }
  };

  // Helper for progress stepper UI
  const StepIndicator = ({ currentStage }) => {
    const steps = ["Upload", "Verify", "Done"];
    const activeIdx = currentStage === "upload" ? 0 : currentStage === "submitted" ? 2 : 1;

    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= activeIdx ? 'bg-[#2D3748] text-[#FBFDFF]' : 'bg-[#FBFDFF] text-[#2D3748]/40 border border-[#2D3748]/10'}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-semibold ${i <= activeIdx ? 'text-[#0E0E11]' : 'text-[#2D3748]/40'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-[#2D3748]/10 ml-2" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0E0E11] tracking-tight">Take Attendance</h1>
        <p className="text-[#2D3748]/60 mt-1 font-medium">
          Our AI will detect faces from your classroom photos.
          {activeClass?.name ? ` (Class: ${activeClass.name})` : ""}
        </p>
      </div>

      <StepIndicator currentStage={stage} />

      <AnimatePresence mode="wait">
        {/* STAGE: UPLOAD */}
        {stage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#FBFDFF] p-6 rounded-2xl shadow-sm border border-[#2D3748]/5">
              <ImageUpload images={images} setImages={setImages} />

              <div className="mt-8 flex flex-col items-center gap-4">
                <button
                  disabled={images.length === 0 || classesLoading || !activeClass?.id}
                  onClick={handleProcessImages}
                  style={{ cursor: images.length > 0 && !classesLoading && activeClass?.id ? 'pointer' : 'not-allowed' }}
                  className={`w-full md:w-auto px-10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 
                    ${images.length === 0 || classesLoading || !activeClass?.id ? "bg-[#F2F8FF] text-[#2D3748]/40 border border-[#2D3748]/10" : "bg-[#2D3748] text-[#FBFDFF] hover:bg-[#0E0E11] shadow-lg shadow-[#2D3748]/20"}`}
                >
                  <Sparkles size={18} />
                  Start AI Recognition
                </button>
                <p className="text-xs text-[#2D3748]/50">Upload 1 to 4 images for best accuracy</p>
                {!classesLoading && !activeClass?.id && (
                  <p className="text-xs text-rose-500/80">No class assigned to this teacher.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE: PROCESSING */}
        {stage === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-16 flex flex-col items-center gap-6"
          >
            <Loader size="large" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#0E0E11]">Analyzing Classroom...</h3>
              <p className="text-[#2D3748]/60 mt-1 font-medium">Identifying students and matching records.</p>
            </div>
          </motion.div>
        )}

        {/* STAGE: PREVIEW & EDIT */}
        {stage === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <AttendanceLegend />
              <button
                onClick={resetFlow}
                style={{ cursor: 'pointer' }}
                className="flex items-center gap-2 text-sm font-semibold text-[#2D3748]/60 hover:text-[#0E0E11] transition-colors"
              >
                <RotateCcw size={16} /> Re-upload Images
              </button>
            </div>

            <div className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#2D3748]/40">Summary</div>
                  <div className="text-sm text-[#2D3748]/70 mt-1">
                    Total: <span className="font-bold text-[#0E0E11]">{summary.total}</span> &nbsp;•&nbsp; Present:{" "}
                    <span className="font-bold text-[#2D3748]">{summary.present.length}</span> &nbsp;•&nbsp; Absent:{" "}
                    <span className="font-bold text-rose-500/80">{summary.absent.length}</span>
                  </div>
                </div>

                <div className="text-xs text-[#2D3748]/50">
                  Detected (P) roll nos: {summary.present.map((s) => s.rollNo).filter(Boolean).join(", ") || "—"}
                  <br />
                  Absent (A) roll nos: {summary.absent.map((s) => s.rollNo).filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden overflow-x-auto">
              <AttendanceTable data={attendanceData} onToggle={toggleStudentStatus} />
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4">
              <button
                onClick={handleSubmit}
                style={{ cursor: 'pointer' }}
                className="px-8 py-3 rounded-xl bg-[#2D3748] text-[#FBFDFF] font-bold hover:bg-[#0E0E11] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D3748]/20"
              >
                <ShieldCheck size={18} />
                Confirm & Submit
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE: SUBMITTED */}
        {stage === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-12 text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-[#F2F8FF] text-[#2D3748] rounded-full flex items-center justify-center mx-auto border border-[#2D3748]/10">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0E0E11]">Submission Complete!</h2>
              <p className="text-[#2D3748]/60 mt-2 font-medium">Attendance for Class 10-A has been recorded and synced.</p>
            </div>
            <button
              onClick={resetFlow}
              style={{ cursor: 'pointer' }}
              className="w-full py-3 bg-[#2D3748] text-[#FBFDFF] font-bold rounded-xl hover:bg-[#0E0E11] transition-colors"
            >
              Take Another Attendance
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;