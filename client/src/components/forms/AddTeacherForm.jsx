import React, { useState } from 'react';
import { X, Users, Mail, Lock } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const AddTeacherForm = ({ isOpen, onClose }) => {
const { createTeacher } = useAdmin();
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');
const [formData, setFormData] = useState({ name: '', email: '', password: '' });

if (!isOpen) return null;

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setSubmitting(true);
try {
  await createTeacher(formData);
  setFormData({ name: '', email: '', password: '' });
  onClose();
} catch (err) {
  setError(err?.message || 'Failed to create teacher');
} finally {
  setSubmitting(false);
}
};

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0E11]/50 backdrop-blur-sm animate-in fade-in duration-200">
<div className="bg-[#FBFDFF] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2D3748]/10">

    <div className="bg-[#2D3748] p-6 flex justify-between items-center text-[#FBFDFF]">
      <div>
        <h3 className="text-xl font-bold">Add New Teacher</h3>
        <p className="text-[#85C7F2] text-sm opacity-90">Create a new faculty account</p>
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
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
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
            placeholder="john@school.edu"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#2D3748]">Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
          <input 
            type="password" 
            required
            className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
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
          disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D3748] text-[#FBFDFF] font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-[#2D3748]"
        >
          {submitting ? 'Creating…' : 'Create Teacher'}
        </button>
      </div>
    </form>
  </div>
</div>


);
};

export default AddTeacherForm;