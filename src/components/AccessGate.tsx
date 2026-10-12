import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Lock, ArrowRight, ShieldCheck, HelpCircle, User, Shield, Eye, EyeOff } from 'lucide-react';
import { FacelessLogo } from './FacelessLogo';
import { AccessCode } from '../types/auth';
import campusQuadBanner from '../assets/images/campus_quad_banner_1791683877643.jpg';

interface AccessGateProps {
  onLoginStudent: (code: string) => { success: boolean; message?: string } | Promise<{ success: boolean; message?: string }>;
  onLoginAdmin: (username: string, password: string) => { success: boolean; message?: string };
  availableCodes: AccessCode[];
}

export const AccessGate: React.FC<AccessGateProps> = ({
  onLoginStudent,
  onLoginAdmin,
  availableCodes,
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'admin'>('student');

  // Student form state
  const [studentCode, setStudentCode] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [showHelperCodes, setShowHelperCodes] = useState(false);

  // Admin form state (completely confidential, no credentials shown)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setStudentError('Please enter your class access code.');
      return;
    }

    setStudentLoading(true);
    setStudentError('');

    try {
      const result = await onLoginStudent(studentCode.trim());
      setStudentLoading(false);
      if (!result.success) {
        setStudentError(result.message || 'Invalid access code. Please try again.');
      }
    } catch {
      setStudentLoading(false);
      setStudentError('Error checking code. Please try again.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminError('Please enter both admin username and password.');
      return;
    }

    setAdminLoading(true);
    setAdminError('');

    setTimeout(() => {
      const result = onLoginAdmin(adminUsername.trim(), adminPassword.trim());
      setAdminLoading(false);
      if (!result.success) {
        setAdminError(result.message || 'Invalid administrator credentials.');
      }
    }, 300);
  };

  const handleUseQuickCode = (code: string) => {
    setStudentCode(code);
    setStudentError('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img
          src={campusQuadBanner}
          alt="Campus Quad Background"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-15 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-neutral-950/80" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
        {/* Brand & Logo Lockup */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="p-2 mb-2">
            <FacelessLogo size="xl" showWordmark={true} />
          </div>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mt-1">
            Anonymous Class Community
          </p>
        </div>

        {/* Portal Switcher (Strictly separating Student vs Admin) */}
        <div className="mb-6 flex rounded-xl bg-neutral-950/90 p-1 border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActivePortal('student');
              setStudentError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activePortal === 'student'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Student Access Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setAdminError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activePortal === 'admin'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Faculty & Admin Portal</span>
          </button>
        </div>

        {/* PORTAL 1: STUDENT ACCESS CODE LOGIN */}
        {activePortal === 'student' ? (
          <div>
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold text-white">Enter Class Access Code</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Enter the access pass generated by your instructor or class admin.
              </p>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Student Access Code</span>
                  <span className="text-[11px] text-neutral-500 font-normal">Case-insensitive</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                    <KeyRound className="h-4 w-4 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => {
                      setStudentCode(e.target.value.toUpperCase());
                      setStudentError('');
                    }}
                    placeholder="e.g. FACELESS-2026"
                    autoFocus
                    className="w-full rounded-2xl border border-neutral-700/80 bg-neutral-950/80 py-3.5 pl-10 pr-4 text-sm font-mono tracking-wider text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
                  />
                </div>

                {studentError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>{studentError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={studentLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{studentLoading ? 'Verifying Code...' : 'Unlock Class Community'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Sample Codes Drawer for Testing */}
            <div className="mt-5 border-t border-neutral-800/80 pt-3">
              <button
                type="button"
                onClick={() => setShowHelperCodes(!showHelperCodes)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showHelperCodes ? 'Hide Sample Student Codes' : 'View Sample Student Passes'}</span>
              </button>

              {showHelperCodes && (
                <div className="mt-2.5 space-y-1.5 rounded-2xl bg-neutral-950/60 p-3 border border-neutral-800/80 text-xs">
                  <p className="text-[11px] font-semibold text-neutral-400">
                    Click any student pass to autofill:
                  </p>
                  {availableCodes
                    .filter((c) => c.isActive)
                    .map((code) => (
                      <button
                        key={code.id}
                        type="button"
                        onClick={() => handleUseQuickCode(code.code)}
                        className="w-full flex items-center justify-between rounded-xl bg-neutral-900 px-3 py-2 text-left hover:bg-neutral-800 transition-colors group"
                      >
                        <div>
                          <span className="font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                            {code.code}
                          </span>
                          <span className="block text-[11px] text-neutral-400">{code.label}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {code.usedCount}/{code.maxUses || '∞'} students
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-950/40 p-3 border border-neutral-800/60 flex items-start gap-2.5 text-xs text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Students remain 100% anonymous. Students do not have access to admin controls.
              </span>
            </div>
          </div>
        ) : (
          /* PORTAL 2: DEDICATED FACULTY & ADMIN PORTAL */
          <div>
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 mb-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Faculty & Admin Clearance</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Administrator Sign In</h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Full administrative access to manage all students, chatrooms, and codes.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={adminUsername}
                  onChange={(e) => {
                    setAdminUsername(e.target.value);
                    setAdminError('');
                  }}
                  placeholder="Username"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Password"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-3.5 pr-10 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{adminLoading ? 'Verifying Credentials...' : 'Authenticate as Administrator'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
