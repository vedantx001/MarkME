import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../../api/auth.api';
import { Lock, ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const tokenFromUrl = query.get('token') || '';
  const emailFromUrl = query.get('email') || '';

  const [token] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please use the reset link from your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordApi({ token, password, email: email || undefined });
      setSuccess('Password reset successful. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true, state: { prefillEmail: email } });
      }, 700);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--secondary-bg)' }}>
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10 bg-[#FBFDFF]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-text)' }}>Reset Password</h2>
            <p className="text-gray-500 mt-2">Set a new password for your account.</p>
          </div>

          {(error || success) && (
            <div className={`text-sm font-semibold rounded-xl px-4 py-3 mb-6 ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {error || success}
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
              <input
                type="email"
                className="form-input"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input pr-12"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input pr-12"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              style={{ backgroundColor: '#3182CE' }}
              disabled={submitting}
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-[#3182CE] transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
