import React, { useState } from 'react';
import { Mail, ShieldCheck, Pencil } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddPrincipalForm from '../../components/forms/AddPrincipalForm';
import EditPrincipalForm from '../../components/forms/EditPrincipalForm';

const Principal = () => {
  const { principal } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // If not created yet, show the form inline (not full-page)
  if (!principal) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0E0E11]">Principal</h2>
          <p className="text-[#2D3748]/60">Add principal details to complete school setup.</p>
        </div>

        {isAddOpen && (
          <AddPrincipalForm
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
          />
        )}

        {!isAddOpen && (
          <div className="bg-[#FBFDFF] p-6 rounded-2xl border border-[#2D3748]/5 shadow-sm text-center">
            <p className="text-[#2D3748]/60 mb-4">No principal added yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#2D3748] text-[#FBFDFF] px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all"
            >
              Add Principal
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <EditPrincipalForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} principal={principal} />

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0E0E11]">Principal</h2>
          <p className="text-[#2D3748]/60">View and edit principal details (only one principal allowed).</p>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 bg-[#2D3748] text-[#FBFDFF] px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>

      <div className="bg-[#FBFDFF] p-6 rounded-2xl border border-[#2D3748]/5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0E0E11] flex items-center justify-center flex-none">
            <ShieldCheck className="text-[#85C7F2]" size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#0E0E11] truncate">{principal.name}</h3>
            <p className="text-sm font-medium text-[#85C7F2]">Active</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-[#2D3748]/60 bg-[#F2F8FF] p-2 rounded-lg">
                <Mail size={14} />
                <span className="truncate">{principal.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Principal;