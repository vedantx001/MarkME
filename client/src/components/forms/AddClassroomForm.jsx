import React, { useState } from 'react';
import { X, School, GraduationCap, Calendar, User } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const AddClassroomForm = ({ isOpen, onClose }) => {
  const { teachers, addClassroom } = useAdmin();
  const [formData, setFormData] = useState({ year: '', std: '', div: '', classTeacher: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addClassroom(formData);
    setFormData({ year: '', std: '', div: '', classTeacher: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0E11]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FBFDFF] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2D3748]/10">
        <div className="bg-[#2D3748] p-6 flex justify-between items-center text-[#FBFDFF]">
          <div>
            <h3 className="text-xl font-bold">Add New Classroom</h3>
            <p className="text-[#85C7F2] text-sm opacity-90">Create a new classroom entry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#FBFDFF]/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D3748]">Educational Year</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <input
                type="text"
                required
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                placeholder="e.g. 2025-26"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2D3748]">Standard</label>
              <div className="relative">
                <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
                <input
                  type="text"
                  required
                  className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                  placeholder="e.g. 10"
                  value={formData.std}
                  onChange={(e) => setFormData({ ...formData, std: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2D3748]">Division</label>
              <div className="relative">
                <School size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
                <input
                  type="text"
                  required
                  className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                  placeholder="e.g. A"
                  value={formData.div}
                  onChange={(e) => setFormData({ ...formData, div: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D3748]">Class Teacher</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <select
                required
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              >
                <option value="">Select Class Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#2D3748]/10 text-[#2D3748] font-semibold hover:bg-[#F2F8FF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D3748] text-[#FBFDFF] font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all hover:-translate-y-0.5"
            >
              Create Classroom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassroomForm;
