import React, { useState } from 'react';
import { Mail, ShieldCheck, Pencil } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddPrincipalForm from '../../components/forms/AddPrincipalForm';
import EditPrincipalForm from '../../components/forms/EditPrincipalForm';
import { motion } from 'framer-motion';

const Principal = () => {
  const { principal } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // If not created yet, show the form inline (not full-page)
  if (!principal) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <EditPrincipalForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} principal={principal} />

      <div className="flex items-start justify-between gap-4 mb-8">
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

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-(--primary-bg) p-6 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-(--primary-text) flex items-center justify-center flex-none">
            <ShieldCheck className="text-(--secondary-accent)" size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-(--primary-text) truncate">{principal.name}</h3>
            <p className="text-sm font-medium text-(--secondary-accent)">Active</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-(--primary-accent) opacity-60 bg-(--secondary-bg) p-2 rounded-lg">
                <Mail size={14} />
                <span className="truncate">{principal.email}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Principal;
