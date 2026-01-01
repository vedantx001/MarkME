import React, { useMemo, useState } from 'react';
import { Search, Plus, School, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/adminContext';
import AddClassroomForm from '../../components/forms/AddClassroomForm';
import EditClassroomForm from '../../components/forms/EditClassroomForm';
import { motion, AnimatePresence } from 'framer-motion';

const Classroom = () => {
  const navigate = useNavigate();
  const { classrooms } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClassrooms = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return classrooms;

    return classrooms.filter((c) => {
      const key = `${c.year} ${c.std} ${c.div} ${c.classTeacherName} ${c.name}`.toLowerCase();
      return key.includes(s);
    });
  }, [classrooms, searchTerm]);

  const openEdit = (c) => {
    setSelectedClassroom(c);
    setIsEditOpen(true);
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <AddClassroomForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditClassroomForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} classroom={selectedClassroom} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-(--primary-text)">Classrooms</h2>
          <p className="text-(--primary-accent) opacity-60">Manage classrooms and assign class teachers.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--primary-accent) opacity-40" />
            <input
              type="text"
              placeholder="Search classrooms..."
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

      {/* Classrooms Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredClassrooms.map((c) => (
            <motion.div
              layout
              key={c.id}
              initial={false}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-(--primary-bg) p-5 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.05)] overflow-hidden flex items-center justify-center">
                  <School className="text-(--secondary-accent)" size={20} />
                </div>
                <button onClick={() => openEdit(c)} className="text-(--primary-accent) opacity-30 hover:opacity-100 transition-colors" title="Edit">
                  <Pencil size={18} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-(--primary-text) mb-1">
                Std {c.std} - {c.div}
              </h3>
              <p className="text-sm font-medium text-(--secondary-accent) mb-3">{c.year}</p>

              <div className="text-sm text-(--primary-accent) opacity-60 mb-4 bg-(--secondary-bg) p-2 rounded-lg">
                <span className="font-semibold text-(--primary-accent)">Class Teacher:</span>{' '}
                <span className="truncate">{c.classTeacherName || '—'}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[rgb(var(--primary-accent-rgb)/0.05)]">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">
                  Active
                </span>
                <button
                  type="button"
                  className="text-sm font-semibold text-(--primary-accent) hover:text-(--secondary-accent) transition-colors"
                  onClick={() => navigate(`/admin/classrooms/${c.id}`)}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredClassrooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-(--primary-accent) opacity-50">
            <div className="w-16 h-16 bg-(--secondary-bg) rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="opacity-50" />
            </div>
            <p>No classrooms found matching your search.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Classroom;
