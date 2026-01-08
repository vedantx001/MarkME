import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyOtpApi, sendOtpApi } from '../../api/auth.api';
import { useAuth } from '../../context/authContext';
import { Mail, KeyRound, ArrowRight, RotateCcw } from 'lucide-react';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const initialEmail = useMemo(() => {
    const s = location?.state?.email;
    return typeof s === 'string' ? s : '';
  }, [location?.state]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const redirectByRole = (role) => {
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'TEACHER') return '/teacher/classroom';
    if (r === 'PRINCIPAL') return '/principal/dashboard';
    return '/login';
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await verifyOtpApi({ email, otp });

      // If server auto-logged-in (admin verify), fetch profile and redirect.
      if (data?.token || data?.user) {
        try {
          const me = await refreshProfile();
          const role = me?.role || data?.user?.role;
          setSuccess('Account verified. Redirecting…');
          setTimeout(() => {
            navigate(redirectByRole(role), { replace: true });
          }, 400);
          return;
        } catch {
          // fall through to login redirect below
        }
      }

      setSuccess('Account verified. You can login now.');
      setTimeout(() => {
        navigate('/login', { replace: true, state: { prefillEmail: email } });
      }, 600);
    } catch (err) {
      if (err?.status === 400 || err?.status === 404) {
        setError(err?.message || 'OTP verification failed');
      } else {
        setError(err?.message || 'Failed to verify OTP');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await sendOtpApi({ email });
      setSuccess('OTP sent again to your email.');
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--secondary-bg)' }}>
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10 bg-[#FBFDFF]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-text)' }}>Verify OTP</h2>
            <p className="text-gray-500 mt-2">Enter the 6-digit OTP sent to your email to verify your account.</p>
          </div>

          {(error || success) && (
            <div className={`text-sm font-semibold rounded-xl px-4 py-3 mb-6 ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {error || success}
            </div>
          )}

          <form className="space-y-5" onSubmit={onVerify}>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
              <input
                type="email"
                className="form-input"
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="form-input tracking-[0.35em]"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              style={{ backgroundColor: '#3182CE' }}
              disabled={submitting}
            >
              {submitting ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onResend}
              disabled={resending || !email}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={18} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>

            <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-[#3182CE] transition-colors text-center">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
