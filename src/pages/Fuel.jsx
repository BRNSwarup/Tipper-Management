import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Fuel as FuelIcon,
  Plus,
  Search,
  Gauge,
  DollarSign,
  Truck,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export const Fuel = () => {
  const { fuelEntries, trucks, trips, addFuelEntry, updateTruck } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [truckFilter, setTruckFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    truck_id: '',
    trip_id: '',
    date: new Date().toISOString().split('T')[0],
    odometer: 142000,
    litres: 300,
    rate_per_litre: 94.50,
    fuel_pump: 'HPCL Auto Plaza',
    payment_mode: 'fuel_card',
    is_tank_full: true
  });

  const handleOpenForm = () => {
    const defaultTruck = trucks[0]?.id || '';
    const defaultOdo = trucks[0]?.current_odometer || 100000;
    setFormData({
      truck_id: defaultTruck,
      trip_id: '',
      date: new Date().toISOString().split('T')[0],
      odometer: defaultOdo + 350,
      litres: 300,
      rate_per_litre: 94.50,
      fuel_pump: 'HPCL Highway Station',
      payment_mode: 'fuel_card',
      is_tank_full: true
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const litres = parseFloat(formData.litres) || 1;
    const rate = parseFloat(formData.rate_per_litre) || 1;
    const total_amount = litres * rate;
    const odo = parseFloat(formData.odometer) || 0;

    // Find previous odometer for this truck to compute Km/L mileage
    const prevFuelEntries = fuelEntries
      .filter(f => f.truck_id === formData.truck_id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let mileage_kmpl = 3.2; // default average
    if (prevFuelEntries.length > 0 && odo > prevFuelEntries[0].odometer) {
      const dist = odo - prevFuelEntries[0].odometer;
      mileage_kmpl = Math.round((dist / litres) * 100) / 100;
    }

    addFuelEntry({
      ...formData,
      total_amount,
      mileage_kmpl
    });

    // Update truck odometer if higher
    const targetTruck = trucks.find(t => t.id === formData.truck_id);
    if (targetTruck && odo > targetTruck.current_odometer) {
      updateTruck(targetTruck.id, { current_odometer: odo });
    }

    setIsFormOpen(false);
  };

  const filteredFuel = fuelEntries.filter(f => {
    const trk = trucks.find(t => t.id === f.truck_id);
    const regNo = trk?.registration_number || '';
    const matchesSearch = regNo.toLowerCase().includes(search.toLowerCase()) ||
                          (f.fuel_pump && f.fuel_pump.toLowerCase().includes(search.toLowerCase()));
    const matchesTruck = !truckFilter || f.truck_id === truckFilter;
    return matchesSearch && matchesTruck;
  });

  const exportData = filteredFuel.map(f => {
    const trk = trucks.find(t => t.id === f.truck_id);
    return {
      Date: f.date,
      TruckReg: trk?.registration_number || '',
      Odometer: f.odometer,
      Litres: f.litres,
      RatePerLitre: f.rate_per_litre,
      TotalAmount: f.total_amount,
      MileageKmpl: f.mileage_kmpl,
      FuelPump: f.fuel_pump,
      PaymentMode: f.payment_mode
    };
  });

  // Calculate Fleet Averages
  const totalLitres = fuelEntries.reduce((sum, f) => sum + Number(f.litres || 0), 0);
  const totalFuelCost = fuelEntries.reduce((sum, f) => sum + Number(f.total_amount || 0), 0);
  const avgMileage = (fuelEntries.reduce((sum, f) => sum + Number(f.mileage_kmpl || 0), 0) / (fuelEntries.length || 1)).toFixed(2);

  return (
    <DashboardLayout title="Fuel Management & Mileage Control">
      {/* Fuel Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Fuel Consumed</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalLitres.toLocaleString()} Litres</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FuelIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Fuel Expenditure</span>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">₹{totalFuelCost.toLocaleString()}</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Average Fleet Mileage</span>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{avgMileage} Km/L</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gauge className="w-5 h-5" />
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
              placeholder="Search Reg No, Fuel Pump..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

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
          <ExportButton data={exportData} filename="fuel_entries_log.csv" />
          {canManageOps && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Fuel Fill</span>
            </button>
          )}
        </div>
      </div>

      {/* Fuel Entries Table */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-3 px-3">Date & Truck</th>
              <th className="py-3 px-3">Odometer</th>
              <th className="py-3 px-3">Litres & Rate</th>
              <th className="py-3 px-3">Total Amount</th>
              <th className="py-3 px-3">Mileage Efficiency</th>
              <th className="py-3 px-3">Fuel Station & Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFuel.map(f => {
              const trk = trucks.find(t => t.id === f.truck_id);
              return (
                <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-100 block">{f.date}</span>
                    <span className="text-[11px] text-sky-400 font-semibold">{trk?.registration_number || 'N/A'}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-200">
                    {Number(f.odometer).toLocaleString()} km
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-200 block">{f.litres} Litres</span>
                    <span className="text-[10px] text-slate-400">₹{f.rate_per_litre} / Litre</span>
                  </td>

                  <td className="py-3 px-3 font-bold text-rose-400">
                    ₹{Number(f.total_amount).toLocaleString()}
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {f.mileage_kmpl} Km/L
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-200 block">{f.fuel_pump || 'Highway Pump'}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{f.payment_mode}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Log Fuel Filling Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Log Fuel Filling Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Select Fleet Truck *</label>
              <select
                required
                value={formData.truck_id}
                onChange={(e) => {
                  const trkId = e.target.value;
                  const trk = trucks.find(t => t.id === trkId);
                  setFormData({
                    ...formData,
                    truck_id: trkId,
                    odometer: trk ? trk.current_odometer + 400 : formData.odometer
                  });
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {trucks.map(t => (
                  <option key={t.id} value={t.id}>{t.registration_number} ({t.make_model})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Filling Date *</label>
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
              <label className="block text-slate-400 mb-1 font-medium">Odometer Reading (km) *</label>
              <input
                type="number"
                required
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Litres Filled *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.litres}
                onChange={(e) => setFormData({ ...formData, litres: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Rate / Litre (₹) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.rate_per_litre}
                onChange={(e) => setFormData({ ...formData, rate_per_litre: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Fuel Station / Vendor Name</label>
              <input
                type="text"
                placeholder="e.g. BPCL Auto Fuel Plaza"
                value={formData.fuel_pump}
                onChange={(e) => setFormData({ ...formData, fuel_pump: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payment Mode</label>
              <select
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="fuel_card">Fuel Card</option>
                <option value="upi">UPI / Online</option>
                <option value="card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="credit">Vendor Credit Account</option>
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
              Save Fuel Record
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
