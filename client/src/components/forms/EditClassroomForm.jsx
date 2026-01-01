import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { X, Calendar, GraduationCap, School, User } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const EditClassroomForm = ({ isOpen, onClose, classroom }) => {
  const { teachers, updateClassroom } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const teacherOptions = useMemo(
    () => (Array.isArray(teachers) ? teachers : []).map((t) => ({ id: t.id, name: t.name })),
    [teachers]
  );

  const initial = useMemo(
    () => ({
      year: classroom?.year || '',
      std: classroom?.std || '',
      div: classroom?.div || '',
      classTeacherId: classroom?.classTeacherId || '',
      name: classroom?.name || '',
    }),
    [classroom?.year, classroom?.std, classroom?.div, classroom?.classTeacherId, classroom?.name]
  );

  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (isOpen) setFormData(initial);
  }, [isOpen, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // basic client-side constraints
    const stdValue = String(formData.std || '').trim();
    const divValue = String(formData.div || '').trim().toUpperCase();

    if (!/^\d+$/.test(stdValue)) {
      setError('Standard must be an integer number (e.g., 5)');
      return;
    }

    if (!/^[A-Z]$/.test(divValue)) {
      setError('Division must be a single alphabet character (e.g., A)');
      return;
    }

    setSubmitting(true);
    try {
      await updateClassroom(classroom.id, {
        ...formData,
        std: stdValue,
        div: divValue,
      });
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to update classroom');
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
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Motion.div
            className="bg-(--primary-bg) w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--primary-accent-rgb)/0.1)]"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="bg-(--primary-accent) p-6 flex justify-between items-center text-(--primary-bg)">
              <div>
                <h3 className="text-xl font-bold">Edit Classroom</h3>
                <p className="text-(--secondary-accent) text-sm opacity-90">Update classroom details</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">{error}</div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--primary-accent)">Educational Year</label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                  />
                  <input
                    type="text"
                    required
                    className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                    value={formData.year}
                    onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--primary-accent)">Standard</label>
                  <div className="relative">
                    <GraduationCap
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d+"
                      required
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                      value={formData.std}
                      onChange={(e) => {
                        const next = e.target.value.replace(/[^0-9]/g, '');
                        setFormData((p) => ({ ...p, std: next }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--primary-accent)">Division</label>
                  <div className="relative">
                    <School
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                    />
                    <input
                      type="text"
                      inputMode="text"
                      pattern="[A-Za-z]"
                      maxLength={1}
                      required
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                      value={formData.div}
                      onChange={(e) => {
                        const next = String(e.target.value || '')
                          .replace(/[^a-zA-Z]/g, '')
                          .toUpperCase()
                          .slice(0, 1);
                        setFormData((p) => ({ ...p, div: next }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--primary-accent)">Class Teacher</label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                  />
                  <select
                    required
                    className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                    value={formData.classTeacherId}
                    onChange={(e) => setFormData((p) => ({ ...p, classTeacherId: e.target.value }))}
                  >
                    <option value="">Select Class Teacher</option>
                    {teacherOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--primary-accent)">Display Name (optional)</label>
                <input
                  type="text"
                  className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 px-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.1)] text-(--primary-accent) font-semibold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-(--primary-accent) text-(--primary-bg) font-bold shadow-[0_10px_15px_-3px_rgb(var(--primary-accent-rgb)/0.2),0_4px_6px_-4px_rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-(--primary-accent)"
                >
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default EditClassroomForm;
