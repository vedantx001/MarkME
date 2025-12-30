import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { X, Users, Mail, Lock, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const EditTeacherForm = ({ isOpen, onClose, teacher }) => {
  const { updateTeacher } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initial = useMemo(
    () => ({
      name: teacher?.name || '',
      email: teacher?.email || '',
      password: '',
      isActive: teacher?.status === 'Active',
    }),
    [teacher?.name, teacher?.email, teacher?.status]
  );

  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (isOpen) {
      setFormData(initial);
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
    }
  }, [isOpen, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password) {
      if (!confirmPassword) {
        setError('Please confirm the new password');
        return;
      }
      if ((formData.password || '') !== (confirmPassword || '')) {
        setError('Passwords do not match');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        isActive: !!formData.isActive,
        ...(formData.password ? { password: formData.password } : {}),
      };
      await updateTeacher(teacher.id, payload);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to update teacher');
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
                <h3 className="text-xl font-bold">Edit Teacher</h3>
                <p className="text-(--secondary-accent) text-sm opacity-90">Update faculty account</p>
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
                <label className="text-sm font-semibold text-(--primary-accent)">Full Name</label>
                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                  />
                  <input
                    type="text"
                    required
                    className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--primary-accent)">Email Address</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                  />
                  <input
                    type="email"
                    required
                    className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--primary-accent)">New Password (optional)</label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-10 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.45)] hover:text-(--primary-accent) transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {formData.password ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--primary-accent)">Confirm New Password</label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-10 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.45)] hover:text-(--primary-accent) transition-colors"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
                className="w-full flex items-center justify-between rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.1)] bg-(--primary-bg) px-4 py-3"
              >
                <span className="text-sm font-semibold text-(--primary-accent)">Account status</span>
                <span className="flex items-center gap-2 text-sm font-bold">
                  {formData.isActive ? (
                    <>
                      <ToggleRight className="text-emerald-600" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="text-amber-600" /> Disabled
                    </>
                  )}
                </span>
              </button>

              <div className="pt-2 flex gap-3">
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

export default EditTeacherForm;
