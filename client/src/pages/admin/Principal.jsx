import React, { useState } from 'react';
import { Search, Plus, Mail, Pencil } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddPrincipalForm from '../../components/forms/AddPrincipalForm';
import EditPrincipalForm from '../../components/forms/EditPrincipalForm';
import { motion } from 'framer-motion';
import { buildGenderAvatarUrl } from '../../utils/avatar';

const Principal = () => {
  const { principal } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // If not created yet, show the form inline (not full-page)
  if (!principal) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-(--primary-text)">Principal</h2>
          <p className="text-(--primary-accent) opacity-60">Add principal details to complete school setup.</p>
        </div>

        {isAddOpen && (
          <AddPrincipalForm
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
          />
        )}

        {!isAddOpen && (
          <div className="bg-(--primary-bg) p-6 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm text-center">
            <p className="text-(--primary-accent) opacity-60 mb-4">No principal added yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-(--primary-accent) text-(--primary-bg) px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all"
            >
              Add Principal
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto pb-20">
      <EditPrincipalForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} principal={principal} />

      {/* Header Section (match Teachers UI) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-(--primary-text)">Principal</h2>
          <p className="text-(--primary-accent) opacity-60">View and edit principal details (only one principal allowed).</p>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 bg-(--primary-accent) text-(--primary-bg) px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[rgb(var(--primary-accent-rgb)/0.2)] hover:bg-(--primary-text) transition-all"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>

      {/* Principal Card (match Teachers card style) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-(--primary-bg) p-5 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm hover:shadow-md transition-all group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-(--secondary-bg) border border-[rgb(var(--primary-accent-rgb)/0.05)] overflow-hidden flex items-center justify-center">
              <img
                src={buildGenderAvatarUrl({ name: principal.name || 'Principal', gender: principal.gender })}
                alt={principal.name}
                className="w-full h-full"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="text-(--primary-accent) opacity-30 hover:opacity-100 transition-colors"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-(--primary-text) mb-1">{principal.name}</h3>
          <p className="text-sm font-medium text-(--secondary-accent) mb-3">{principal.status || '—'}</p>

          <div className="flex items-center gap-2 text-sm text-(--primary-accent) opacity-60 mb-4 bg-(--secondary-bg) p-2 rounded-lg">
            <Mail size={14} />
            <span className="truncate">{principal.email}</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[rgb(var(--primary-accent-rgb)/0.05)]">
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${String(principal.status || '').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {principal.status || 'Unknown'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Principal;
