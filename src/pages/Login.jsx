import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, Key, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { loginWithSupabase, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSupabaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithSupabase(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials or use Demo Login below.');
    }
  };

  const handleDemoSelect = (roleKey) => {
    switchDemoRole(roleKey);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/20 font-black">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sangu's Tippers</h1>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Tipper Fleet & Commercial Logistics System</p>
        </div>

        {/* Login Form */}
        <div className="p-6 rounded-2xl glass-card border border-[#24324a] space-y-4">
          <h2 className="text-sm font-bold text-slate-200">Supabase Auth Sign In</h2>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSupabaseSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="owner@sangustippers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Sign In with Supabase
            </button>
          </form>
        </div>

        {/* Quick Demo Role Logins */}
        <div className="p-6 rounded-2xl glass-card border border-[#24324a] space-y-3">
          <span className="text-xs font-black text-amber-400 block uppercase tracking-wider">
            ⚡ Quick Demo Sign-In (Select Role)
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoSelect('owner')}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-left cursor-pointer transition-all"
            >
              <span className="font-bold block">Owner Role</span>
              <span className="text-[10px] text-amber-400">Full System Admin</span>
            </button>

            <button
              onClick={() => handleDemoSelect('manager')}
              className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-left cursor-pointer transition-all"
            >
              <span className="font-bold block">Manager Role</span>
              <span className="text-[10px] text-sky-400">Fleet Operations</span>
            </button>

            <button
              onClick={() => handleDemoSelect('accountant')}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-left cursor-pointer transition-all"
            >
              <span className="font-bold block">Accountant Role</span>
              <span className="text-[10px] text-emerald-400">Invoices & Ledger</span>
            </button>

            <button
              onClick={() => handleDemoSelect('driver')}
              className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-left cursor-pointer transition-all"
            >
              <span className="font-bold block">Driver Role</span>
              <span className="text-[10px] text-purple-400">Assigned Trips Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
