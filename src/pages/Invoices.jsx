import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  FileText,
  DollarSign,
  CheckCircle2,
  Calendar,
  Building2,
  X
} from 'lucide-react';

export const Invoices = () => {
  const { invoices, parties, trips, invoiceTrips, addInvoice, payments } = useData();
  const { canManageFinancials } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoice_number: `INV-2026-0${invoices.length + 1}`,
    party_id: parties[0]?.id || '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gst_rate: 5.00,
    selected_trip_ids: []
  });

  const handleOpenForm = () => {
    setFormData({
      invoice_number: `INV-2026-0${invoices.length + 5}`,
      party_id: parties[0]?.id || '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gst_rate: 5.00,
      selected_trip_ids: []
    });
    setIsFormOpen(true);
  };

  const handleTripToggle = (tripId) => {
    setFormData(prev => {
      const exists = prev.selected_trip_ids.includes(tripId);
      const updated = exists ? prev.selected_trip_ids.filter(id => id !== tripId) : [...prev.selected_trip_ids, tripId];
      return { ...prev, selected_trip_ids: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTrips = trips.filter(t => formData.selected_trip_ids.includes(t.id));
    const taxable_amount = selectedTrips.reduce((sum, t) => sum + Number(t.freight_amount || 0), 0);
    const gst_amount = (taxable_amount * formData.gst_rate) / 100;
    const total_amount = taxable_amount + gst_amount;

    addInvoice({
      invoice_number: formData.invoice_number,
      party_id: formData.party_id,
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      taxable_amount,
      gst_rate: formData.gst_rate,
      gst_amount,
      total_amount,
      payment_status: 'unpaid'
    });

    setIsFormOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const pty = parties.find(p => p.id === inv.party_id);
    const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
                          (pty && pty.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportData = filteredInvoices.map(inv => {
    const pty = parties.find(p => p.id === inv.party_id);
    return {
      InvoiceNumber: inv.invoice_number,
      Party: pty?.name || '',
      InvoiceDate: inv.invoice_date,
      DueDate: inv.due_date,
      TaxableAmount: inv.taxable_amount,
      GSTRate: `${inv.gst_rate}%`,
      GSTAmount: inv.gst_amount,
      TotalAmount: inv.total_amount,
      PaymentStatus: inv.payment_status
    };
  });

  const availableTripsForParty = trips.filter(t => t.party_id === formData.party_id && ['delivered', 'closed'].includes(t.status));

  return (
    <DashboardLayout title="Freight Invoicing & Billing Control">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice #, Party Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Payment Statuses</option>
            <option value="unpaid">Unpaid / Outstanding</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="freight_invoices.csv" />
          {canManageFinancials && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Tax Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Invoice # & Date</th>
              <th className="py-3 px-3">Billed Client Party</th>
              <th className="py-3 px-3">Taxable & GST</th>
              <th className="py-3 px-3">Total Payable</th>
              <th className="py-3 px-3">Payment Status</th>
              <th className="py-3 px-3 text-right">PDF Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredInvoices.map(inv => {
              const party = parties.find(p => p.id === inv.party_id);
              const paidAmt = payments.filter(p => p.invoice_id === inv.id).reduce((sum, p) => sum + Number(p.amount_paid), 0);
              return (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-100 font-mono block">{inv.invoice_number}</span>
                    <span className="text-[10px] text-slate-500">Issued: {inv.invoice_date} (Due: {inv.due_date})</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200 block">{party?.name || 'Client'}</span>
                    <span className="text-[10px] text-slate-400">GSTIN: {party?.gstin || 'N/A'}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200 block">₹{Number(inv.taxable_amount).toLocaleString()}</span>
                    <span className="text-[10px] text-sky-400">GST ({inv.gst_rate}%): ₹{Number(inv.gst_amount).toLocaleString()}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-black text-emerald-400 text-sm block">₹{Number(inv.total_amount).toLocaleString()}</span>
                    {paidAmt > 0 && <span className="text-[10px] text-slate-400">Paid: ₹{paidAmt.toLocaleString()}</span>}
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge type="invoice" value={inv.payment_status} />
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setPrintingInvoice(inv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-400" />
                      <span>Print / PDF</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Generate Tax Invoice Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Generate Transport Freight Tax Invoice"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Invoice Number *</label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Select Billed Client Party *</label>
              <select
                required
                value={formData.party_id}
                onChange={(e) => setFormData({ ...formData, party_id: e.target.value, selected_trip_ids: [] })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.party_type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Invoice Date</label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payment Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">GST Rate (%)</label>
              <select
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value={5.00}>5% GST (Reverse Charge / RCM)</option>
                <option value={12.00}>12% GST Forward Charge</option>
                <option value={0.00}>0% Exempted Transport</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Select Delivered Trips to Include in Invoice ({formData.selected_trip_ids.length} Selected)
            </label>

            {availableTripsForParty.length === 0 ? (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500 text-center">
                No unbilled delivered trips for this party. (Select a party with delivered trips).
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableTripsForParty.map(t => (
                  <label key={t.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between cursor-pointer hover:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.selected_trip_ids.includes(t.id)}
                        onChange={() => handleTripToggle(t.id)}
                        className="w-4 h-4 text-sky-500 rounded border-slate-700 bg-slate-900"
                      />
                      <div>
                        <span className="font-bold text-slate-200 block">{t.trip_number} ({t.source_city} → {t.destination_city})</span>
                        <span className="text-[10px] text-slate-400">LR #{t.lr_number} • {t.goods_description}</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">₹{Number(t.freight_amount).toLocaleString()}</span>
                  </label>
                ))}
              </div>
            )}
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
              Generate Tax Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice View Modal */}
      {printingInvoice && (() => {
        const party = parties.find(p => p.id === printingInvoice.party_id);
        const invTrips = trips.filter(t => invoiceTrips.some(it => it.invoice_id === printingInvoice.id && it.trip_id === t.id));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-8 shadow-2xl space-y-6 printable-area">
              {/* Header Action bar (Hidden on print) */}
              <div className="flex items-center justify-between no-print border-b border-slate-200 pb-4">
                <span className="font-bold text-slate-800">TAX INVOICE PREVIEW</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setPrintingInvoice(null)}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">SANGU'S TIPPERS & FREIGHT LOGISTICS</h1>
                  <p className="text-xs text-slate-600">Heavy Tipper Fleet Operations & Commercial Freight</p>
                  <p className="text-xs text-slate-600 mt-1">Plot 45, Transport Nagar, Nigdi, Pune - 411044</p>
                  <p className="text-xs text-slate-600">GSTIN: 27AABCT8812K1ZX • Phone: +91 22 6691 7000</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-sky-700 block">TAX INVOICE</span>
                  <span className="font-mono font-bold text-sm text-slate-800">#{printingInvoice.invoice_number}</span>
                  <p className="text-xs text-slate-600 mt-1">Date: {printingInvoice.invoice_date}</p>
                  <p className="text-xs text-slate-600">Due: {printingInvoice.due_date}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">BILLED TO (CONSIGNEE / CLIENT):</span>
                <h3 className="text-sm font-bold text-slate-900">{party?.name || 'Client'}</h3>
                <p className="text-slate-600">GSTIN: {party?.gstin || 'Unregistered'}</p>
                <p className="text-slate-600">Address: {party?.address || 'N/A'}</p>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="p-2.5 border border-slate-200">Trip # & LR #</th>
                    <th className="p-2.5 border border-slate-200">Route</th>
                    <th className="p-2.5 border border-slate-200">Cargo</th>
                    <th className="p-2.5 border border-slate-200 text-right">Freight (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(invTrips.length > 0 ? invTrips : trips.slice(0, 2)).map(t => (
                    <tr key={t.id} className="border-b border-slate-200">
                      <td className="p-2.5 border border-slate-200 font-mono font-bold">{t.trip_number} (LR #{t.lr_number})</td>
                      <td className="p-2.5 border border-slate-200">{t.source_city} → {t.destination_city}</td>
                      <td className="p-2.5 border border-slate-200">{t.goods_description} ({t.weight_tons}T)</td>
                      <td className="p-2.5 border border-slate-200 text-right font-bold">₹{Number(t.freight_amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Freight Amount:</span>
                    <span className="font-bold text-slate-900">₹{Number(printingInvoice.taxable_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({printingInvoice.gst_rate}% RCM):</span>
                    <span className="font-bold text-slate-900">₹{Number(printingInvoice.gst_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span>Total Invoice Payable:</span>
                    <span className="text-sky-700">₹{Number(printingInvoice.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
};
