import React from 'react';
import clsx from 'clsx';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend }) => {
  const iconThemeMap = {
    blue: "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25",
    emerald: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25",
    amber: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25",
    rose: "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md shadow-rose-500/25",
    indigo: "bg-gradient-to-tr from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/25",
    purple: "bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25"
  };

  const currentIconTheme = iconThemeMap[color] || iconThemeMap.blue;

  return (
    <div className="relative p-4 bg-white rounded-2xl border border-slate-200 shadow-sm glass-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">{title}</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 font-bold">
              {trend && (
                <span className={trend > 0 ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              <span>{subtitle}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx("p-3 rounded-xl flex items-center justify-center shrink-0", currentIconTheme)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
