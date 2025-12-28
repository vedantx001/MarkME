import React, { useState } from 'react';
import { Search, Plus, Mail, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddTeacherForm from '../../components/forms/AddTeacherForm';

const Teachers = () => {
const { teachers } = useAdmin();
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

const filteredTeachers = teachers.filter(t =>
t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
t.subject.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
<div className="max-w-7xl mx-auto">
<AddTeacherForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

  {/* Header Section */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-bold text-[#0E0E11]">Teachers</h2>
      <p className="text-[#2D3748]/60">Manage your faculty members and their accounts.</p>
    </div>
    
    <div className="flex w-full md:w-auto gap-3">
      <div className="relative flex-1 md:w-64">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
        <input 
          type="text" 
          placeholder="Search teachers..." 
          className="w-full bg-[#FBFDFF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-[#2D3748] text-[#FBFDFF] px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Add New</span>
      </button>
    </div>
  </div>

  {/* Teachers Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredTeachers.map((teacher) => (
      <div key={teacher.id} className="bg-[#FBFDFF] p-5 rounded-2xl border border-[#2D3748]/5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-[#F2F8FF] border border-[#2D3748]/5 overflow-hidden flex items-center justify-center">
             <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${teacher.name}`} alt={teacher.name} className="w-full h-full" />
          </div>
          <button className="text-[#2D3748]/30 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        
        <h3 className="text-lg font-bold text-[#0E0E11] mb-1">{teacher.name}</h3>
        <p className="text-sm font-medium text-[#85C7F2] mb-3">{teacher.subject}</p>
        
        <div className="flex items-center gap-2 text-sm text-[#2D3748]/60 mb-4 bg-[#F2F8FF] p-2 rounded-lg">
          <Mail size={14} />
          <span className="truncate">{teacher.email}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#2D3748]/5">
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
            teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {teacher.status}
          </span>
          <button className="text-sm font-semibold text-[#2D3748] hover:text-[#85C7F2] transition-colors">
            View Profile
          </button>
        </div>
      </div>
    ))}
    
    {/* Empty State Logic */}
    {filteredTeachers.length === 0 && (
       <div className="col-span-full py-12 text-center text-[#2D3748]/50">
         <div className="w-16 h-16 bg-[#F2F8FF] rounded-full flex items-center justify-center mx-auto mb-4">
           <Search size={24} className="opacity-50" />
         </div>
         <p>No teachers found matching your search.</p>
       </div>
    )}
  </div>
</div>


);
};

export default Teachers;