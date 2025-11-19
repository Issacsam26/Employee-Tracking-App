
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User, Briefcase, Building, AlertCircle, Hash } from 'lucide-react';

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

  const toggleSignup = () => {
      setIsSignup(!isSignup);
      setError('');
      setPassword('');
      setEmpPin('');
      setConfirmPin('');
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
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">Password</label>
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
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 text-left uppercase tracking-wide">{isSignup ? 'Create Access PIN' : 'Enter Access PIN'}</label>
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
    </div>
  );
};

export default Login;
