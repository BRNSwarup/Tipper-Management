import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { getSupabaseConfig } from '../../lib/supabase';
import { requestNotificationPermission, checkNotificationPermission, triggerTestNotification, checkAndTriggerExpiryNotifications } from '../../services/notificationService';
import { Bell, ShieldCheck, Database, LogOut, User, AlertTriangle, ChevronDown, Wifi, WifiOff, Smartphone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ pageTitle }) => {
  const { user, role, switchDemoRole, logout } = useAuth();
  const { getExpiringDocuments } = useData();
  const expiringDocs = getExpiringDocuments(30);

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationStatus, setNotificationStatus] = useState(checkNotificationPermission());
  const [testAlertToast, setTestAlertToast] = useState(false);

  const supabaseConfig = getSupabaseConfig();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkAndTriggerExpiryNotifications(expiringDocs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [expiringDocs]);

  const handleTestLiveNotification = async () => {
    const res = await triggerTestNotification();
    setNotificationStatus(res);

    // Show visual confirmation toast
    setTestAlertToast(true);
    setTimeout(() => setTestAlertToast(false), 4000);
  };

  const roleLabels = {
    owner: { title: "Owner Account", color: "bg-slate-900 text-white border-slate-900" },
    manager: { title: "Manager", color: "bg-blue-600 text-white border-blue-600" },
    accountant: { title: "Accountant", color: "bg-emerald-600 text-white border-emerald-600" },
    driver: { title: "Driver Mode", color: "bg-amber-600 text-white border-amber-600" }
  };

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-white/95 border-b border-orange-200 text-slate-900 backdrop-blur-md shadow-xs shrink-0">
      {/* Page Title & Sangu's Tippers Subtitle */}
      <div>
        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{pageTitle}</h1>
        <p className="text-[11px] text-orange-600 font-extrabold hidden sm:block">Sangu's Tippers Fleet Management</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline / Online Status Indicator */}
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
          }`}
          title={isOnline ? "Connected to Internet" : "No Internet - App is 100% Working Offline!"}
        >
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Working Offline'}</span>
        </span>

        {/* Supabase Connection Status Badge */}
        <Link
          to="/settings"
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border transition-all ${
            supabaseConfig.isConfigured 
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>{supabaseConfig.isConfigured ? 'Supabase Live' : 'Offline Demo Mode'}</span>
        </Link>

        {/* Role Switcher Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all shadow-2xs ${roleLabels[role]?.color}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ROLE: {role.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-100">
                Switch Role Mode
              </div>
              {Object.keys(roleLabels).map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => {
                    switchDemoRole(roleKey);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors flex items-center justify-between ${
                    role === roleKey ? 'text-slate-900 font-bold bg-slate-100' : 'text-slate-700 font-medium'
                  }`}
                >
                  <span>{roleLabels[roleKey].title}</span>
                  {role === roleKey && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prominent Test Live Notification Button */}
        <button
          onClick={handleTestLiveNotification}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg cursor-pointer shadow-md transition-all active:scale-95"
          title="Click to test device push notification alert"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Test Notification</span>
        </button>

        {/* Document Expiry Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsPopover(!showAlertsPopover)}
            className="relative p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
            title="Expiring Papers Notifications"
          >
            <Bell className="w-4 h-4" />
            {expiringDocs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full">
                {expiringDocs.length}
              </span>
            )}
          </button>

          {showAlertsPopover && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Expiring Papers ({expiringDocs.length})
                </span>
                <Link to="/documents" className="text-blue-600 hover:underline text-[11px] font-bold" onClick={() => setShowAlertsPopover(false)}>View All</Link>
              </div>

              {expiringDocs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">All truck & driver papers are valid!</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {expiringDocs.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{doc.document_type.toUpperCase()} #{doc.document_number}</p>
                        <p className="text-[11px] text-slate-500">{doc.entity_type === 'truck' ? 'Truck Paper' : 'Driver Paper'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.daysLeft <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.daysLeft <= 0 ? 'EXPIRED' : `${doc.daysLeft}d left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-orange-200">
          <img src="/sangu-logo.png" alt="Sangu Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-orange-500 shadow-sm shrink-0" />
          <button
            onClick={logout}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Toast Notification Banner when Test Notification Button is clicked */}
      {testAlertToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-amber-400 flex items-start gap-3 max-w-sm animate-bounce">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-xs text-amber-400">🔔 Live Push Alert Triggered!</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Native Push Notification sent to your device browser. (Check your laptop / phone notification tray!)
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
