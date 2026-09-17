import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  DollarSign,
  Users,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export const DriverLedger = () => {
  const { driverLedger, drivers, trips, addLedgerEntry, calculateDriverBalance } = useData();
  const { canManageFinancials } = useAuth();

  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    driver_id: drivers[0]?.id || '',
    trip_id: '',
    entry_type: 'advance',
    amount: 5000,
    direction: 'debit',
    date: new Date().toISOString().split('T')[0],
    remarks: 'Trip advance cash given to driver'
  });

  const handleOpenForm = () => {
    setFormData({
      driver_id: selectedDriverId || drivers[0]?.id || '',
      trip_id: '',
      entry_type: 'advance',
      amount: 5000,
      direction: 'debit',
      date: new Date().toISOString().split('T')[0],
      remarks: 'Driver trip advance'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addLedgerEntry(formData);
    setIsFormOpen(false);
  };

  const activeDriver = drivers.find(d => d.id === selectedDriverId);
  const driverEntries = driverLedger.filter(l => l.driver_id === selectedDriverId);
  const balance = calculateDriverBalance(selectedDriverId);

  const filteredEntries = driverEntries.filter(l => {
    return !search || l.entry_type.toLowerCase().includes(search.toLowerCase()) ||
           (l.remarks && l.remarks.toLowerCase().includes(search.toLowerCase()));
  });

  const exportData = filteredEntries.map(l => ({
    Date: l.date,
    Driver: activeDriver?.name || '',
    EntryType: l.entry_type,
    Direction: l.direction,
    Amount: l.amount,
    Remarks: l.remarks
  }));

  return (
    <DashboardLayout title="Driver Ledger & Financial Settlements">
      {/* Driver Selector & Balance Header */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {activeDriver?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 font-bold text-slate-100 text-sm focus:outline-none cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Licence: {activeDriver?.licence_number} • Rate: ₹{activeDriver?.rate} ({activeDriver?.salary_type})
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Driver Running Net Balance</span>
          <h3 className={`text-2xl font-black ${balance > 0 ? 'text-amber-400' : balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ₹{Math.abs(balance).toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            {balance > 0 ? 'Driver holds Cash Advance from Office' : balance < 0 ? 'Office owes Driver Reimbursement' : 'Account Fully Settled'}
          </span>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ledger Entry, Remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename={`driver_ledger_${activeDriver?.name}.csv`} />
          {canManageFinancials && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Ledger Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Entry Type</th>
              <th className="py-3 px-3">Linked Trip</th>
              <th className="py-3 px-3">Remarks</th>
              <th className="py-3 px-3 text-right">Debit (Advance / Given)</th>
              <th className="py-3 px-3 text-right">Credit (Expense / Bata)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEntries.map(entry => {
              const trip = trips.find(t => t.id === entry.trip_id);
              const isDebit = entry.direction === 'debit';
              return (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-100">{entry.date}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-sky-400">
                      {entry.entry_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{trip?.trip_number || 'Direct Entry'}</td>
                  <td className="py-3 px-3 text-slate-300">{entry.remarks || '-'}</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">
                    {isDebit ? `+₹${Number(entry.amount).toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">
                    {!isDebit ? `-₹${Number(entry.amount).toLocaleString()}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Ledger Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Record Driver Ledger Entry / Settlement"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Driver *</label>
              <select
                required
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Entry Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Entry Type *</label>
              <select
                value={formData.entry_type}
                onChange={(e) => {
                  const type = e.target.value;
                  let dir = 'debit';
                  if (['expense_claim', 'bata', 'salary'].includes(type)) dir = 'credit';
                  setFormData({ ...formData, entry_type: type, direction: dir });
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="advance">Trip Advance Paid</option>
                <option value="expense_claim">Expense Claim (Receipt)</option>
                <option value="bata">Daily Bata Allowance</option>
                <option value="salary">Monthly Salary Credit</option>
                <option value="deduction">Fine / Damage Deduction</option>
                <option value="settlement">Account Settlement Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Financial Direction</label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="debit">Debit (+ Office paid to Driver)</option>
                <option value="credit">Credit (- Driver claimed from Office)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Remarks / Description</label>
            <input
              type="text"
              placeholder="e.g. Cash advance given for Mumbai trip"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl"
            >
              Confirm Ledger Entry
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
