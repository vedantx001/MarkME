// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, School, ArrowRight,
  ShieldCheck, Hash, ScanFace, BarChart3, WifiOff, Workflow
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const roles = ['Admin', 'Teacher', 'Principal'];

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset role to admin when switching back to signup just in case
    if (isLogin) setRole('admin');
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
              Smart Face Recognition System for Rural Education.
            </p>
          </div>

          {/* Feature Grid Section (The 4 Cards) */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-4 grow content-start">
            <FeatureCard
              icon={Workflow}
              title="Streamlined Pipelines"
              description="End-to-end automated workflows for School Admins, Teachers, and Principals."
            />
            <FeatureCard
              icon={ScanFace}
              title="Secure Biometric"
              description="Instant, accurate student attendance verification via advanced facial scanning."
            />
            <FeatureCard
              icon={BarChart3}
              title="Insight Reports"
              description="Generate color-coded monthly analytics for data-driven decision making."
            />
            <FeatureCard
              icon={WifiOff}
              title="Offline-First"
              description="Robust architecture designed for seamless operations in low-connectivity rural areas."
            />
          </div>

          {/* Footer */}
          <div className="relative z-10 text-sm text-gray-400 font-medium">
            © 2025 MARKME EdTech Initiative.
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
                    {isLogin ? 'Welcome Back' : 'Register School'}
                  </h2>
                  <p className="text-gray-500">
                    {isLogin
                      ? 'Enter your credentials to access the dashboard.'
                      : 'Setup your admin account to manage your institution.'}
                  </p>
                </div>

                {/* Animated Role Selector (Login Only) */}
                {isLogin && (
                  <div className="relative flex bg-gray-100 p-1 rounded-xl mb-8">
                    {roles.map((r) => {
                      const isActive = role === r.toLowerCase();
                      return (
                        <button
                          key={r}
                          onClick={() => setRole(r.toLowerCase())}
                          className={`flex-1 py-3 text-sm font-bold rounded-lg relative z-10 transition-colors duration-300 ${isActive ? 'text-[#2D3748]' : 'text-gray-400 hover:text-gray-500'
                            }`}
                        >
                          {r}
                          {isActive && (
                            <motion.div
                              layoutId="activeRole"
                              className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Form Inputs */}
                <form className="space-y-5">
                  {!isLogin && (
                    <>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                        <input type="text" placeholder="Full Name" className="form-input" />
                      </div>
                      {/* Grid for School Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                          <input type="text" placeholder="School Name" className="form-input" />
                        </div>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                          <input type="text" placeholder="IDX-001" className="form-input" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                    <input type="email" placeholder="name@school.edu" className="form-input" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3182CE] transition-colors" size={22} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  {isLogin && (
                    <div className="flex justify-end">
                      <a href="#" className="text-sm font-semibold text-gray-500 hover:text-[#3182CE] transition-colors">
                        Forgot Password?
                      </a>
                    </div>
                  )}

                  {/* Submit Button with Darker Color */}
                  <button
                    className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer"
                    style={{ backgroundColor: '#3182CE' }}
                  >
                    {isLogin ? 'Login Dashboard' : 'Create Admin Account'}
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-10 text-center">
                  <p className="text-gray-500 font-medium">
                    {isLogin ? "New to MARKME? " : "Already have an account? "}
                    <button
                      onClick={toggleMode}
                      className="font-bold hover:underline transition-colors"
                      style={{ color: '#3182CE' }}
                    >
                      {isLogin ? 'Register School' : 'Login here'}
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