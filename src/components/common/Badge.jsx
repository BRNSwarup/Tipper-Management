import React from 'react';
import clsx from 'clsx';

export const StatusBadge = ({ type, value }) => {
  if (!value) return null;

  const valLower = String(value).toLowerCase();

  const styles = {
    // Truck & Driver Statuses
    available: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
    active: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
    on_trip: "bg-blue-50 text-blue-700 border-blue-300 font-bold",
    maintenance: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    on_leave: "bg-purple-50 text-purple-700 border-purple-300 font-bold",
    inactive: "bg-slate-100 text-slate-600 border-slate-300 font-bold",

    // Trip Statuses
    planned: "bg-indigo-50 text-indigo-700 border-indigo-300 font-bold",
    running: "bg-blue-50 text-blue-700 border-blue-300 font-bold animate-pulse",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
    billed: "bg-purple-50 text-purple-700 border-purple-300 font-bold",
    closed: "bg-slate-100 text-slate-700 border-slate-300 font-bold",

    // Invoice Payment Statuses
    paid: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
    partially_paid: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    unpaid: "bg-red-50 text-red-700 border-red-300 font-bold",
    overdue: "bg-red-100 text-red-800 border-red-400 font-bold animate-bounce",

    // Default
    default: "bg-slate-100 text-slate-800 border-slate-300"
  };

  const activeStyle = styles[valLower] || styles.default;
  const displayLabel = value.replace(/_/g, ' ').toUpperCase();

  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide border uppercase transition-all", activeStyle)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 opacity-80" />
      {displayLabel}
    </span>
  );
};
