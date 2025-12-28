// src/pages/teacher/Attendance.jsx

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import ImageUpload from "../../components/attendance/ImageUpload";
import AttendanceLegend from "../../components/attendance/AttendanceLegend";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import Loader from "../../components/common/Loader";
import { useAttendanceStore } from "../../app/store";
import { uploadClassroomImages, submitAttendance } from "../../api/attendance.api";

const Attendance = () => {
  // Access global state
  const {
    stage, images, attendanceData,
    setStage, setImages, setAttendanceData,
    toggleStudentStatus, resetFlow
  } = useAttendanceStore();

  const handleProcessImages = async () => {
    if (images.length === 0) return;

    setStage("processing");

    try {
      const response = await uploadClassroomImages(new FormData()); // Mock upload
      if (response.success) {
        setAttendanceData(response.detectedStudents);
        setStage("preview");
      }
    } catch (error) {
      console.error("Failed to process images", error);
      setStage("upload"); // Revert on error
    }
  };

  const handleSubmit = async () => {
    try {
      await submitAttendance("class-10-a", "2024-12-24", attendanceData);
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= activeIdx ? 'bg-(--secondary-accent) text-white' : 'bg-(--secondary-bg) text-(--primary-text)/40'}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= activeIdx ? 'text-(--primary-accent)' : 'text-(--primary-text)/40'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-(--secondary-bg) ml-2" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-inter">
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-jakarta text-2xl md:text-3xl font-bold text-(--primary-text)">Take Attendance</h1>
        <p className="text-(--primary-text)/60 mt-1">Our AI will detect faces from your classroom photos.</p>
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
            <div className="bg-(--primary-bg) p-6 rounded-2xl border border-(--secondary-bg) shadow-sm">
              <ImageUpload images={images} setImages={setImages} />

              <div className="mt-8 flex flex-col items-center gap-4">
                <button
                  disabled={images.length === 0}
                  onClick={handleProcessImages}
                  style={{ cursor: images.length > 0 ? 'pointer' : 'not-allowed' }}
                  className={`w-full md:w-auto px-10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 
                    ${images.length === 0 ? "bg-(--secondary-bg) text-(--primary-text)/40" : "bg-(--primary-accent) text-white hover:bg-(--primary-text) shadow-lg"}`}
                >
                  <Sparkles size={18} />
                  Start AI Recognition
                </button>
                <p className="text-xs text-(--primary-text)/40">Upload 1 to 4 images for best accuracy</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE: PROCESSING */}
        {stage === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-(--primary-bg) rounded-2xl border border-(--secondary-bg) p-16 flex flex-col items-center gap-6 shadow-sm"
          >
            <Loader size="large" />
            <div className="text-center">
              <h3 className="font-jakarta text-xl font-bold text-(--primary-accent)">Analyzing Classroom...</h3>
              <p className="text-(--primary-text)/60 mt-1">Identifying students and matching records.</p>
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
                className="flex items-center gap-2 text-sm font-medium text-(--primary-text)/60 hover:text-(--primary-accent) transition-colors"
              >
                <RotateCcw size={16} /> Re-upload Images
              </button>
            </div>

            <div className="bg-(--primary-bg) rounded-2xl border border-(--secondary-bg) overflow-hidden shadow-sm overflow-x-auto">
              <AttendanceTable data={attendanceData} onToggle={toggleStudentStatus} />
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4">
              <button
                onClick={handleSubmit}
                style={{ cursor: 'pointer' }}
                className="px-8 py-3 rounded-xl bg-(--secondary-accent) text-(--primary-text) font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
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
            className="bg-(--primary-bg) rounded-2xl border border-(--secondary-bg) p-12 text-center space-y-6 shadow-sm max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-(--secondary-bg) text-(--secondary-accent) rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="font-jakarta text-2xl font-bold text-(--primary-accent)">Submission Complete!</h2>
              <p className="text-(--primary-text)/60 mt-2">Attendance for Class 10-A has been recorded and synced.</p>
            </div>
            <button
              onClick={resetFlow}
              style={{ cursor: 'pointer' }}
              className="w-full py-3 bg-(--secondary-bg) text-(--primary-accent) font-bold rounded-xl hover:opacity-90 transition-colors"
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