import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { X, User, Mail, Lock, School, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const EditAdminProfileForm = ({ isOpen, onClose }) => {
  const { adminProfile, schoolDetails, updateAdminProfile } = useAdmin();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initial = useMemo(
    () => ({
      adminName: adminProfile?.name || '',
      adminEmail: adminProfile?.email || '',
      adminGender: adminProfile?.gender || 'MALE',
      password: '',
      schoolName: schoolDetails?.name || '',
      schoolIdx: schoolDetails?.index || '',
      address: schoolDetails?.address || '',
    }),
    [adminProfile?.name, adminProfile?.email, adminProfile?.gender, schoolDetails?.name, schoolDetails?.index, schoolDetails?.address]
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
      await updateAdminProfile({
        admin: {
          name: formData.adminName,
          email: formData.adminEmail,
          gender: formData.adminGender,
          ...(formData.password ? { password: formData.password } : {}),
        },
        school: {
          name: formData.schoolName,
          schoolIdx: formData.schoolIdx,
          address: formData.address,
        },
      });
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-[rgb(var(--primary-text-rgb)/0.5)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Motion.div
            className="bg-(--primary-bg) w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--primary-accent-rgb)/0.1)] max-h-[92vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="bg-(--primary-accent) px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-start sm:items-center text-(--primary-bg)">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold">Edit Profile</h3>
                <p className="text-(--secondary-accent) text-xs sm:text-sm opacity-90">Update admin & school details</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
              {error && (
                <div className="text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">{error}</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Personal Details */}
                <div className="rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.1)] bg-(--primary-bg) p-5">
                  <h4 className="font-extrabold text-(--primary-text) mb-4">Admin Personal Details</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-(--primary-accent)">Full Name</label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                        />
                        <input
                          type="text"
                          required
                          className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                          value={formData.adminName}
                          onChange={(e) => setFormData((p) => ({ ...p, adminName: e.target.value }))}
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
                          value={formData.adminEmail}
                          onChange={(e) => setFormData((p) => ({ ...p, adminEmail: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-(--primary-accent)">Gender</label>
                      <select
                        className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 px-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                        value={formData.adminGender}
                        onChange={(e) => setFormData((p) => ({ ...p, adminGender: e.target.value }))}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
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
                  </div>
                </div>

                {/* School Details */}
                <div className="rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.1)] bg-(--primary-bg) p-5">
                  <h4 className="font-extrabold text-(--primary-text) mb-4">School Details</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-(--primary-accent)">School Name</label>
                      <div className="relative">
                        <School
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                        />
                        <input
                          type="text"
                          required
                          className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                          value={formData.schoolName}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-(--primary-accent)">School Index</label>
                      <div className="relative">
                        <School
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                        />
                        <input
                          type="text"
                          required
                          className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
                          value={formData.schoolIdx}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolIdx: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-(--primary-accent)">School Address</label>
                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3 top-1/4 -translate-y-1/2 text-[rgb(var(--primary-accent-rgb)/0.4)]"
                        />
                        <textarea
                          rows={3}
                          className="w-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 text-(--primary-text) focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all resize-none"
                          value={formData.address}
                          onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                          placeholder="Enter school address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-3 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.1)] text-(--primary-accent) font-semibold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] rounded-xl bg-(--primary-accent) text-(--primary-bg) font-bold shadow-[0_10px_15px_-3px_rgb(var(--primary-accent-rgb)/0.2),0_4px_6px_-4px_rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all sm:hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-(--primary-accent)"
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

export default EditAdminProfileForm;
