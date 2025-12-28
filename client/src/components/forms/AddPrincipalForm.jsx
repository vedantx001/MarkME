import React, { useEffect, useRef, useState } from 'react';
import { X, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

/**
 * mode:
 * - "onboarding": first-time after admin register (full-page, skippable)
 * - "modal": from admin panel (no full-page)
 *
 * Note: backend currently supports create + list only for principal.
 */
const AddPrincipalForm = ({
  isOpen = true,
  onClose,
  onComplete,
  mode = 'modal',
  allowSkip = false,
}) => {
  const { principal, createPrincipal } = useAdmin();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Prevent overwriting user typing by hydrating only once per open (or when principal changes)
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Reset hydration when closed in modal mode
    if (mode === 'modal' && !isOpen) {
      hydratedRef.current = false;
      return;
    }

    if (principal && !hydratedRef.current) {
      setFormData({
        name: principal.name || '',
        email: principal.email || '',
        password: '',
      });
      hydratedRef.current = true;
      return;
    }

    if (!principal && !hydratedRef.current) {
      // ensure empty form when creating
      setFormData({ name: '', email: '', password: '' });
      hydratedRef.current = true;
    }
  }, [principal, isOpen, mode]);

  // For modal usage
  if (mode === 'modal' && !isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only create supported (single principal)
    if (!principal) createPrincipal(formData);

    // reset for next open
    hydratedRef.current = false;

    onComplete?.();
    onClose?.();
  };

  const handleSkip = () => {
    hydratedRef.current = false;
    onComplete?.();
    onClose?.();
  };

  const isFullPage = mode === 'onboarding';
  const Wrapper = ({ children }) => {
    if (isFullPage) {
      return (
        <div className="min-h-screen bg-[#F2F8FF] flex items-center justify-center p-6">
          <div className="w-full max-w-5xl bg-[#FBFDFF] rounded-3xl shadow-2xl border border-[#2D3748]/10 overflow-hidden">
            {children}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0E11]/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#FBFDFF] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2D3748]/10">
          {children}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="bg-[#2D3748] p-6 flex justify-between items-center text-[#FBFDFF]">
        <div>
          <h3 className="text-xl font-bold">
            {principal ? 'Principal' : 'Create Principal'}
          </h3>
          <p className="text-[#85C7F2] text-sm opacity-90">
            Principal is required for school operations.
          </p>
        </div>

        {!isFullPage && (
          <button onClick={onClose} className="p-2 hover:bg-[#FBFDFF]/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className={isFullPage ? 'p-10' : 'p-6'}>
        {isFullPage && (
          <div className="mb-8 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E0E11] flex items-center justify-center flex-none">
              <ShieldCheck className="text-[#85C7F2]" size={22} />
            </div>
            <div>
              <p className="text-[#0E0E11] font-bold">One-time setup</p>
              <p className="text-[#2D3748]/60 text-sm">
                Add your principal now. You can skip and do it later from the Principal section.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={isFullPage ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
          <div className={isFullPage ? 'space-y-2' : 'space-y-2'}>
            <label className="text-sm font-semibold text-[#2D3748]">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" />
              <input
                type="text"
                required
                className="w-full bg-[#F2F8FF] border border-[#2D3748]/10 rounded-xl py-2.5 pl-10 pr-4 text-[#0E0E11] focus:outline-none focus:border-[#85C7F2] focus:ring-1 focus:ring-[#85C7F2] transition-all"
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                placeholder="principal@school.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {!principal && (
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className={isFullPage ? 'md:col-span-2 pt-2 flex flex-col sm:flex-row gap-3' : 'pt-4 flex gap-3'}>
            {allowSkip && !principal && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#2D3748]/10 text-[#2D3748] font-semibold hover:bg-[#F2F8FF] transition-colors"
              >
                Skip for now
              </button>
            )}

            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D3748] text-[#FBFDFF] font-bold shadow-lg shadow-[#2D3748]/20 hover:bg-[#0E0E11] transition-all hover:-translate-y-0.5"
            >
              {principal ? 'Close' : 'Save Principal'}
            </button>
          </div>
        </form>
      </div>
    </Wrapper>
  );
};

export default AddPrincipalForm;
