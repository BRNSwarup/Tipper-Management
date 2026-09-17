import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  DollarSign,
  Truck,
  CheckCircle
} from 'lucide-react';

export const Maintenance = () => {
  const { maintenance, trucks, addMaintenance, updateTruck } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    truck_id: '',
    service_date: new Date().toISOString().split('T')[0],
    odometer: 112000,
    maintenance_type: 'scheduled',
    workshop_name: 'Tata Authorized Service Station',
    description: 'Engine oil flush & brake pad overhaul',
    labour_cost: 3500.00,
    parts_cost: 12500.00,
    downtime_days: 1
  });

  const handleOpenForm = () => {
    const defaultTruck = trucks[0]?.id || '';
    const defaultOdo = trucks[0]?.current_odometer || 100000;
    setFormData({
      truck_id: defaultTruck,
      service_date: new Date().toISOString().split('T')[0],
      odometer: defaultOdo,
      maintenance_type: 'scheduled',
      workshop_name: 'Tata Authorized Service Station',
      description: 'Routine scheduled maintenance & filter replacements',
      labour_cost: 3500.00,
      parts_cost: 12500.00,
      downtime_days: 1
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const labour = parseFloat(formData.labour_cost) || 0;
    const parts = parseFloat(formData.parts_cost) || 0;
    const total_cost = labour + parts;

    addMaintenance({
      ...formData,
      total_cost
    });

    // Update truck status to maintenance if breakdown
    if (formData.maintenance_type === 'breakdown') {
      updateTruck(formData.truck_id, { status: 'maintenance' });
    }

    setIsFormOpen(false);
  };

  const filteredMaintenance = maintenance.filter(m => {
    const trk = trucks.find(t => t.id === m.truck_id);
    const regNo = trk?.registration_number || '';
    const matchesSearch = regNo.toLowerCase().includes(search.toLowerCase()) ||
                          m.workshop_name.toLowerCase().includes(search.toLowerCase()) ||
                          m.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || m.maintenance_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportData = filteredMaintenance.map(m => {
    const trk = trucks.find(t => t.id === m.truck_id);
    return {
      Date: m.service_date,
      TruckReg: trk?.registration_number || '',
      Type: m.maintenance_type,
      Workshop: m.workshop_name,
      Description: m.description,
      LabourCost: m.labour_cost,
      PartsCost: m.parts_cost,
      TotalCost: m.total_cost,
      DowntimeDays: m.downtime_days
    };
  });

  const totalCost = maintenance.reduce((sum, m) => sum + Number(m.total_cost || 0), 0);
  const totalDowntime = maintenance.reduce((sum, m) => sum + Number(m.downtime_days || 0), 0);

  return (
    <DashboardLayout title="Maintenance & Workshop Control">
      {/* Maintenance Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Maintenance Spend</span>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">₹{totalCost.toLocaleString()}</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Fleet Downtime Lost</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{totalDowntime} Days</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Services Logged</span>
            <h3 className="text-2xl font-bold text-sky-400 mt-1">{maintenance.length} Records</h3>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reg No, Workshop, Repair Task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Service Types</option>
            <option value="scheduled">Scheduled Maintenance</option>
            <option value="breakdown">Breakdown Repair</option>
            <option value="tyre_service">Tyre Alignment / Service</option>
            <option value="accident">Accident Repair</option>
            <option value="general">General Inspection</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="maintenance_records.csv" />
          {canManageOps && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance</span>
            </button>
          )}
        </div>
      </div>

      {/* Maintenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaintenance.map(m => {
          const trk = trucks.find(t => t.id === m.truck_id);
          return (
            <div key={m.id} className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{m.workshop_name}</h3>
                    <p className="text-xs text-sky-400 font-semibold">{trk?.registration_number || 'Truck'} ({m.service_date})</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    m.maintenance_type === 'breakdown' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    {m.maintenance_type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  {m.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Labour Cost</span>
                  <span className="font-semibold text-slate-200">₹{Number(m.labour_cost || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Parts Cost</span>
                  <span className="font-semibold text-slate-200">₹{Number(m.parts_cost || 0).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Service Bill</span>
                  <span className="font-bold text-rose-400 text-sm">₹{Number(m.total_cost).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Maintenance Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Log Truck Maintenance Record"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Truck *</label>
              <select
                required
                value={formData.truck_id}
                onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {trucks.map(t => (
                  <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Service Date *</label>
              <input
                type="date"
                required
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Maintenance Type</label>
              <select
                value={formData.maintenance_type}
                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="scheduled">Scheduled Service</option>
                <option value="breakdown">Breakdown Repair</option>
                <option value="tyre_service">Tyre Service</option>
                <option value="accident">Accident Repair</option>
                <option value="general">General Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Odometer (km)</label>
              <input
                type="number"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Downtime (Days)</label>
              <input
                type="number"
                value={formData.downtime_days}
                onChange={(e) => setFormData({ ...formData, downtime_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Workshop Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Authorized Tata Motors Workshop"
              value={formData.workshop_name}
              onChange={(e) => setFormData({ ...formData, workshop_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Service Description / Repairs Done</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Labour Charges (₹)</label>
              <input
                type="number"
                value={formData.labour_cost}
                onChange={(e) => setFormData({ ...formData, labour_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Parts / Materials Cost (₹)</label>
              <input
                type="number"
                value={formData.parts_cost}
                onChange={(e) => setFormData({ ...formData, parts_cost: parseFloat(e.target.value) || 0 })}
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
              Save Maintenance Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
