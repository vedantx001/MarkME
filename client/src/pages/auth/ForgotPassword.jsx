import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../api/auth.api';
import { Mail, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await forgotPasswordApi({ email });
      setSuccess('If that email exists, a reset link has been sent. Please check your inbox.');
    } catch (err) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--secondary-bg)' }}>
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10 bg-[#FBFDFF]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-text)' }}>Forgot Password</h2>
            <p className="text-gray-500 mt-2">Enter your email and we’ll send you a reset link.</p>
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
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              style={{ backgroundColor: '#3182CE' }}
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
