import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Building2,
  Calendar
} from 'lucide-react';

export const Payments = () => {
  const { payments, invoices, parties, addPayment, updateItem } = useData();
  const { canManageFinancials } = useAuth();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: invoices[0]?.id || '',
    party_id: parties[0]?.id || '',
    amount_paid: 50000,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'bank_transfer',
    reference_number: `UTR-NEFT-${Math.floor(100000000 + Math.random() * 900000000)}`,
    notes: 'Freight invoice part payment received'
  });

  const handleOpenForm = () => {
    setFormData({
      invoice_id: invoices[0]?.id || '',
      party_id: parties[0]?.id || '',
      amount_paid: 50000,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'bank_transfer',
      reference_number: `UTR-NEFT-${Math.floor(100000000 + Math.random() * 900000000)}`,
      notes: 'Freight payment received into bank'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === formData.invoice_id);

    addPayment({
      ...formData,
      party_id: inv ? inv.party_id : formData.party_id
    });

    // Check if fully paid
    if (inv) {
      const prevPaid = payments.filter(p => p.invoice_id === inv.id).reduce((s, p) => s + Number(p.amount_paid), 0);
      const newPaid = prevPaid + Number(formData.amount_paid);
      if (newPaid >= Number(inv.total_amount)) {
        updateItem('invoices', inv.id, { payment_status: 'paid' }, 'invoices');
      } else {
        updateItem('invoices', inv.id, { payment_status: 'partially_paid' }, 'invoices');
      }
    }

    setIsFormOpen(false);
  };

  const filteredPayments = payments.filter(p => {
    const inv = invoices.find(i => i.id === p.invoice_id);
    const pty = parties.find(pt => pt.id === p.party_id);
    const matchesSearch = (p.reference_number && p.reference_number.toLowerCase().includes(search.toLowerCase())) ||
                          (inv && inv.invoice_number.toLowerCase().includes(search.toLowerCase())) ||
                          (pty && pty.name.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const exportData = filteredPayments.map(p => {
    const inv = invoices.find(i => i.id === p.invoice_id);
    const pty = parties.find(pt => pt.id === p.party_id);
    return {
      PaymentDate: p.payment_date,
      InvoiceNo: inv?.invoice_number || '',
      Party: pty?.name || '',
      AmountPaid: p.amount_paid,
      PaymentMode: p.payment_mode,
      ReferenceUTR: p.reference_number || '',
      Notes: p.notes || ''
    };
  });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

  return (
    <DashboardLayout title="Client Payment Receipts & Collections">
      {/* Payment Summary */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Payments Collected</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CreditCard className="w-6 h-6" />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reference UTR #, Invoice #, Party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="payments_log.csv" />
          {canManageFinancials && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Date & Invoice</th>
              <th className="py-3 px-3">Client Party</th>
              <th className="py-3 px-3">Payment Mode & UTR</th>
              <th className="py-3 px-3">Amount Received</th>
              <th className="py-3 px-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredPayments.map(p => {
              const inv = invoices.find(i => i.id === p.invoice_id);
              const pty = parties.find(pt => pt.id === p.party_id);
              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-100 block">{p.payment_date}</span>
                    <span className="text-[10px] text-sky-400 font-mono">Invoice #{inv?.invoice_number || 'N/A'}</span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-200">{pty?.name || 'Client'}</td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-200 block uppercase">{p.payment_mode.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.reference_number || 'No Ref'}</span>
                  </td>

                  <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                    ₹{Number(p.amount_paid).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-slate-400">{p.notes || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Payment Receipt Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Record Client Payment Receipt"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Linked Invoice *</label>
              <select
                required
                value={formData.invoice_id}
                onChange={(e) => {
                  const invId = e.target.value;
                  const inv = invoices.find(i => i.id === invId);
                  setFormData({
                    ...formData,
                    invoice_id: invId,
                    party_id: inv ? inv.party_id : formData.party_id,
                    amount_paid: inv ? inv.total_amount : formData.amount_paid
                  });
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {invoices.map(i => (
                  <option key={i.id} value={i.id}>{i.invoice_number} (₹{Number(i.total_amount).toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Amount Received (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payment Mode</label>
              <select
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="bank_transfer">NEFT / RTGS Bank Transfer</option>
                <option value="upi">UPI Payment</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Bank Reference / UTR Number</label>
            <input
              type="text"
              placeholder="e.g. UTR-NEFT-991820491"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Notes / Remarks</label>
            <input
              type="text"
              placeholder="Part payment notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              Save Payment Receipt
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
