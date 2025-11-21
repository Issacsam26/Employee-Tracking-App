
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User, Briefcase, Building, AlertCircle, Hash, X, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../services/mockData';

interface LoginProps {
  onLogin: (role: 'ADMIN' | 'EMPLOYEE') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [isSignup, setIsSignup] = useState(false);
  
  // Admin Fields
  const [email, setEmail] = useState('admin@techcorp.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tenantName, setTenantName] = useState('');
  
  // Employee Fields
  const [empId, setEmpId] = useState('emp-101');
  const [empPin, setEmpPin] = useState('');
  // Employee Signup specific
  const [empName, setEmpName] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password/PIN Reset State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Admin Reset State (Email based)
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Employee Reset State (ID/Name based -> New PIN)
  const [forgotPinStep, setForgotPinStep] = useState<'VERIFY' | 'RESET' | 'SUCCESS'>('VERIFY');
  const [resetName, setResetName] = useState('');
  const [resetEmpId, setResetEmpId] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetError, setResetError] = useState('');

  const handlePinChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setter(numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network request
    setTimeout(() => {
      // Validation
      if (mode === 'EMPLOYEE') {
         if (!empId.trim()) {
             setLoading(false);
             setError('Employee ID is required.');
             return;
         }
         if (empPin.length < 4) {
             setLoading(false);
             setError('PIN must be between 4 and 6 digits.');
             return;
         }
         if (isSignup && empPin !== confirmPin) {
             setLoading(false);
             setError('PINs do not match.');
             return;
         }
      } else {
          // Admin validation
          if (!email || password.length < 4) {
              setLoading(false);
              setError('Please check your credentials.');
              return;
          }
      }

      setLoading(false);
      if (isSignup) {
          alert("Account created successfully! Logging you in...");
      }
      onLogin(mode);
    }, 1000);
  };

  const handleAdminResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetStatus('sending');
      
      // Simulate API call
      setTimeout(() => {
          if (resetEmail.includes('@')) {
              setResetStatus('success');
          } else {
              setResetStatus('error');
          }
      }, 1500);
  };

  const handleEmployeeVerify = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      
      // Simulate verifying against database
      setTimeout(() => {
          const found = MOCK_EMPLOYEES.find(e => 
              e.id.toLowerCase() === resetEmpId.toLowerCase() && 
              e.name.toLowerCase() === resetName.toLowerCase()
          );

          if (found) {
              setForgotPinStep('RESET');
          } else {
              setResetError('Employee Name and ID do not match our records.');
          }
      }, 800);
  };

  const handleEmployeeSetPin = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');

      if (newPin.length < 4) {
          setResetError('PIN must be at least 4 digits.');
          return;
      }
      if (newPin !== confirmNewPin) {
          setResetError('PINs do not match.');
          return;
      }

      // Simulate API Update
      setTimeout(() => {
          setForgotPinStep('SUCCESS');
          // In a real app, you would update the backend here
      }, 800);
  };

  const toggleSignup = () => {
      setIsSignup(!isSignup);
      setError('');
      setPassword('');
      setEmpPin('');
      setConfirmPin('');
  };

  const openForgotPassword = () => {
      // Reset all states
      setResetEmail(email); 
      setResetStatus('idle');
      
      setResetName('');
      setResetEmpId('');
      setNewPin('');
      setConfirmNewPin('');
      setForgotPinStep('VERIFY');
      setResetError('');

      setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <ShieldCheck className="w-8 h-8 text-white" />
           </div>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
              {isSignup ? 'Activate Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
              {isSignup 
                ? 'Set up your credentials to access the system.' 
                : `Sign in to access the ${mode === 'ADMIN' ? 'Admin Portal' : 'Employee Dashboard'}.`
              }
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg mb-6 border border-slate-800">
            <button 
                onClick={() => { setMode('ADMIN'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'ADMIN' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <ShieldCheck className="w-4 h-4" />
                Admin
            </button>
            <button 
                 onClick={() => { setMode('EMPLOYEE'); setError(''); }}
                 className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'EMPLOYEE' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Briefcase className="w-4 h-4" />
                Employee
            </button>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg flex items-center gap-3 text-rose-300 text-sm animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'ADMIN' ? (
            <>
                {isSignup && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Full Name</label>
                            <div className="relative">
                                <input 
                                type="text" 
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm"
                                placeholder="John Doe"
                                />
                                <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Company / Tenant</label>
                            <div className="relative">
                                <input 
                                type="text" 
                                required
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm"
                                placeholder="Acme Corp"
                                />
                                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm"
                        placeholder="admin@company.com"
                        />
                        <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-slate-400 text-left uppercase tracking-wide">Password</label>
                        {!isSignup && (
                            <button 
                                type="button" 
                                onClick={openForgotPassword}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm"
                        placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                    </div>
                </div>
            </>
          ) : (
             <>
                 {isSignup && (
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Full Name</label>
                        <div className="relative">
                            <input 
                            type="text" 
                            required
                            value={empName}
                            onChange={(e) => setEmpName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm"
                            placeholder="Jane Smith"
                            />
                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                        </div>
                    </div>
                 )}

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Employee ID</label>
                    <div className="relative">
                        <input 
                        type="text" 
                        required
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 font-mono text-sm uppercase"
                        placeholder="EMP-12345"
                        />
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Use your company issued ID (e.g., EMP-XXXX).</p>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-slate-400 text-left uppercase tracking-wide">{isSignup ? 'Create Access PIN' : 'Enter Access PIN'}</label>
                        {!isSignup && (
                            <button 
                                type="button" 
                                onClick={openForgotPassword}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot PIN?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                    <input 
                        type="password"
                        inputMode="numeric" 
                        required
                        value={empPin}
                        onChange={(e) => handlePinChange(e.target.value, setEmpPin)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 tracking-[0.5em] text-sm font-mono"
                        placeholder="••••"
                        maxLength={6}
                    />
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Enter your 4-6 digit security PIN.</p>
                </div>

                {isSignup && (
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Confirm PIN</label>
                        <div className="relative">
                        <input 
                            type="password" 
                            inputMode="numeric"
                            required
                            value={confirmPin}
                            onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 tracking-[0.5em] text-sm font-mono"
                            placeholder="••••"
                            maxLength={6}
                        />
                        <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                        </div>
                    </div>
                )}
             </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isSignup ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={toggleSignup}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isSignup ? 'Already have an account? ' : 'First time user? '}
            <span className="text-blue-400 font-medium">{isSignup ? 'Sign In' : 'Activate Account'}</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-slate-600 text-xs text-center">
        &copy; 2023 Employee Tracking System. All rights reserved.<br/>
        Restricted Access. Authorized Personnel Only.
      </p>

      {/* Forgot Password/PIN Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm p-6 rounded-xl border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowForgotPassword(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mb-4 border border-blue-800/30">
                        <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {mode === 'ADMIN' ? 'Reset Password' : 'Reset Access PIN'}
                    </h3>
                    <p className="text-sm text-slate-400">
                        {mode === 'ADMIN' 
                            ? "Enter your administrator email address and we'll send you a link to reset your password."
                            : forgotPinStep === 'VERIFY' 
                                ? "Verify your identity to reset your PIN."
                                : forgotPinStep === 'RESET' 
                                    ? "Enter your new access PIN."
                                    : "PIN updated successfully!"
                        }
                    </p>
                </div>

                {/* ADMIN FLOW - EMAIL BASED */}
                {mode === 'ADMIN' && (
                     resetStatus === 'success' ? (
                        <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-lg p-4 text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                            <p className="text-emerald-400 font-medium text-sm">Check your email!</p>
                            <p className="text-xs text-slate-400 mt-1">We've sent a password reset link to <br/> <span className="text-white">{resetEmail}</span></p>
                            <button 
                                onClick={() => setShowForgotPassword(false)}
                                className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded border border-slate-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAdminResetSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        required
                                        value={resetEmail}
                                        onChange={(e) => {
                                            setResetEmail(e.target.value);
                                            if(resetStatus === 'error') setResetStatus('idle');
                                        }}
                                        className={`w-full bg-slate-950 border ${resetStatus === 'error' ? 'border-rose-500' : 'border-slate-700'} text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 text-sm`}
                                        placeholder="admin@company.com"
                                    />
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                </div>
                                {resetStatus === 'error' && <p className="text-xs text-rose-400 mt-1.5">Please enter a valid email address.</p>}
                            </div>
                            <button 
                                type="submit"
                                disabled={resetStatus === 'sending'}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {resetStatus === 'sending' ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )
                )}

                {/* EMPLOYEE FLOW - IDENTITY BASED */}
                {mode === 'EMPLOYEE' && (
                    <>
                        {forgotPinStep === 'VERIFY' && (
                             <form onSubmit={handleEmployeeVerify}>
                                {resetError && (
                                    <div className="mb-4 p-2 bg-rose-950/30 border border-rose-900/50 rounded flex items-center gap-2 text-rose-300 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        {resetError}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                required
                                                value={resetName}
                                                onChange={(e) => setResetName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="Enter your full name"
                                            />
                                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Employee ID</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                required
                                                value={resetEmpId}
                                                onChange={(e) => setResetEmpId(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono uppercase"
                                                placeholder="EMP-XXXX"
                                            />
                                            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/30"
                                    >
                                        Verify Identity
                                    </button>
                                </div>
                             </form>
                        )}

                        {forgotPinStep === 'RESET' && (
                             <form onSubmit={handleEmployeeSetPin}>
                                {resetError && (
                                    <div className="mb-4 p-2 bg-rose-950/30 border border-rose-900/50 rounded flex items-center gap-2 text-rose-300 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        {resetError}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">New PIN</label>
                                        <div className="relative">
                                            <input 
                                                type="password"
                                                inputMode="numeric" 
                                                required
                                                value={newPin}
                                                onChange={(e) => handlePinChange(e.target.value, setNewPin)}
                                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono tracking-[0.5em]"
                                                placeholder="••••"
                                                maxLength={6}
                                            />
                                            <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Confirm PIN</label>
                                        <div className="relative">
                                            <input 
                                                type="password"
                                                inputMode="numeric" 
                                                required
                                                value={confirmNewPin}
                                                onChange={(e) => handlePinChange(e.target.value, setConfirmNewPin)}
                                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono tracking-[0.5em]"
                                                placeholder="••••"
                                                maxLength={6}
                                            />
                                            <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                         <button 
                                            type="button"
                                            onClick={() => setForgotPinStep('VERIFY')}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-all border border-slate-700"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/30"
                                        >
                                            Set New PIN
                                        </button>
                                    </div>
                                </div>
                             </form>
                        )}

                        {forgotPinStep === 'SUCCESS' && (
                             <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-lg p-4 text-center animate-in zoom-in">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                <p className="text-emerald-400 font-medium text-sm">PIN Reset Successful!</p>
                                <p className="text-xs text-slate-400 mt-1">Your access PIN has been updated. You can now log in with your new credentials.</p>
                                <button 
                                    onClick={() => setShowForgotPassword(false)}
                                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded transition-colors shadow-lg shadow-emerald-900/20"
                                >
                                    Proceed to Login
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Login;
