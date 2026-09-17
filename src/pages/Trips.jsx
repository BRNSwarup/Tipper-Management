import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/Badge';
import { Modal, Drawer } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Route,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Fuel,
  Receipt,
  FileCheck,
  Upload,
  Calendar,
  Truck,
  Users,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const Trips = () => {
  const {
    trips,
    trucks,
    drivers,
    parties,
    tripExpenses,
    addTrip,
    updateTrip,
    deleteTrip,
    addTripExpense,
    calculateTripPnL
  } = useData();

  const { canManageOps, isDriver, user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [truckFilter, setTruckFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null); // for P&L drawer
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Trip form state
  const [formData, setFormData] = useState({
    trip_number: `TRP-2026-${Math.floor(100 + Math.random() * 900)}`,
    truck_id: '',
    driver_id: '',
    party_id: '',
    source_city: '',
    destination_city: '',
    lr_number: `LR-${Math.floor(1000000 + Math.random() * 9000000)}`,
    goods_description: 'General Freight / Commercial Goods',
    weight_tons: 20.00,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    starting_odometer: 100000,
    ending_odometer: 0,
    freight_amount: 100000.00,
    driver_advance: 20000.00,
    pod_file_url: '',
    status: 'planned'
  });

  // Expense entry form state
  const [expenseForm, setExpenseForm] = useState({
    category: 'fuel',
    amount: 5000,
    paid_by: 'driver',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    receipt_url: ''
  });

  const handleOpenForm = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData(trip);
    } else {
      setEditingTrip(null);
      const defaultTruck = trucks[0]?.id || '';
      const defaultDriver = drivers[0]?.id || '';
      const defaultParty = parties[0]?.id || '';
      const defaultOdo = trucks[0]?.current_odometer || 100000;

      setFormData({
        trip_number: `TRP-2026-${Math.floor(100 + Math.random() * 900)}`,
        truck_id: defaultTruck,
        driver_id: defaultDriver,
        party_id: defaultParty,
        source_city: 'Mumbai, MH',
        destination_city: 'Bengaluru, KA',
        lr_number: `LR-${Math.floor(1000000 + Math.random() * 9000000)}`,
        goods_description: 'Industrial Equipment & Goods',
        weight_tons: 22.50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        starting_odometer: defaultOdo,
        ending_odometer: 0,
        freight_amount: 120000.00,
        driver_advance: 25000.00,
        pod_file_url: '',
        status: 'planned'
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTrip) {
      updateTrip(editingTrip.id, formData);
    } else {
      addTrip(formData);
    }
    setIsFormOpen(false);
  };

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    addTripExpense({
      ...expenseForm,
      trip_id: selectedTrip.id
    });

    setIsExpenseModalOpen(false);
    setExpenseForm({
      category: 'fuel',
      amount: 5000,
      paid_by: 'driver',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
      receipt_url: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel and delete this trip record?")) {
      deleteTrip(id);
    }
  };

  // Filter trips (if driver role, show assigned trips only)
  let visibleTrips = trips;
  if (isDriver && user.assigned_driver_id) {
    visibleTrips = trips.filter(t => t.driver_id === user.assigned_driver_id);
  }

  const filteredTrips = visibleTrips.filter(t => {
    const matchesSearch = t.trip_number.toLowerCase().includes(search.toLowerCase()) ||
                          t.lr_number.toLowerCase().includes(search.toLowerCase()) ||
                          t.source_city.toLowerCase().includes(search.toLowerCase()) ||
                          t.destination_city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesTruck = !truckFilter || t.truck_id === truckFilter;
    return matchesSearch && matchesStatus && matchesTruck;
  });

  const exportData = filteredTrips.map(t => {
    const pnl = calculateTripPnL(t.id);
    const trk = trucks.find(tr => tr.id === t.truck_id);
    const drv = drivers.find(d => d.id === t.driver_id);
    const pty = parties.find(p => p.id === t.party_id);
    return {
      TripNumber: t.trip_number,
      TruckReg: trk?.registration_number || '',
      Driver: drv?.name || '',
      Party: pty?.name || '',
      Route: `${t.source_city} -> ${t.destination_city}`,
      LRNumber: t.lr_number,
      FreightAmount: t.freight_amount,
      TotalExpenses: pnl.totalExpenses,
      NetProfit: pnl.netProfit,
      MarginPercent: `${pnl.marginPercent}%`,
      Status: t.status,
      StartDate: t.start_date,
      EndDate: t.end_date || ''
    };
  });

  return (
    <DashboardLayout title="Central Trip Operations Hub">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Trip #, LR #, City Route..."
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
            <option value="">All Trip Statuses</option>
            <option value="planned">Planned</option>
            <option value="running">Running / En-route</option>
            <option value="delivered">Delivered / POD</option>
            <option value="billed">Billed / Invoiced</option>
            <option value="closed">Closed & Audited</option>
          </select>

          <select
            value={truckFilter}
            onChange={(e) => setTruckFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Trucks</option>
            {trucks.map(t => (
              <option key={t.id} value={t.id}>{t.registration_number}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="trips_master_list.csv" />
          {canManageOps && (
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Trip & LR #</th>
              <th className="py-3 px-3">Truck & Driver</th>
              <th className="py-3 px-3">Party & Route</th>
              <th className="py-3 px-3">Freight & Advance</th>
              <th className="py-3 px-3">Trip P&L (Net)</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTrips.map(trip => {
              const trk = trucks.find(t => t.id === trip.truck_id);
              const drv = drivers.find(d => d.id === trip.driver_id);
              const pty = parties.find(p => p.id === trip.party_id);
              const pnl = calculateTripPnL(trip.id);

              return (
                <tr key={trip.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-100 block">{trip.trip_number}</span>
                    <span className="text-[10px] text-slate-500 font-mono">LR: {trip.lr_number}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-sky-400 block">{trk?.registration_number || 'N/A'}</span>
                    <span className="text-[11px] text-slate-400">{drv?.name || 'N/A'}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200 block">{pty?.name || 'N/A'}</span>
                    <span className="text-[11px] text-slate-400">{trip.source_city} → {trip.destination_city}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-100 block">₹{Number(trip.freight_amount).toLocaleString()}</span>
                    <span className="text-[10px] text-amber-400">Adv: ₹{Number(trip.driver_advance || 0).toLocaleString()}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-bold block ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{pnl.netProfit.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">{pnl.marginPercent}% Margin</span>
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge type="trip" value={trip.status} />
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedTrip(trip)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> P&L Details
                      </button>

                      {canManageOps && (
                        <>
                          <button
                            onClick={() => handleOpenForm(trip)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Trip Wizard Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTrip ? "Edit Operational Trip" : "Create New Freight Trip"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Trip Number *</label>
              <input
                type="text"
                required
                value={formData.trip_number}
                onChange={(e) => setFormData({ ...formData, trip_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">LR (Lorry Receipt) # *</label>
              <input
                type="text"
                required
                value={formData.lr_number}
                onChange={(e) => setFormData({ ...formData, lr_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Trip Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="planned">Planned</option>
                <option value="running">Running</option>
                <option value="delivered">Delivered</option>
                <option value="billed">Billed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assign Truck *</label>
              <select
                required
                value={formData.truck_id}
                onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="">Select Truck</option>
                {trucks.map(t => (
                  <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assign Driver *</label>
              <select
                required
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Client Party *</label>
              <select
                required
                value={formData.party_id}
                onChange={(e) => setFormData({ ...formData, party_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="">Select Party</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.party_type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Source Origin City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai, MH"
                value={formData.source_city}
                onChange={(e) => setFormData({ ...formData, source_city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Destination City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, KA"
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Freight Agreed Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.freight_amount}
                onChange={(e) => setFormData({ ...formData, freight_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Driver Starting Advance (₹)</label>
              <input
                type="number"
                value={formData.driver_advance}
                onChange={(e) => setFormData({ ...formData, driver_advance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Cargo Weight (Tons)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight_tons}
                onChange={(e) => setFormData({ ...formData, weight_tons: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Trip Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Proof of Delivery (POD) Image URL</label>
              <input
                type="text"
                placeholder="https://... (Supabase Storage file link)"
                value={formData.pod_file_url || ''}
                onChange={(e) => setFormData({ ...formData, pod_file_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
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
              {editingTrip ? "Save Trip Changes" : "Confirm & Create Trip"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Trip Financial P&L & Expense Drawer */}
      <Drawer
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={selectedTrip ? `Trip Financial P&L: ${selectedTrip.trip_number}` : ''}
        width="max-w-2xl"
      >
        {selectedTrip && (() => {
          const pnl = calculateTripPnL(selectedTrip.id);
          const trk = trucks.find(t => t.id === selectedTrip.truck_id);
          const drv = drivers.find(d => d.id === selectedTrip.driver_id);
          const pty = parties.find(p => p.id === selectedTrip.party_id);
          const expenses = tripExpenses.filter(e => e.trip_id === selectedTrip.id);

          return (
            <div className="space-y-6 text-xs">
              {/* Header P&L Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] uppercase block">Freight Revenue</span>
                  <span className="text-base font-bold text-slate-100">₹{pnl.freight.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] uppercase block">Trip Expenses</span>
                  <span className="text-base font-bold text-rose-400">₹{pnl.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] uppercase block">Net Trip Profit</span>
                  <span className="text-base font-bold text-emerald-400">₹{pnl.netProfit.toLocaleString()} ({pnl.marginPercent}%)</span>
                </div>
              </div>

              {/* Trip Information Card */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Route & LR</span>
                  <span className="font-bold text-slate-100">{selectedTrip.source_city} → {selectedTrip.destination_city} (LR #{selectedTrip.lr_number})</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Truck & Driver</span>
                  <span className="font-semibold text-sky-400">{trk?.registration_number} • {drv?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Party</span>
                  <span className="font-semibold text-slate-200">{pty?.name}</span>
                </div>
              </div>

              {/* POD View Section */}
              {selectedTrip.pod_file_url && (
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-2">Proof of Delivery (POD) File</span>
                  <img src={selectedTrip.pod_file_url} alt="POD Document" className="w-full max-h-48 object-cover rounded-lg border border-slate-700" />
                </div>
              )}

              {/* Trip Expenses Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-sky-400" /> Categorized Trip Expenses ({expenses.length})
                  </h4>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                  >
                    + Add Expense
                  </button>
                </div>

                {expenses.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No expenses logged for this trip yet.</p>
                ) : (
                  <div className="space-y-2">
                    {expenses.map(e => (
                      <div key={e.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200 uppercase text-[11px]">{e.category}</span>
                          <p className="text-[11px] text-slate-400">{e.remarks || 'No remarks'} (Paid by: <span className="text-sky-400 capitalize">{e.paid_by}</span>)</p>
                        </div>
                        <span className="text-sm font-bold text-rose-400">₹{Number(e.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Modal to Add Expense to Selected Trip */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Add Expense Entry to Trip"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Expense Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="fuel">Fuel Expense</option>
                <option value="toll">FASTag Toll</option>
                <option value="loading">Loading Labor</option>
                <option value="unloading">Unloading Charges</option>
                <option value="driver_bata">Driver Bata / Daily Allowance</option>
                <option value="fines">RTO / Police Fine</option>
                <option value="parking">Parking Fee</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Amount (₹) *</label>
              <input
                type="number"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Paid By *</label>
              <select
                value={expenseForm.paid_by}
                onChange={(e) => setExpenseForm({ ...expenseForm, paid_by: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="driver">Driver Cash Advance</option>
                <option value="office">Office Bank Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Expense Date</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Remarks / Receipt Notes</label>
            <input
              type="text"
              placeholder="e.g. Fueling at HPCL Satara Plaza"
              value={expenseForm.remarks}
              onChange={(e) => setExpenseForm({ ...expenseForm, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl"
            >
              Save Expense Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
