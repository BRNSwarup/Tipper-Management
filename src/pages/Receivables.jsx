import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';

export const Receivables = () => {
  const { invoices, parties, payments, calculateAgingReceivables } = useData();

  const aging = calculateAgingReceivables();

  // Detail list for each unpaid invoice with aging bracket
  const now = new Date();
  const detailedAging = invoices.filter(inv => inv.payment_status !== 'paid').map(inv => {
    const party = parties.find(p => p.id === inv.party_id);
    const total = Number(inv.total_amount || 0);
    const paid = payments.filter(p => p.invoice_id === inv.id).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const outstanding = Math.max(0, total - paid);

    const invDate = new Date(inv.invoice_date || inv.created_at);
    const daysOld = Math.floor((now - invDate) / (1000 * 60 * 60 * 24));

    let category = "0-30 Days";
    if (daysOld > 90) category = "90+ Days (Critical)";
    else if (daysOld > 60) category = "60-90 Days";
    else if (daysOld > 30) category = "30-60 Days";

    return {
      ...inv,
      party_name: party?.name || 'Client',
      outstanding,
      daysOld,
      category
    };
  }).sort((a, b) => b.daysOld - a.daysOld);

  const exportData = detailedAging.map(i => ({
    InvoiceNo: i.invoice_number,
    Party: i.party_name,
    InvoiceDate: i.invoice_date,
    DueDate: i.due_date,
    TotalAmount: i.total_amount,
    Outstanding: i.outstanding,
    AgeDays: i.daysOld,
    BracketCategory: i.category
  }));

  return (
    <DashboardLayout title="Receivables & Aging Analysis Report">
      {/* KPI Aging Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Current (0–30 Days)</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">₹{aging.days0_30.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Standard credit terms</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">30–60 Days Outstanding</span>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">₹{aging.days30_60.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Follow-up reminders sent</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">60–90 Days Outstanding</span>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">₹{aging.days60_90.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Urgent recovery required</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 bg-rose-950/20">
          <span className="text-xs text-rose-300 font-bold uppercase block flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> 90+ Days Critical
          </span>
          <h3 className="text-2xl font-black text-rose-400 mt-1">₹{aging.days90Plus.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-rose-300/80 mt-1">Severe overdue risk</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Total Outstanding Receivables: ₹{aging.totalOutstanding.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400">{detailedAging.length} unpaid / partially paid client invoices</p>
        </div>
        <ExportButton data={exportData} filename="receivables_aging_report.csv" />
      </div>

      {/* Detailed Aging Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Invoice #</th>
              <th className="py-3 px-3">Client Party</th>
              <th className="py-3 px-3">Invoice Date</th>
              <th className="py-3 px-3">Age (Days)</th>
              <th className="py-3 px-3">Total Invoice</th>
              <th className="py-3 px-3">Outstanding Amount</th>
              <th className="py-3 px-3">Aging Bracket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {detailedAging.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-100">{inv.invoice_number}</td>
                <td className="py-3 px-3 font-semibold text-slate-200">{inv.party_name}</td>
                <td className="py-3 px-3 text-slate-400">{inv.invoice_date}</td>
                <td className="py-3 px-3 font-bold text-sky-400">{inv.daysOld} Days</td>
                <td className="py-3 px-3 font-semibold text-slate-200">₹{Number(inv.total_amount).toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 font-black text-rose-400 text-sm">₹{inv.outstanding.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    inv.daysOld > 90 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 badge-glow-rose' :
                    inv.daysOld > 60 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    inv.daysOld > 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {inv.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
