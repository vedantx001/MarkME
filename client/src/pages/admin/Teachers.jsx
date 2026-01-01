import React, { useMemo, useState } from 'react';
import { Search, Plus, Mail, Trash2, Pencil, X } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import { useNavigate } from 'react-router-dom';
import AddTeacherForm from '../../components/forms/AddTeacherForm';
import EditTeacherForm from '../../components/forms/EditTeacherForm';
import { motion, AnimatePresence } from 'framer-motion';

const Teachers = () => {
  const navigate = useNavigate();
  const { teachers, loading, error, deleteTeacher } = useAdmin();
  // Keep a local list so we can remove instantly without a refresh-like animation
  const [localTeachers, setLocalTeachers] = useState(teachers || []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirm modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteTeacher, setPendingDeleteTeacher] = useState(null);

  // Keep local list in sync when context changes
  React.useEffect(() => {
    setLocalTeachers(teachers || []);
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return localTeachers;
    return localTeachers.filter((t) => {
      const subject = (t.subject || '').toLowerCase();
      const name = (t.name || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      return name.includes(s) || subject.includes(s) || email.includes(s);
    });
  }, [localTeachers, searchTerm]);

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditOpen(true);
  };

  const handleDelete = (teacher) => {
    setPendingDeleteTeacher(teacher);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const teacher = pendingDeleteTeacher;
    if (!teacher) return;
    try {
      setDeletingId(teacher.id);
      await deleteTeacher(teacher.id);
      // Remove instantly without re-fetch animation
      setLocalTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
    } finally {
      setDeletingId(null);
      setConfirmDeleteOpen(false);
      setPendingDeleteTeacher(null);
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
      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDeleteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-[rgb(var(--primary-text-rgb)/0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <motion.div
              className="bg-(--primary-bg) w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--primary-accent-rgb)/0.1)]"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-(--primary-accent) p-6 flex justify-between items-center text-(--primary-bg)">
                <div>
                  <h3 className="text-xl font-bold">Delete Teacher</h3>
                  <p className="text-(--secondary-accent) text-sm opacity-90">This action cannot be undone</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (deletingId) return;
                    setConfirmDeleteOpen(false);
                    setPendingDeleteTeacher(null);
                  }}
                  className="p-2 hover:bg-red-500 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-sm text-(--primary-text)">
                  Are you sure you want to delete <span className="font-bold">{pendingDeleteTeacher?.name}</span>?
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (deletingId) return;
                      setConfirmDeleteOpen(false);
                      setPendingDeleteTeacher(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.12)] text-(--primary-accent) font-semibold hover:bg-slate-100 transition-colors disabled:opacity-60"
                    disabled={!!deletingId}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-[0_10px_15px_-3px_rgba(239,68,68,0.25),0_4px_6px_-4px_rgba(239,68,68,0.25)] hover:bg-red-600 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:bg-red-500"
                    disabled={!!deletingId}
                  >
                    {deletingId ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              layout={false}
              key={teacher.id}
              initial={false}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-(--primary-bg) p-5 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm hover:shadow-md transition-all group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.05)] overflow-hidden flex items-center justify-center">
                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${teacher.name}`} alt={teacher.name} className="w-full h-full" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(teacher);
                    }}
                    className="text-(--primary-accent) opacity-30 hover:opacity-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(teacher);
                    }}
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
                {/* View Profile removed (no teacher detail page) */}
              </div>

              {/* Row deleting overlay */}
              <AnimatePresence>
                {deletingId === teacher.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[rgb(var(--primary-bg-rgb)/0.75)] backdrop-blur-[1px] flex items-center justify-center rounded-2xl"
                  >
                    <div className="flex items-center gap-3 text-sm font-bold text-(--primary-text)">
                      <span className="h-4 w-4 rounded-full border-2 border-[rgb(var(--primary-accent-rgb)/0.35)] border-t-[rgb(var(--primary-accent-rgb)/0.95)] animate-spin" />
                      Deleting…
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
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
