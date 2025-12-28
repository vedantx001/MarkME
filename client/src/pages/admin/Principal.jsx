import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import AddPrincipalForm from '../../components/forms/AddPrincipalForm';

const Principal = () => {
  const { principal } = useAdmin();

  // If not created yet, show the form inline (not full-page)
  if (!principal) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0E0E11]">Principal</h2>
          <p className="text-[#2D3748]/60">Add principal details to complete school setup.</p>
        </div>

        <div className="bg-[#FBFDFF] p-6 rounded-2xl border border-[#2D3748]/5 shadow-sm">
          <AddPrincipalForm
            mode="modal"
            isOpen={true}
            allowSkip={false}
            onClose={() => {}}
            onComplete={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0E0E11]">Principal</h2>
          <p className="text-[#2D3748]/60">View principal details (only one principal allowed).</p>
        </div>
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
