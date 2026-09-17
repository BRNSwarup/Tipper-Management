import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getSupabaseConfig, updateSupabaseCredentials } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { Database, ShieldCheck, RefreshCw, Key, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const config = getSupabaseConfig();
  const { resetToSeedData } = useData();

  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.key || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setSavedSuccess(true);
  };

  const handleResetDemo = () => {
    if (window.confirm("Reset all fleet data back to original pre-populated seed dataset?")) {
      resetToSeedData();
      window.location.reload();
    }
  };

  return (
    <DashboardLayout title="System Settings & Supabase Connection">
      <div className="max-w-3xl space-y-6">
        {/* Supabase Connection Status Banner */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${
          config.isConfigured 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            <div>
              <h3 className="text-sm font-bold">
                {config.isConfigured ? 'Live Supabase Database Connected' : 'Running in Pre-seeded Fleet Demo Mode'}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                {config.isConfigured 
                  ? 'Queries, Auth & Storage are syncing directly to your Supabase PostgreSQL cloud backend.' 
                  : 'You can test all full-stack features out-of-the-box, or enter your Supabase URL & Key below to switch to live cloud database.'}
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-sky-400" /> Supabase API Configuration
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">VITE_SUPABASE_URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">VITE_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20"
              >
                Save & Connect Supabase
              </button>

              {savedSuccess && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Credentials Saved! Reloading...
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Reset Demo Data Card */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Reset Demo Fleet Dataset</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reset local storage state to original 15 Trucks, 15 Drivers, 35 Trips & Financials.
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
