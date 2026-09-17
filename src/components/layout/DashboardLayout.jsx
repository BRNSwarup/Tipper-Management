import React from 'react';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

export const DashboardLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-[#fffcf8] text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-56 lg:pl-60 flex flex-col min-w-0">
        <Header pageTitle={title} />
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
