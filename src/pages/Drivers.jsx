import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/Badge';
import { Modal, Drawer } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShieldAlert,
  BookOpen,
  Route,
  CheckCircle,
  Truck
} from 'lucide-react';

export const Drivers = () => {
  const { drivers, trucks, trips, driverLedger, addDriver, updateDriver, deleteDriver, calculateDriverBalance } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licence_number: '',
    licence_expiry_date: '',
    address: '',
    joining_date: new Date().toISOString().split('T')[0],
    salary_type: 'per_trip',
    rate: 3500.00,
    assigned_truck_id: '',
    status: 'active'
  });

  const handleOpenForm = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData(driver);
    } else {
      setEditingDriver(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        licence_number: '',
        licence_expiry_date: '',
        address: '',
        joining_date: new Date().toISOString().split('T')[0],
        salary_type: 'per_trip',
        rate: 3500.00,
        assigned_truck_id: '',
        status: 'active'
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, formData);
    } else {
      addDriver(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this driver profile?")) {
      deleteDriver(id);
    }
  };

  const getDaysUntilExpiry = (expiryDateStr) => {
    if (!expiryDateStr) return 999;
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.phone.includes(search) ||
                          d.licence_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportData = filteredDrivers.map(d => ({
    Name: d.name,
    Phone: d.phone,
    Email: d.email,
    LicenceNo: d.licence_number,
    LicenceExpiry: d.licence_expiry_date,
    SalaryType: d.salary_type,
    Rate: d.rate,
    Status: d.status,
    JoiningDate: d.joining_date
  }));

  return (
    <DashboardLayout title="Driver Profiles & Compliance">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Driver Name, Phone, Licence..."
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
            <option value="">All Driver Statuses</option>
            <option value="active">Active / Available</option>
            <option value="on_trip">On Trip</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="drivers_fleet_list.csv" />
          {canManageOps && (
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* Drivers List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map(driver => {
          const daysLeft = getDaysUntilExpiry(driver.licence_expiry_date);
          const balance = calculateDriverBalance(driver.id);
          const assignedTruck = trucks.find(t => t.id === driver.assigned_truck_id);

          return (
            <div key={driver.id} className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-100 tracking-tight">{driver.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{driver.phone}</p>
                  </div>
                  <StatusBadge type="driver" value={driver.status} />
                </div>

                {/* Licence Expiry Warning Badge */}
                <div className="my-3">
                  {daysLeft <= 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 badge-glow-rose">
                      <ShieldAlert className="w-3 h-3" /> LICENCE EXPIRED ({driver.licence_expiry_date})
                    </span>
                  ) : daysLeft <= 30 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 badge-glow-amber">
                      <AlertTriangle className="w-3 h-3" /> LICENCE EXPIRES IN {daysLeft} DAYS
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      DL: <strong className="text-slate-200">{driver.licence_number}</strong> (Exp: {driver.licence_expiry_date})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Assigned Truck</span>
                    <span className="font-semibold text-sky-400">{assignedTruck?.registration_number || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Ledger Balance</span>
                    <span className={`font-semibold ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {balance > 0 ? `Advance ₹${balance.toLocaleString()}` : `Settled / ₹0`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2 text-xs">
                <button
                  onClick={() => setSelectedDriver(driver)}
                  className="text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Profile Drawer
                </button>

                {canManageOps && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(driver)}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDriver ? "Edit Driver Information" : "Add New Fleet Driver"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Licence Number *</label>
              <input
                type="text"
                required
                placeholder="MH-12201900112"
                value={formData.licence_number}
                onChange={(e) => setFormData({ ...formData, licence_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Licence Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.licence_expiry_date}
                onChange={(e) => setFormData({ ...formData, licence_expiry_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Salary Type</label>
              <select
                value={formData.salary_type}
                onChange={(e) => setFormData({ ...formData, salary_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="monthly">Monthly Fixed</option>
                <option value="per_trip">Per Trip Rate</option>
                <option value="per_km">Per Km Rate</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Rate (₹)</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assigned Truck</label>
              <select
                value={formData.assigned_truck_id || ''}
                onChange={(e) => setFormData({ ...formData, assigned_truck_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {trucks.map(t => (
                  <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
                ))}
              </select>
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
              {editingDriver ? "Save Driver" : "Add Driver"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Driver Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title={selectedDriver ? `Driver Profile: ${selectedDriver.name}` : ''}
      >
        {selectedDriver && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[10px]">PHONE & EMAIL</span>
                <p className="font-bold text-slate-100">{selectedDriver.phone}</p>
                <p className="text-slate-400">{selectedDriver.email || 'No email registered'}</p>
              </div>
              <StatusBadge type="driver" value={selectedDriver.status} />
            </div>

            <div className="space-y-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Licence Number</span>
                <span className="font-mono font-bold text-slate-200">{selectedDriver.licence_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Licence Expiry</span>
                <span className="font-semibold text-amber-400">{selectedDriver.licence_expiry_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Salary Model</span>
                <span className="font-semibold text-slate-200 uppercase">{selectedDriver.salary_type} (₹{selectedDriver.rate})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Joining Date</span>
                <span className="text-slate-300">{selectedDriver.joining_date}</span>
              </div>
            </div>

            {/* Trip History Tab for this Driver */}
            <div>
              <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Route className="w-4 h-4 text-sky-400" /> Driver Trip History
              </h4>
              {trips.filter(t => t.driver_id === selectedDriver.id).length === 0 ? (
                <p className="text-slate-500 py-2">No trips recorded for this driver.</p>
              ) : (
                <div className="space-y-2">
                  {trips.filter(t => t.driver_id === selectedDriver.id).map(tr => (
                    <div key={tr.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-200 block">{tr.trip_number} ({tr.source_city} → {tr.destination_city})</span>
                        <span className="text-[10px] text-slate-500">LR #{tr.lr_number} • Start: {tr.start_date}</span>
                      </div>
                      <StatusBadge type="trip" value={tr.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </DashboardLayout>
  );
};
