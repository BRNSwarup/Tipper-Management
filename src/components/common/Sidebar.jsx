import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Building2,
  Route,
  Fuel,
  Wrench,
  Disc,
  BookOpen,
  FileCheck,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simple, plain language navigation labels
  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Our Tippers & Trucks', path: '/trucks', icon: Truck, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Drivers List', path: '/drivers', icon: Users, roles: ['owner', 'manager', 'accountant'] },
    { name: 'Clients & Customers', path: '/parties', icon: Building2, roles: ['owner', 'manager', 'accountant'] },
    { name: 'Trips & Deliveries', path: '/trips', icon: Route, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Diesel & KM Mileage', path: '/fuel', icon: Fuel, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Truck Repairs & Service', path: '/maintenance', icon: Wrench, roles: ['owner', 'manager', 'accountant'] },
    { name: 'Tyre Management', path: '/tyres', icon: Disc, roles: ['owner', 'manager', 'accountant'] },
    { name: 'Driver Accounts & Cash', path: '/ledger', icon: BookOpen, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Truck & Driver Papers', path: '/documents', icon: FileCheck, roles: ['owner', 'manager', 'accountant', 'driver'] },
    { name: 'Customer Bills & Invoices', path: '/invoices', icon: Receipt, roles: ['owner', 'accountant'] },
    { name: 'Payment Receipts', path: '/payments', icon: CreditCard, roles: ['owner', 'accountant'] },
    { name: 'Pending Customer Money', path: '/receivables', icon: TrendingUp, roles: ['owner', 'accountant'] },
    { name: 'Reports & Profit Summary', path: '/reports', icon: BarChart3, roles: ['owner', 'manager', 'accountant'] },
    { name: 'App Settings & Database', path: '/settings', icon: Settings, roles: ['owner', 'manager', 'accountant', 'driver'] }
  ];

  const allowedNav = navigation.filter(item => item.roles.includes(role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-orange-200 text-slate-900 w-56 sm:w-60 select-none shadow-md">
      {/* Brand Header - Round Sangu's Tippers Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-900 bg-slate-950 text-white shrink-0">
        <img
          src="/sangu-logo.png"
          alt="Sangu's Tippers Logo"
          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-md shadow-orange-500/30 shrink-0"
        />
        <div>
          <span className="text-sm font-black text-white tracking-tight block leading-none">Sangu's Tippers</span>
          <span className="text-[9.5px] text-orange-400 font-black tracking-wider uppercase mt-0.5 block">Fleet System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/30 translate-x-1 font-black"
                    : "text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 font-bold"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-orange-500")} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3.5 border-t border-orange-100 bg-orange-50/50 text-[10px] text-slate-600">
        <p className="font-extrabold text-slate-900">Sangu's Tippers System</p>
        <p className="text-[9.5px] text-emerald-700 font-black mt-0.5">✓ 100% Offline & Push Alerts Ready</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 bg-slate-950 text-white font-bold rounded-full shadow-2xl focus:outline-none cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex">
          <div className="w-60 h-full animate-slide-right">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};
