import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, Mail, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const EditTeacherForm = ({ isOpen, onClose, teacher }) => {
  const { updateTeacher } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    if (isOpen) setFormData(initial);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0E11]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FBFDFF] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2D3748]/10">
        <div className="bg-[#2D3748] p-6 flex justify-between items-center text-[#FBFDFF]">
          <div>
            <h3 className="text-xl font-bold">Edit Teacher</h3>
            <p className="text-[#85C7F2] text-sm opacity-90">Update faculty account</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#FBFDFF]/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D3748]">Full Name</label>
            <div className="relative">
              <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <input
                type="text"
                required
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D3748]">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <input
                type="email"
                required
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D3748]">New Password (optional)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <input
                type="password"
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
            className="w-full flex items-center justify-between rounded-xl border border-[#2D3748]/10 bg-white px-4 py-3"
          >
            <span className="text-sm font-semibold text-[#2D3748]">Account status</span>
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#2D3748]/10 text-[#2D3748] font-semibold hover:bg-[#F2F8FF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D3748] text-[#FBFDFF] font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-[#2D3748]"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherForm;
