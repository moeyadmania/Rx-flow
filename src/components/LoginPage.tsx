import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  HeartPulse, 
  Key, 
  User, 
  Users, 
  Truck, 
  Activity, 
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';

export interface UserSession {
  username: string;
  role: 'admin' | 'pharmacist' | 'driver';
  fullName: string;
  badgeId: string;
  scope: string[];
}

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'pharmacist' | 'driver'>('admin');
  const [username, setUsername] = useState('admin_master');
  const [password, setPassword] = useState('rx-admin-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill convenience triggers
  const handleRolePresetSelect = (role: 'admin' | 'pharmacist' | 'driver') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setUsername('admin_master');
      setPassword('rx-admin-2026');
    } else if (role === 'pharmacist') {
      setUsername('pharmacist_moeyad');
      setPassword('ph-gate-77');
    } else if (role === 'driver') {
      setUsername('driver_courier_b');
      setPassword('dispatch-express');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simulated short verification flow for snappy feel
    setTimeout(() => {
      // Validate presets
      const lowerUser = username.trim().toLowerCase();
      const lowerPass = password.trim();

      if (!username.trim() || !password.trim()) {
        setError('Please fill in both the identity username and access key.');
        setIsSubmitting(false);
        return;
      }

      let matchedSession: UserSession | null = null;

      if (selectedRole === 'admin') {
        if (lowerUser === 'admin_master' && lowerPass === 'rx-admin-2026') {
          matchedSession = {
            username: 'admin_master',
            role: 'admin',
            fullName: 'Admin Operations Control',
            badgeId: 'BADGE-[#0001]',
            scope: ['dashboard', 'medications', 'dispensing', 'refills', 'deliveries', 'crm']
          };
        } else {
          setError('Invalid Admin credentials. Tip: Click the presetted tags below to auto-fill.');
        }
      } else if (selectedRole === 'pharmacist') {
        if (lowerUser === 'pharmacist_moeyad' && lowerPass === 'ph-gate-77') {
          matchedSession = {
            username: 'pharmacist_moeyad',
            role: 'pharmacist',
            fullName: 'Dr. Moeyad M. (Lead Pharmacist)',
            badgeId: 'PHARM-[#1140]',
            scope: ['dashboard', 'medications', 'dispensing', 'refills', 'crm']
          };
        } else {
          setError('Invalid Pharmacist passcode. Tip: Select the lead pharmacist preset tab.');
        }
      } else if (selectedRole === 'driver') {
        if (lowerUser === 'driver_courier_b' && lowerPass === 'dispatch-express') {
          matchedSession = {
            username: 'driver_courier_b',
            role: 'driver',
            fullName: 'Driver B (Active Logistics)',
            badgeId: 'DRIVER-[#0089]',
            scope: ['deliveries']
          };
        } else {
          setError('Invalid Courier passcode. Tip: Select the driver preset block.');
        }
      }

      if (matchedSession) {
        onLoginSuccess(matchedSession);
      } else {
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans select-none" id="secure-login-matrix">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 z-0"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10">
        
        {/* Left column: Branded info and role scoping blueprint */}
        <div className="w-full md:w-5/12 bg-slate-900/60 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 rounded-2xl text-white">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">RxFlow Portal</h1>
                <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-1">SECURED TERMINAL v2.10</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-205">Role Safety Scopes</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Roles define system interfaces to guarantee visual clarity and data confidentiality compliance.
              </p>
            </div>

            {/* Scope Matrix Preview */}
            <div className="space-y-3 pt-2">
              <div className={`p-3 rounded-2xl border transition-all ${
                selectedRole === 'admin' 
                  ? 'bg-slate-800/80 border-amber-500/30 text-slate-200' 
                  : 'bg-slate-950/40 border-slate-900/60 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold font-sans">System Administrator</span>
                </div>
                {selectedRole === 'admin' && (
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Unrestricted access to all core modules. Complete power over chemical stockrooms, database tables, Rx dispatches, and user registries.
                  </p>
                )}
              </div>

              <div className={`p-3 rounded-2xl border transition-all ${
                selectedRole === 'pharmacist' 
                  ? 'bg-slate-800/80 border-teal-500/30 text-slate-200' 
                  : 'bg-slate-950/40 border-slate-900/60 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${selectedRole === 'pharmacist' ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold font-sans">Lead Pharmacist</span>
                </div>
                {selectedRole === 'pharmacist' && (
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Accesses Overview, Inventory cataloging, Clinical dispensing steps, secure online telehealth requests, and CRM timeline files. (Logistics disabled).
                  </p>
                )}
              </div>

              <div className={`p-3 rounded-2xl border transition-all ${
                selectedRole === 'driver' 
                  ? 'bg-slate-800/80 border-sky-500/30 text-slate-200' 
                  : 'bg-slate-950/40 border-slate-900/60 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 ${selectedRole === 'driver' ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold font-sans">Active Courier Driver</span>
                </div>
                {selectedRole === 'driver' && (
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Restricted driver-centric delivery portal. Accesses ONLY the courier map routing console to update dispatches and message clients.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 hidden md:block">
            <p className="text-[9px] text-slate-500 font-mono">
              Encryption standard: AES-256 secure tunnel
              <br />
              Authorized medical personnel only.
            </p>
          </div>
        </div>

        {/* Right column: Form and pre-login options */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center text-left">
          
          {/* Preset Buttons Header */}
          <div className="space-y-2 mb-6">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Sandbox Workspace Role Selection</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRolePresetSelect('admin')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'admin'
                    ? 'bg-amber-600/10 border-amber-500 text-amber-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleRolePresetSelect('pharmacist')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'pharmacist'
                    ? 'bg-teal-650/10 border-teal-500 text-teal-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Pharmacist</span>
              </button>
              <button
                type="button"
                onClick={() => handleRolePresetSelect('driver')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'driver'
                    ? 'bg-sky-600/10 border-sky-500 text-sky-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username/Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-500" />
                <span>Identification Username</span>
              </label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. admin_master"
                className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-slate-900 transition font-sans"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-slate-500" />
                  <span>Access Pin / Private Password</span>
                </span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-250 text-xs px-4 py-3 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-slate-900 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credentials preset tip box */}
            <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl">
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                <span>
                  <strong>Tip Check:</strong> Presets are pre-filled! Just click <strong>Sign In</strong> below or click one of the preset tags above to automatically configure target sandbox credentials.
                </span>
              </p>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-start gap-2 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium font-sans">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-805 disabled:text-slate-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating Identity...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Passcode & Enter Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Preset parameters list */}
          <div className="mt-5 pt-4 border-t border-slate-850 space-y-1.5 text-[10px] text-slate-500 font-mono bg-slate-950/20 p-3 rounded-xl border border-slate-900">
            <div className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Authorization Database Preset Records:</div>
            <div className="flex justify-between items-center">
              <span>Admin: <strong className="text-slate-400">admin_master</strong></span>
              <span>Pass: <strong className="text-slate-400">rx-admin-2026</strong></span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pharmacist: <strong className="text-slate-400">pharmacist_moeyad</strong></span>
              <span>Pass: <strong className="text-slate-400">ph-gate-77</strong></span>
            </div>
            <div className="flex justify-between items-center">
              <span>Driver/Courier: <strong className="text-slate-400">driver_courier_b</strong></span>
              <span>Pass: <strong className="text-slate-400">dispatch-express</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
