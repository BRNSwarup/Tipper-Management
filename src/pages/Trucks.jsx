import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/Badge';
import { Modal, Drawer } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Fuel,
  Wrench,
  Disc,
  FileText,
  Gauge,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const Trucks = () => {
  const { trucks, addTruck, updateTruck, deleteTruck, fuelEntries, maintenance, tyres, documents } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null); // for detail drawer
  const [activeDrawerTab, setActiveDrawerTab] = useState('info');

  const [formData, setFormData] = useState({
    registration_number: '',
    chassis_number: '',
    engine_number: '',
    make_model: '',
    truck_type: 'container',
    capacity_tons: 18.00,
    axles: 3,
    ownership_type: 'owned',
    purchase_date: new Date().toISOString().split('T')[0],
    current_odometer: 100000,
    status: 'available'
  });

  const handleOpenForm = (truck = null) => {
    if (truck) {
      setEditingTruck(truck);
      setFormData(truck);
    } else {
      setEditingTruck(null);
      setFormData({
        registration_number: '',
        chassis_number: '',
        engine_number: '',
        make_model: '',
        truck_type: 'container',
        capacity_tons: 18.00,
        axles: 3,
        ownership_type: 'owned',
        purchase_date: new Date().toISOString().split('T')[0],
        current_odometer: 100000,
        status: 'available'
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTruck) {
      updateTruck(editingTruck.id, formData);
    } else {
      addTruck(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this truck from the active fleet?")) {
      deleteTruck(id);
    }
  };

  // Filtering
  const filteredTrucks = trucks.filter(t => {
    const matchesSearch = t.registration_number.toLowerCase().includes(search.toLowerCase()) ||
                          t.make_model.toLowerCase().includes(search.toLowerCase()) ||
                          (t.chassis_number && t.chassis_number.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesType = !typeFilter || t.truck_type === typeFilter;
    const matchesOwnership = !ownershipFilter || t.ownership_type === ownershipFilter;
    return matchesSearch && matchesStatus && matchesType && matchesOwnership;
  });

  // Export dataset
  const exportData = filteredTrucks.map(t => ({
    Registration: t.registration_number,
    MakeModel: t.make_model,
    Type: t.truck_type,
    CapacityTons: t.capacity_tons,
    Axles: t.axles,
    Ownership: t.ownership_type,
    OdometerKm: t.current_odometer,
    Status: t.status,
    ChassisNo: t.chassis_number,
    EngineNo: t.engine_number
  }));

  return (
    <DashboardLayout title="Truck Management & Fleet Assets">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reg No, Model, Chassis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="open">Open Body</option>
            <option value="container">Container</option>
            <option value="tipper">Tipper</option>
            <option value="trailer">Trailer</option>
            <option value="tanker">Tanker</option>
            <option value="flatbed">Flatbed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="trucks_fleet_list.csv" />
          {canManageOps && (
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Truck</span>
            </button>
          )}
        </div>
      </div>

      {/* Trucks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrucks.map(truck => (
          <div key={truck.id} className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-100 tracking-tight">{truck.registration_number}</h3>
                  <p className="text-xs text-slate-400 font-medium">{truck.make_model}</p>
                </div>
                <StatusBadge type="truck" value={truck.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Type & Capacity</span>
                  <span className="font-semibold text-slate-200 capitalize">{truck.truck_type} ({truck.capacity_tons}T)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Current Odometer</span>
                  <span className="font-semibold text-sky-400">{Number(truck.current_odometer).toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Ownership</span>
                  <span className="font-semibold text-slate-300 capitalize">{truck.ownership_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Axles</span>
                  <span className="font-semibold text-slate-300">{truck.axles} Axles</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2 text-xs">
              <button
                onClick={() => { setSelectedTruck(truck); setActiveDrawerTab('info'); }}
                className="text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Details Drawer
              </button>

              {canManageOps && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenForm(truck)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Edit Truck"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(truck.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Delete Truck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Truck Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTruck ? "Edit Fleet Truck" : "Register New Fleet Truck"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Registration Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-12-PQ-4821"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Make & Model *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tata Prima 3530.K"
                value={formData.make_model}
                onChange={(e) => setFormData({ ...formData, make_model: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Truck Type</label>
              <select
                value={formData.truck_type}
                onChange={(e) => setFormData({ ...formData, truck_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="open">Open Body</option>
                <option value="container">Container</option>
                <option value="tipper">Tipper</option>
                <option value="trailer">Trailer</option>
                <option value="tanker">Tanker</option>
                <option value="flatbed">Flatbed</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Capacity (Tons)</label>
              <input
                type="number"
                step="0.1"
                value={formData.capacity_tons}
                onChange={(e) => setFormData({ ...formData, capacity_tons: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Axles Count</label>
              <input
                type="number"
                value={formData.axles}
                onChange={(e) => setFormData({ ...formData, axles: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Chassis Number</label>
              <input
                type="text"
                value={formData.chassis_number}
                onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Engine Number</label>
              <input
                type="text"
                value={formData.engine_number}
                onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Ownership Type</label>
              <select
                value={formData.ownership_type}
                onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="owned">Company Owned</option>
                <option value="attached">Attached / Leased</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Current Odometer (km)</label>
              <input
                type="number"
                value={formData.current_odometer}
                onChange={(e) => setFormData({ ...formData, current_odometer: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl"
            >
              {editingTruck ? "Save Changes" : "Register Truck"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Truck Details Drawer */}
      <Drawer
        isOpen={Boolean(selectedTruck)}
        onClose={() => setSelectedTruck(null)}
        title={selectedTruck ? `Truck Assets: ${selectedTruck.registration_number}` : ''}
      >
        {selectedTruck && (
          <div className="space-y-6 text-xs">
            {/* Drawer Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveDrawerTab('info')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${activeDrawerTab === 'info' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
              >
                Vehicle Spec
              </button>
              <button
                onClick={() => setActiveDrawerTab('fuel')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${activeDrawerTab === 'fuel' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
              >
                Fuel History
              </button>
              <button
                onClick={() => setActiveDrawerTab('maintenance')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${activeDrawerTab === 'maintenance' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
              >
                Maintenance
              </button>
              <button
                onClick={() => setActiveDrawerTab('tyres')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${activeDrawerTab === 'tyres' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
              >
                Tyres
              </button>
            </div>

            {/* Tab: Info */}
            {activeDrawerTab === 'info' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT STATUS</span>
                    <StatusBadge type="truck" value={selectedTruck.status} />
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">ODOMETER</span>
                    <span className="text-lg font-bold text-sky-400">{Number(selectedTruck.current_odometer).toLocaleString()} km</span>
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Make & Model</span>
                    <span className="font-semibold text-slate-200">{selectedTruck.make_model}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Chassis Number</span>
                    <span className="font-mono text-slate-300">{selectedTruck.chassis_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Engine Number</span>
                    <span className="font-mono text-slate-300">{selectedTruck.engine_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Capacity / Axles</span>
                    <span className="font-semibold text-slate-200">{selectedTruck.capacity_tons} Tons ({selectedTruck.axles} Axles)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Ownership</span>
                    <span className="font-semibold text-slate-200 capitalize">{selectedTruck.ownership_type}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Purchase Date</span>
                    <span className="text-slate-300">{selectedTruck.purchase_date || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Fuel */}
            {activeDrawerTab === 'fuel' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-amber-400" /> Fuel Entries Log
                </h4>
                {fuelEntries.filter(f => f.truck_id === selectedTruck.id).length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No fuel logs for this truck.</p>
                ) : (
                  fuelEntries.filter(f => f.truck_id === selectedTruck.id).map(f => (
                    <div key={f.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex justify-between">
                      <div>
                        <p className="font-bold text-slate-200">{f.litres} L @ ₹{f.rate_per_litre}/L</p>
                        <p className="text-[11px] text-slate-400">{f.fuel_pump} ({f.date})</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-400">₹{Number(f.total_amount).toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-400 block">{f.mileage_kmpl} Km/L</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Maintenance */}
            {activeDrawerTab === 'maintenance' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" /> Service History
                </h4>
                {maintenance.filter(m => m.truck_id === selectedTruck.id).length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No maintenance logs recorded.</p>
                ) : (
                  maintenance.filter(m => m.truck_id === selectedTruck.id).map(m => (
                    <div key={m.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-200">{m.workshop_name}</span>
                        <span className="text-sm font-bold text-rose-400">₹{Number(m.total_cost).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{m.description}</p>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                        <span>Date: {m.service_date}</span>
                        <span>Downtime: {m.downtime_days} Days</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Tyres */}
            {activeDrawerTab === 'tyres' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-indigo-400" /> Fitted Tyres
                </h4>
                {tyres.filter(t => t.assigned_truck_id === selectedTruck.id).length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No active tyres linked to this truck.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {tyres.filter(t => t.assigned_truck_id === selectedTruck.id).map(t => (
                      <div key={t.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-bold text-[10px] uppercase">{t.position}</span>
                        <p className="font-bold text-slate-200 mt-1">{t.brand}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.serial_number}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </DashboardLayout>
  );
};
