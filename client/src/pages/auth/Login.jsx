import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from "../../context/authContext.jsx";
import { registerAdminApi } from "../../api/auth.api.js";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, School, ArrowRight,
  ShieldCheck, Hash, ScanFace, BarChart3, WifiOff, Workflow
} from 'lucide-react';

const AuthPage = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    adminName: '',
    schoolName: '',
    schoolIdx: '',
    address: '',
    adminEmail: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const fromPath = useMemo(() => {
    const from = location?.state?.from;
    return typeof from === 'string' && from.startsWith('/') ? from : null;
  }, [location]);

  useEffect(() => {
    // If coming from RegisterAdmin redirect, prefill email.
    const prefill = location?.state?.prefillEmail;
    if (prefill && typeof prefill === 'string') {
      setLoginForm((p) => ({ ...p, email: prefill }));
    }
  }, [location?.state]);

  const toggleMode = () => {
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);
    setError('');
    setSuccess('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const normalizeRole = (role) => String(role || '').toUpperCase();

  const isFromPathAllowedForRole = (path, role) => {
    if (!path || typeof path !== 'string') return false;
    const r = normalizeRole(role);
    if (r === 'ADMIN') return path === '/admin' || path.startsWith('/admin/');
    if (r === 'TEACHER') return path === '/teacher' || path.startsWith('/teacher/');
    if (r === 'PRINCIPAL') return path === '/principal' || path.startsWith('/principal/');
    return false;
  };

  const redirectByRole = (role) => {
    const r = normalizeRole(role);
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'TEACHER') return '/teacher/classroom';
    if (r === 'PRINCIPAL') return '/principal/dashboard';
    return '/';
  };

  const shouldForceRoleRedirect = () => {
    const stateFlag = location?.state?.forceRoleRedirect === true;
    let storageFlag = false;
    try {
      storageFlag = sessionStorage.getItem('auth_force_role_redirect') === '1';
    } catch {
      storageFlag = false;
    }
    return stateFlag || storageFlag;
  };

  const clearForceRoleRedirect = () => {
    try {
      sessionStorage.removeItem('auth_force_role_redirect');
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin && (registerForm.password || '') !== (confirmPassword || '')) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        const nextUser = await login({ email: loginForm.email, password: loginForm.password });
        const nextRole = normalizeRole(nextUser?.role);
        const forceRoleRedirect = shouldForceRoleRedirect();
        const safeFromPath = !forceRoleRedirect && isFromPathAllowedForRole(fromPath, nextRole) ? fromPath : null;
        const target = safeFromPath || redirectByRole(nextRole);
        if (forceRoleRedirect) clearForceRoleRedirect();
        navigate(target, { replace: true });
        return;
      }

      const payload = {
        schoolIdx: registerForm.schoolIdx,
        schoolName: registerForm.schoolName,
        address: registerForm.address || undefined,
        adminName: registerForm.adminName,
        adminEmail: registerForm.adminEmail,
        password: registerForm.password,
      };

      await registerAdminApi(payload);

      // New flow: OTP verification required before login
      navigate('/verify-otp', {
        replace: true,
        state: {
          email: registerForm.adminEmail,
          context: 'register-admin',
        },
      });
    } catch (err) {
      // If server says not verified, route to OTP page
      const msg = String(err?.message || 'Something went wrong');
      if (isLogin && (err?.status === 403) && msg.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { replace: true, state: { email: loginForm.email, context: 'login' } });
        return;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };


  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300 group">
      <div className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-lg mb-3 group-hover:scale-110 transition-transform">
        <Icon size={20} style={{ color: 'var(--secondary-accent)' }} />
      </div>
      <h4 className="font-bold text-base mb-1">{title}</h4>
      <p className="text-gray-300 text-xs leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500"
      style={{ backgroundColor: 'var(--secondary-bg)' }}
    >
      <div className="w-full max-w-300 h-full md:h-185 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* --- LEFT SIDE: Visuals & Branding --- */}
        <div
          className="hidden md:flex md:w-5/12 flex-col p-12 text-white relative overflow-hidden gap-8"
          style={{ backgroundColor: 'var(--primary-accent)' }}
        >
          {/* Decorative background blurs */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-125 h-125 bg-[#85C7F2] opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl z-0"></div>

          {/* Header Section */}
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-wider flex items-center gap-3">
              <ShieldCheck className="w-10 h-10" style={{ color: 'var(--secondary-accent)' }} />
              MARK<span style={{ color: 'var(--secondary-accent)' }}>ME</span>
            </h1>
            <p className="mt-3 text-gray-300 text-lg font-light">
              Smart Attendance System for Rural and Government Schools
            </p>
          </div>

          {/* Feature Grid Section (The 4 Cards) */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-4 grow content-start">
            <FeatureCard
              icon={Workflow}
              title="Streamlined Pipelines"
              description="End‑to‑end digital workflows connecting administrators, teachers, and school leadership."
            />
            <FeatureCard
              icon={ScanFace}
              title="Secure Biometric"
              description="Secure face recognition technology for accurate and reliable student attendance."
            />
            <FeatureCard
              icon={BarChart3}
              title="Insight Reports"
              description="Automatically generated monthly attendance reports for academic monitoring."
            />
            <FeatureCard
              icon={WifiOff}
              title="Offline-First"
              description="Designed to operate reliably in rural areas with limited internet connectivity."
            />
          </div>

          {/* Footer */}
          <div className="relative z-10 text-sm text-gray-400 font-medium">
            © 2026 MARKME Attendance System.
          </div>
        </div>

        {/* --- RIGHT SIDE: Form Section --- */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#FBFDFF]">

          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode='wait'>
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* Form Header */}
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--primary-text)' }}>
                    {isLogin ? 'School Portal Login' : 'Register Your School'}
                  </h2>
                  <p className="text-gray-500">
                    {isLogin
                      ? 'Sign in to access your official school attendance dashboard.'
                      : 'Create an administrator account to set up and manage your school attendance system.'}
                  </p>
                </div>

                {/* Form Inputs */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {(error || success) && (
                    <div className={`text-sm font-semibold rounded-xl px-4 py-3 ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {error || success}
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                        <input
                          type="text"
                          placeholder="Administrator Full Name"
                          className="form-input"
                          value={registerForm.adminName}
                          onChange={(e) => setRegisterForm((p) => ({ ...p, adminName: e.target.value }))}
                          required
                        />
                      </div>
                      {/* Grid for School Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                          <input
                            type="text"
                            placeholder="School Identification Code (e.g. SCH-001)"
                            className="form-input"
                            value={registerForm.schoolName}
                            onChange={(e) => setRegisterForm((p) => ({ ...p, schoolName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                          <input
                            type="text"
                            placeholder="IDX-001"
                            className="form-input"
                            value={registerForm.schoolIdx}
                            onChange={(e) => setRegisterForm((p) => ({ ...p, schoolIdx: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                    <input
                      type="email"
                      placeholder="name@school.edu"
                      className="form-input"
                      value={isLogin ? loginForm.email : registerForm.adminEmail}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (isLogin) setLoginForm((p) => ({ ...p, email: v }));
                        else setRegisterForm((p) => ({ ...p, adminEmail: v }));
                      }}
                      required
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your account password"
                      className="form-input pr-12"
                      value={isLogin ? loginForm.password : registerForm.password}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (isLogin) setLoginForm((p) => ({ ...p, password: v }));
                        else setRegisterForm((p) => ({ ...p, password: v }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  {!isLogin && (
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="form-input pr-12"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-gray-500 hover:text-[#3182CE] transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  )}

                  {/* Submit Button with Darker Color */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer"
                    style={{ backgroundColor: '#3182CE' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Please wait...' : (isLogin ? 'Login Dashboard' : 'Register School Administrator')}
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-10 text-center">
                  <p className="text-gray-500 font-medium">
                    {isLogin ? "New to MarkME? Register your school " : "Already registered?"}
                    <button
                      onClick={toggleMode}
                      className="font-bold hover:underline transition-colors"
                      style={{ color: '#3182CE' }}
                    >
                      {isLogin ? 'Register School' : 'Sign in here'}
                    </button>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom styles moved to index.css

export default AuthPage;