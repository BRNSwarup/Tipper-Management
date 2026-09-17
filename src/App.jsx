import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { SplashScreen } from './components/common/SplashScreen';

import { Dashboard } from './pages/Dashboard';
import { Trucks } from './pages/Trucks';
import { Drivers } from './pages/Drivers';
import { Parties } from './pages/Parties';
import { Trips } from './pages/Trips';
import { Fuel } from './pages/Fuel';
import { Maintenance } from './pages/Maintenance';
import { Tyres } from './pages/Tyres';
import { DriverLedger } from './pages/DriverLedger';
import { Documents } from './pages/Documents';
import { Invoices } from './pages/Invoices';
import { Payments } from './pages/Payments';
import { Receivables } from './pages/Receivables';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SplashScreen />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trucks" element={<Trucks />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/tyres" element={<Tyres />} />
            <Route path="/ledger" element={<DriverLedger />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
