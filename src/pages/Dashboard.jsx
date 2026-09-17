import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Truck,
  Users,
  Route,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Fuel,
  Wrench,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const {
    trucks,
    drivers,
    trips,
    documents,
    invoices,
    calculateTripPnL,
    calculateAgingReceivables,
    getExpiringDocuments
  } = useData();

  // 1. Truck Counts
  const totalTrucks = trucks.length;
  const activeTrucks = trucks.filter(t => t.status === 'on_trip').length;
  const availableTrucks = trucks.filter(t => t.status === 'available').length;
  const maintenanceTrucks = trucks.filter(t => t.status === 'maintenance').length;

  // 2. Driver & Trip Counts
  const activeTrips = trips.filter(t => t.status === 'running').length;
  const completedTrips = trips.filter(t => ['delivered', 'billed', 'closed'].includes(t.status)).length;

  // 3. Financial Metrics
  let totalRevenue = 0;
  let totalExpenses = 0;

  trips.forEach(trip => {
    const pnl = calculateTripPnL(trip.id);
    totalRevenue += pnl.freight;
    totalExpenses += pnl.totalExpenses;
  });

  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Aging receivables
  const aging = calculateAgingReceivables();
  const outstandingReceivables = aging.totalOutstanding;

  // Expiring documents (<30 days)
  const expiringDocs = getExpiringDocuments(30);

  // Recharts Data Prep
  const monthlyData = [
    { month: 'May', Income: 420000, Expenses: 310000, Profit: 110000 },
    { month: 'Jun', Income: 580000, Expenses: 410000, Profit: 170000 },
    { month: 'Jul', Income: 640000, Expenses: 460000, Profit: 180000 },
    { month: 'Aug', Income: 710000, Expenses: 490000, Profit: 220000 },
    { month: 'Sep', Income: totalRevenue, Expenses: totalExpenses, Profit: netProfit }
  ];

  const utilizationPieData = [
    { name: 'On Trip', value: activeTrucks, color: '#2563eb' },
    { name: 'Ready', value: availableTrucks, color: '#16a34a' },
    { name: 'In Repair', value: maintenanceTrucks, color: '#d97706' },
    { name: 'Inactive', value: Math.max(0, totalTrucks - activeTrucks - availableTrucks - maintenanceTrucks), color: '#94a3b8' }
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout title="Dashboard & Quick Overview">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Tippers & Trucks"
          value={totalTrucks}
          subtitle={`${activeTrucks} On Trip • ${availableTrucks} Ready`}
          icon={Truck}
          color="blue"
        />
        <StatCard
          title="Trips Running Now"
          value={activeTrips}
          subtitle={`${completedTrips} Trips Delivered`}
          icon={Route}
          color="emerald"
        />
        <StatCard
          title="Pending Client Money"
          value={`₹${outstandingReceivables.toLocaleString('en-IN')}`}
          subtitle={`${invoices.filter(i => i.payment_status !== 'paid').length} Pending Invoices`}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Truck Papers Expiring"
          value={expiringDocs.length}
          subtitle="Renewal due <30 days"
          icon={AlertTriangle}
          color={expiringDocs.length > 0 ? "rose" : "blue"}
        />
      </div>

      {/* Financial Overview Stat Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase block">Total Freight Income (₹)</span>
            <h4 className="text-xl font-black text-slate-950">₹{totalRevenue.toLocaleString('en-IN')}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase block">Total Expenses (Diesel, Toll, Etc)</span>
            <h4 className="text-xl font-black text-slate-950">₹{totalExpenses.toLocaleString('en-IN')}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase block">Net Profit Earned ({netMargin}%)</span>
            <h4 className="text-xl font-black text-emerald-600">₹{netProfit.toLocaleString('en-IN')}</h4>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-950">Income vs Expenses</h3>
              <p className="text-[11px] text-slate-500">Monthly profit & loss chart</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#09090b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
                <Bar dataKey="Income" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Profit" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization Pie Chart */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-950">Truck Status Today</h3>
            <p className="text-[11px] text-slate-500">Trucks on trip, ready, or repair</p>
          </div>
          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationPieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {utilizationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {utilizationPieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Running Trips */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-600" />
              Active Trips On Road ({activeTrips})
            </h3>
            <Link to="/trips" className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {trips.filter(t => t.status === 'running').slice(0, 3).map(trip => (
              <div key={trip.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">{trip.trip_number}</span>
                    <StatusBadge type="trip" value={trip.status} />
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {trip.source_city} → {trip.destination_city}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block">₹{Number(trip.freight_amount).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">LR #{trip.lr_number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Document Alerts */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Truck & Driver Papers Expiring ({expiringDocs.length})
            </h3>
            <Link to="/documents" className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1">
              Open Papers Vault <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {expiringDocs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <CheckCircle className="w-7 h-7 text-emerald-600 mx-auto mb-1 opacity-80" />
              All truck & driver papers are up to date!
            </div>
          ) : (
            <div className="space-y-2">
              {expiringDocs.slice(0, 3).map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{doc.document_type.toUpperCase()} #{doc.document_number}</span>
                    <span className="text-[11px] text-slate-500">{doc.entity_type === 'truck' ? 'Tipper Paper' : 'Driver Paper'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      doc.daysLeft <= 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.daysLeft <= 0 ? 'EXPIRED' : `${doc.daysLeft} Days Remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
