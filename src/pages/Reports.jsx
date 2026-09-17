import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import {
  BarChart3,
  TrendingUp,
  Truck,
  Users,
  Building2,
  Fuel,
  Wrench,
  DollarSign,
  Download
} from 'lucide-react';

export const Reports = () => {
  const {
    trucks,
    drivers,
    parties,
    trips,
    fuelEntries,
    maintenance,
    calculateTripPnL,
    calculateDriverBalance
  } = useData();

  const [activeReportTab, setActiveReportTab] = useState('truck_profit');

  // 1. Truck Profitability Data
  const truckProfitData = trucks.map(trk => {
    const trkTrips = trips.filter(t => t.truck_id === trk.id);
    let rev = 0;
    let exp = 0;
    trkTrips.forEach(t => {
      const pnl = calculateTripPnL(t.id);
      rev += pnl.freight;
      exp += pnl.totalExpenses;
    });
    const profit = rev - exp;
    return {
      Registration: trk.registration_number,
      Model: trk.make_model,
      TripsCount: trkTrips.length,
      TotalRevenue: rev,
      TotalExpenses: exp,
      NetProfit: profit,
      MarginPercent: rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0
    };
  });

  // 2. Driver Performance Data
  const driverPerfData = drivers.map(drv => {
    const drvTrips = trips.filter(t => t.driver_id === drv.id);
    const balance = calculateDriverBalance(drv.id);
    return {
      DriverName: drv.name,
      Phone: drv.phone,
      TripsCompleted: drvTrips.length,
      SalaryType: drv.salary_type,
      Rate: drv.rate,
      LedgerBalance: balance
    };
  });

  // 3. Fuel & Mileage Efficiency Data
  const fuelReportData = trucks.map(trk => {
    const fEntries = fuelEntries.filter(f => f.truck_id === trk.id);
    const totalL = fEntries.reduce((s, f) => s + Number(f.litres || 0), 0);
    const totalCost = fEntries.reduce((s, f) => s + Number(f.total_amount || 0), 0);
    const avgKmpl = (fEntries.reduce((s, f) => s + Number(f.mileage_kmpl || 0), 0) / (fEntries.length || 1)).toFixed(2);
    return {
      TruckReg: trk.registration_number,
      LitresFilled: totalL,
      FuelCost: totalCost,
      AverageMileageKmPL: avgKmpl,
      EntriesCount: fEntries.length
    };
  });

  // 4. Party-wise Profitability
  const partyProfitData = parties.map(pty => {
    const ptyTrips = trips.filter(t => t.party_id === pty.id);
    let rev = 0;
    let exp = 0;
    ptyTrips.forEach(t => {
      const pnl = calculateTripPnL(t.id);
      rev += pnl.freight;
      exp += pnl.totalExpenses;
    });
    const profit = rev - exp;
    return {
      PartyName: pty.name,
      PartyType: pty.party_type,
      TripsCount: ptyTrips.length,
      TotalRevenue: rev,
      TotalExpenses: exp,
      NetProfit: profit
    };
  });

  const reportTabs = [
    { id: 'truck_profit', label: 'Truck Profitability', icon: Truck },
    { id: 'driver_perf', label: 'Driver Performance', icon: Users },
    { id: 'fuel_eff', label: 'Fuel & Mileage', icon: Fuel },
    { id: 'party_profit', label: 'Party-wise Profitability', icon: Building2 }
  ];

  return (
    <DashboardLayout title="Comprehensive Fleet Reports & Analytics Center">
      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeReportTab === tab.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Truck Profitability */}
      {activeReportTab === 'truck_profit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm">Truck Fleet Profitability Breakdown</h3>
            <ExportButton data={truckProfitData} filename="truck_profitability_report.csv" />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Truck Registration</th>
                  <th className="py-3 px-3">Model</th>
                  <th className="py-3 px-3">Total Trips</th>
                  <th className="py-3 px-3">Freight Revenue</th>
                  <th className="py-3 px-3">Expenses</th>
                  <th className="py-3 px-3">Net Profit</th>
                  <th className="py-3 px-3">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {truckProfitData.map(row => (
                  <tr key={row.Registration} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-sky-400">{row.Registration}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{row.Model}</td>
                    <td className="py-3 px-3">{row.TripsCount} Trips</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">₹{row.TotalRevenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-semibold text-rose-400">₹{row.TotalExpenses.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-black text-emerald-400">₹{row.NetProfit.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-sky-300">{row.MarginPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Driver Performance */}
      {activeReportTab === 'driver_perf' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm">Driver Performance & Ledger Summary</h3>
            <ExportButton data={driverPerfData} filename="driver_performance_report.csv" />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Driver Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Completed Trips</th>
                  <th className="py-3 px-3">Salary Model</th>
                  <th className="py-3 px-3">Running Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {driverPerfData.map(row => (
                  <tr key={row.DriverName} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-100">{row.DriverName}</td>
                    <td className="py-3 px-3 text-slate-400">{row.Phone}</td>
                    <td className="py-3 px-3 font-semibold text-sky-400">{row.TripsCompleted} Trips</td>
                    <td className="py-3 px-3 uppercase text-slate-300">{row.SalaryType} (₹{row.Rate})</td>
                    <td className={`py-3 px-3 font-bold ${row.LedgerBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ₹{Math.abs(row.LedgerBalance).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Fuel & Mileage */}
      {activeReportTab === 'fuel_eff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm">Truck Fuel & Mileage Efficiency Report</h3>
            <ExportButton data={fuelReportData} filename="fuel_mileage_report.csv" />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Truck Registration</th>
                  <th className="py-3 px-3">Litres Filled</th>
                  <th className="py-3 px-3">Total Fuel Cost</th>
                  <th className="py-3 px-3">Average Mileage (Km/L)</th>
                  <th className="py-3 px-3">Filling Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fuelReportData.map(row => (
                  <tr key={row.TruckReg} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-sky-400">{row.TruckReg}</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">{row.LitresFilled} L</td>
                    <td className="py-3 px-3 font-bold text-rose-400">₹{row.FuelCost.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{row.AverageMileageKmPL} Km/L</td>
                    <td className="py-3 px-3 text-slate-400">{row.EntriesCount} Fills</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Party-wise Profitability */}
      {activeReportTab === 'party_profit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm">Party / Client Account Profitability</h3>
            <ExportButton data={partyProfitData} filename="party_profitability_report.csv" />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Trips Handled</th>
                  <th className="py-3 px-3">Revenue</th>
                  <th className="py-3 px-3">Direct Expenses</th>
                  <th className="py-3 px-3">Net Client Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {partyProfitData.map(row => (
                  <tr key={row.PartyName} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-100">{row.PartyName}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-sky-400">{row.PartyType}</td>
                    <td className="py-3 px-3">{row.TripsCount} Trips</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">₹{row.TotalRevenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-semibold text-rose-400">₹{row.TotalExpenses.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-black text-emerald-400">₹{row.NetProfit.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
