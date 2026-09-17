import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Disc,
  Plus,
  Search,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Tyres = () => {
  const { tyres, tyreEvents, trucks, addTyre, updateTyre, addTyreEvent } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    serial_number: '',
    brand: 'MRF Steel Muscle',
    purchase_date: new Date().toISOString().split('T')[0],
    cost: 26000.00,
    status: 'in_stock',
    assigned_truck_id: '',
    position: 'FL'
  });

  const handleOpenForm = () => {
    setFormData({
      serial_number: `MRF-${Math.floor(10000 + Math.random() * 90000)}-295R22.5`,
      brand: 'MRF Steel Muscle',
      purchase_date: new Date().toISOString().split('T')[0],
      cost: 26000.00,
      status: 'in_stock',
      assigned_truck_id: '',
      position: 'FL'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTyre(formData);
    setIsFormOpen(false);
  };

  const filteredTyres = tyres.filter(t => {
    const matchesSearch = t.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                          t.brand.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTruck = trucks.find(tr => tr.id === selectedTruckId);
  const truckTyres = tyres.filter(t => t.assigned_truck_id === selectedTruckId);

  const getTyreAtPos = (pos) => truckTyres.find(t => t.position === pos);

  const exportData = filteredTyres.map(t => {
    const trk = trucks.find(tr => tr.id === t.assigned_truck_id);
    return {
      SerialNumber: t.serial_number,
      Brand: t.brand,
      PurchaseDate: t.purchase_date,
      Cost: t.cost,
      Status: t.status,
      Position: t.position || '',
      TruckReg: trk?.registration_number || 'In Stock'
    };
  });

  return (
    <DashboardLayout title="Tyre Assets & Visual Axle Layout">
      {/* Top Visual Truck Axle Diagram Inspector */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-400" /> Visual Truck Axle Fitment Layout
            </h3>
            <p className="text-xs text-slate-400">Select a fleet vehicle to inspect wheel positions</p>
          </div>

          <select
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-sky-300 focus:outline-none cursor-pointer"
          >
            {trucks.map(t => (
              <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
            ))}
          </select>
        </div>

        {/* Axle Layout Diagram */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 max-w-xl mx-auto flex flex-col items-center space-y-8">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
            <span>▲ FRONT OF CABIN ({selectedTruck?.registration_number}) ▲</span>
          </div>

          {/* Front Axle (FL / FR) */}
          <div className="w-full flex items-center justify-between px-12">
            {/* Front Left */}
            <div className={`p-3 rounded-xl border text-center transition-all w-28 ${getTyreAtPos('FL') ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="text-[10px] font-bold block">FL (Steer)</span>
              <Disc className="w-6 h-6 mx-auto my-1 animate-spin-slow" />
              <span className="text-[10px] font-semibold truncate block">{getTyreAtPos('FL')?.brand || 'EMPTY'}</span>
            </div>

            <div className="h-1.5 flex-1 bg-slate-800 mx-4 relative flex items-center justify-center">
              <span className="text-[9px] text-slate-500 bg-slate-950 px-2 font-mono">Front Axle</span>
            </div>

            {/* Front Right */}
            <div className={`p-3 rounded-xl border text-center transition-all w-28 ${getTyreAtPos('FR') ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="text-[10px] font-bold block">FR (Steer)</span>
              <Disc className="w-6 h-6 mx-auto my-1 animate-spin-slow" />
              <span className="text-[10px] font-semibold truncate block">{getTyreAtPos('FR')?.brand || 'EMPTY'}</span>
            </div>
          </div>

          {/* Rear Axle 1 (RL1 / RR1) */}
          <div className="w-full flex items-center justify-between px-12">
            {/* Rear Left 1 */}
            <div className={`p-3 rounded-xl border text-center transition-all w-28 ${getTyreAtPos('RL1') ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="text-[10px] font-bold block">RL1 (Drive)</span>
              <Disc className="w-6 h-6 mx-auto my-1" />
              <span className="text-[10px] font-semibold truncate block">{getTyreAtPos('RL1')?.brand || 'EMPTY'}</span>
            </div>

            <div className="h-1.5 flex-1 bg-slate-800 mx-4 relative flex items-center justify-center">
              <span className="text-[9px] text-slate-500 bg-slate-950 px-2 font-mono">Drive Axle 1</span>
            </div>

            {/* Rear Right 1 */}
            <div className={`p-3 rounded-xl border text-center transition-all w-28 ${getTyreAtPos('RR1') ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="text-[10px] font-bold block">RR1 (Drive)</span>
              <Disc className="w-6 h-6 mx-auto my-1" />
              <span className="text-[10px] font-semibold truncate block">{getTyreAtPos('RR1')?.brand || 'EMPTY'}</span>
            </div>
          </div>

          {/* Spare Wheel */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <div className={`p-2.5 px-6 rounded-xl border inline-flex items-center gap-3 ${getTyreAtPos('SPARE') ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <Disc className="w-4 h-4" />
              <span className="text-xs font-bold">SPARE WHEEL: {getTyreAtPos('SPARE')?.serial_number || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action & Master List */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Serial No, Brand..."
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
            <option value="">All Statuses</option>
            <option value="fitted">Fitted to Truck</option>
            <option value="in_stock">In Stock Yard</option>
            <option value="retreaded">Retreaded</option>
            <option value="scrapped">Scrapped</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="tyre_inventory.csv" />
          {canManageOps && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tyre</span>
            </button>
          )}
        </div>
      </div>

      {/* Tyre Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTyres.map(t => {
          const trk = trucks.find(tr => tr.id === t.assigned_truck_id);
          return (
            <div key={t.id} className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">{t.serial_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    t.status === 'fitted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    t.status === 'retreaded' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="font-bold text-slate-100 text-sm mt-2">{t.brand}</p>
                <p className="text-[11px] text-slate-400">Purchased: {t.purchase_date} (₹{Number(t.cost).toLocaleString()})</p>
              </div>

              <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">Assigned: <strong className="text-slate-200">{trk?.registration_number || 'Yard'}</strong></span>
                {t.position && <span className="font-mono text-[10px] font-bold bg-slate-800 text-sky-400 px-2 py-0.5 rounded">{t.position}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tyre Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Register New Tyre Asset"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Brand & Spec *</label>
              <input
                type="text"
                required
                placeholder="e.g. MRF Steel Muscle 295/80 R22.5"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Cost (₹)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="in_stock">In Stock Yard</option>
                <option value="fitted">Fitted to Truck</option>
                <option value="retreaded">Retreaded</option>
                <option value="scrapped">Scrapped</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="FL">Front Left (FL)</option>
                <option value="FR">Front Right (FR)</option>
                <option value="RL1">Rear Left 1 (RL1)</option>
                <option value="RR1">Rear Right 1 (RR1)</option>
                <option value="RL2">Rear Left 2 (RL2)</option>
                <option value="RR2">Rear Right 2 (RR2)</option>
                <option value="SPARE">Spare Wheel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Assign to Truck (Optional)</label>
            <select
              value={formData.assigned_truck_id}
              onChange={(e) => setFormData({ ...formData, assigned_truck_id: e.target.value, status: e.target.value ? 'fitted' : 'in_stock' })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            >
              <option value="">Unassigned (In Stock)</option>
              {trucks.map(t => (
                <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
              ))}
            </select>
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
              Save Tyre Asset
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
