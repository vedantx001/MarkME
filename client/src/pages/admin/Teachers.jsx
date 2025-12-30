import React, { useMemo, useState } from 'react';
import { Search, Plus, Mail, Trash2, Pencil } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddTeacherForm from '../../components/forms/AddTeacherForm';
import EditTeacherForm from '../../components/forms/EditTeacherForm';
import { motion, AnimatePresence } from 'framer-motion';

const Teachers = () => {
  const { teachers, loading, error, deleteTeacher } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return teachers;
    return teachers.filter((t) => {
      const subject = (t.subject || '').toLowerCase();
      const name = (t.name || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      return name.includes(s) || subject.includes(s) || email.includes(s);
    });
  }, [teachers, searchTerm]);

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditOpen(true);
  };

  const handleDelete = async (teacher) => {
    const ok = window.confirm(`Delete teacher "${teacher.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      setDeletingId(teacher.id);
      await deleteTeacher(teacher.id);
    } finally {
      setDeletingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <AddTeacherForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditTeacherForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} teacher={selectedTeacher} />

      {error && (
        <div className="mb-6 text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-(--primary-text)">Teachers</h2>
          <p className="text-(--primary-accent) opacity-60">Manage your faculty members and their accounts.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--primary-accent) opacity-40" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-(--primary-accent) text-(--primary-bg) px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredTeachers.map((teacher) => (
            <motion.div
              layout
              key={teacher.id}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-(--primary-bg) p-5 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.05)] overflow-hidden flex items-center justify-center">
                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${teacher.name}`} alt={teacher.name} className="w-full h-full" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(teacher)} className="text-(--primary-accent) opacity-30 hover:opacity-100 transition-colors" title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher)}
                    disabled={deletingId === teacher.id}
                    className="text-(--primary-accent) opacity-30 hover:text-red-500 hover:opacity-100 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-(--primary-text) mb-1">{teacher.name}</h3>
              <p className="text-sm font-medium text-(--secondary-accent) mb-3">{teacher.subject || '—'}</p>

              <div className="flex items-center gap-2 text-sm text-(--primary-accent) opacity-60 mb-4 bg-(--secondary-bg) p-2 rounded-lg">
                <Mail size={14} />
                <span className="truncate">{teacher.email}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[rgb(var(--primary-accent-rgb)/0.05)]">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {teacher.status}
                </span>
                <button className="text-sm font-semibold text-(--primary-accent) hover:text-(--secondary-accent) transition-colors">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="col-span-full py-12 text-center text-(--primary-accent) opacity-50">
            <p>Loading teachers…</p>
          </div>
        )}

        {/* Empty State Logic */}
        {filteredTeachers.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-(--primary-accent) opacity-50">
            <div className="w-16 h-16 bg-(--secondary-bg) rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="opacity-50" />
            </div>
            <p>No teachers found matching your search.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Teachers;
