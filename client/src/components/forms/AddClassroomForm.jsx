import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { X, School, GraduationCap, Calendar, User } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const AddClassroomForm = ({ isOpen, onClose }) => {
  const { teachers, createClassroom } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const teacherOptions = useMemo(
    () => (Array.isArray(teachers) ? teachers : []).map((t) => ({ id: t.id, name: t.name })),
    [teachers]
  );

  const [formData, setFormData] = useState({ year: '', std: '', div: '', classTeacherId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createClassroom(formData);
      setFormData({ year: '', std: '', div: '', classTeacherId: '' });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create classroom');
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
                <h3 className="text-xl font-bold">Add New Classroom</h3>
                <p className="text-(--secondary-accent) text-sm opacity-90">Create a new classroom entry</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[rgb(var(--primary-bg-rgb)/0.1)] rounded-full transition-colors"
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
                    placeholder="e.g. 2025-26"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                      required
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                      placeholder="e.g. 10"
                      value={formData.std}
                      onChange={(e) => setFormData({ ...formData, std: e.target.value })}
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
                      required
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                      placeholder="e.g. A"
                      value={formData.div}
                      onChange={(e) => setFormData({ ...formData, div: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
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

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.1)] text-(--primary-accent) font-semibold hover:bg-(--secondary-bg) transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-(--primary-accent) text-(--primary-bg) font-bold shadow-[0_10px_15px_-3px_rgb(var(--primary-accent-rgb)/0.2),0_4px_6px_-4px_rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-(--primary-accent)"
                >
                  {submitting ? 'Creating…' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AddClassroomForm;
