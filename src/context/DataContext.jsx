import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialSeedData } from '../services/seedData';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const local = localStorage.getItem('tms_app_data');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    return initialSeedData;
  });

  const [loading, setLoading] = useState(false);

  // Sync to local storage on change for demo mode
  useEffect(() => {
    localStorage.setItem('tms_app_data', JSON.stringify(data));
  }, [data]);

  // Fetch from Supabase if configured
  const fetchFromSupabase = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [
        { data: trucks },
        { data: drivers },
        { data: parties },
        { data: trips },
        { data: tripExpenses },
        { data: fuelEntries },
        { data: maintenance },
        { data: tyres },
        { data: tyreEvents },
        { data: driverLedger },
        { data: documents },
        { data: invoices },
        { data: invoiceTrips },
        { data: payments }
      ] = await Promise.all([
        supabase.from('trucks').select('*').is('deleted_at', null),
        supabase.from('drivers').select('*').is('deleted_at', null),
        supabase.from('parties').select('*').is('deleted_at', null),
        supabase.from('trips').select('*').is('deleted_at', null),
        supabase.from('trip_expenses').select('*'),
        supabase.from('fuel_entries').select('*'),
        supabase.from('maintenance').select('*'),
        supabase.from('tyres').select('*'),
        supabase.from('tyre_events').select('*'),
        supabase.from('driver_ledger').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('invoice_trips').select('*'),
        supabase.from('payments').select('*')
      ]);

      setData(prev => ({
        ...prev,
        trucks: trucks || prev.trucks,
        drivers: drivers || prev.drivers,
        parties: parties || prev.parties,
        trips: trips || prev.trips,
        tripExpenses: tripExpenses || prev.tripExpenses,
        fuelEntries: fuelEntries || prev.fuelEntries,
        maintenance: maintenance || prev.maintenance,
        tyres: tyres || prev.tyres,
        tyreEvents: tyreEvents || prev.tyreEvents,
        driverLedger: driverLedger || prev.driverLedger,
        documents: documents || prev.documents,
        invoices: invoices || prev.invoices,
        invoiceTrips: invoiceTrips || prev.invoiceTrips,
        payments: payments || prev.payments
      }));
    } catch (err) {
      console.error("Failed to load from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromSupabase();
  }, []);

  // Generic add/update/delete helpers
  const addItem = (key, item, supabaseTable) => {
    const newItem = {
      ...item,
      id: item.id || `${key.substring(0, 3)}-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      [key]: [newItem, ...(prev[key] || [])]
    }));

    if (supabase && supabaseTable) {
      supabase.from(supabaseTable).insert(newItem).then(({ error }) => {
        if (error) console.error(`Supabase insert error on ${supabaseTable}:`, error);
      });
    }

    return newItem;
  };

  const updateItem = (key, id, updates, supabaseTable) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)
    }));

    if (supabase && supabaseTable) {
      supabase.from(supabaseTable).update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error(`Supabase update error on ${supabaseTable}:`, error);
      });
    }
  };

  const deleteItem = (key, id, supabaseTable, softDelete = true) => {
    if (softDelete) {
      updateItem(key, id, { deleted_at: new Date().toISOString() }, supabaseTable);
    } else {
      setData(prev => ({
        ...prev,
        [key]: prev[key].filter(item => item.id !== id)
      }));
      if (supabase && supabaseTable) {
        supabase.from(supabaseTable).delete().eq('id', id).then(({ error }) => {
          if (error) console.error(`Supabase delete error on ${supabaseTable}:`, error);
        });
      }
    }
  };

  const resetToSeedData = () => {
    localStorage.removeItem('tms_app_data');
    setData(initialSeedData);
  };

  // FINANCIAL & OPERATIONAL CALCULATORS
  const calculateTripPnL = (tripId) => {
    const trip = data.trips.find(t => t.id === tripId);
    if (!trip) return { freight: 0, totalExpenses: 0, netProfit: 0, marginPercent: 0, expenseBreakdown: {} };

    const expenses = data.tripExpenses.filter(e => e.trip_id === tripId);
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
      return acc;
    }, {});

    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const freight = Number(trip.freight_amount || 0);
    const netProfit = freight - totalExpenses;
    const marginPercent = freight > 0 ? (netProfit / freight) * 100 : 0;

    return {
      freight,
      totalExpenses,
      netProfit,
      marginPercent: Math.round(marginPercent * 10) / 10,
      categoryTotals,
      expensesCount: expenses.length
    };
  };

  const calculateDriverBalance = (driverId) => {
    const ledger = data.driverLedger.filter(l => l.driver_id === driverId);
    let balance = 0; // Positive means driver holds advance/debited, negative means office owes driver
    ledger.forEach(entry => {
      const amt = Number(entry.amount || 0);
      if (entry.direction === 'debit') balance += amt; // advance paid to driver
      if (entry.direction === 'credit') balance -= amt; // expense claim or bata credited to driver
    });
    return balance;
  };

  const calculateAgingReceivables = () => {
    const now = new Date();
    const result = {
      days0_30: 0,
      days30_60: 0,
      days60_90: 0,
      days90Plus: 0,
      totalOutstanding: 0
    };

    data.invoices.forEach(inv => {
      if (inv.payment_status === 'paid') return;
      const total = Number(inv.total_amount || 0);
      const paid = data.payments
        .filter(p => p.invoice_id === inv.id)
        .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

      const outstanding = Math.max(0, total - paid);
      if (outstanding <= 0) return;

      result.totalOutstanding += outstanding;

      const invDate = new Date(inv.invoice_date || inv.created_at);
      const diffDays = Math.floor((now - invDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) result.days0_30 += outstanding;
      else if (diffDays <= 60) result.days30_60 += outstanding;
      else if (diffDays <= 90) result.days60_90 += outstanding;
      else result.days90Plus += outstanding;
    });

    return result;
  };

  const getExpiringDocuments = (withinDays = 30) => {
    const now = new Date();
    return data.documents.filter(doc => {
      if (!doc.expiry_date) return false;
      const expiry = new Date(doc.expiry_date);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return diffDays <= withinDays;
    }).map(doc => {
      const expiry = new Date(doc.expiry_date);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return { ...doc, daysLeft: diffDays };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const value = {
    trucks: data.trucks.filter(t => !t.deleted_at),
    drivers: data.drivers.filter(d => !d.deleted_at),
    parties: data.parties.filter(p => !p.deleted_at),
    trips: data.trips.filter(tr => !tr.deleted_at),
    tripExpenses: data.tripExpenses,
    fuelEntries: data.fuelEntries,
    maintenance: data.maintenance,
    tyres: data.tyres,
    tyreEvents: data.tyreEvents,
    driverLedger: data.driverLedger,
    documents: data.documents,
    invoices: data.invoices,
    invoiceTrips: data.invoiceTrips,
    payments: data.payments,
    loading,
    
    // CRUD methods
    addTruck: (truck) => addItem('trucks', truck, 'trucks'),
    updateTruck: (id, updates) => updateItem('trucks', id, updates, 'trucks'),
    deleteTruck: (id) => deleteItem('trucks', id, 'trucks', true),

    addDriver: (driver) => addItem('drivers', driver, 'drivers'),
    updateDriver: (id, updates) => updateItem('drivers', id, updates, 'drivers'),
    deleteDriver: (id) => deleteItem('drivers', id, 'drivers', true),

    addParty: (party) => addItem('parties', party, 'parties'),
    updateParty: (id, updates) => updateItem('parties', id, updates, 'parties'),
    deleteParty: (id) => deleteItem('parties', id, 'parties', true),

    addTrip: (trip) => addItem('trips', trip, 'trips'),
    updateTrip: (id, updates) => updateItem('trips', id, updates, 'trips'),
    deleteTrip: (id) => deleteItem('trips', id, 'trips', true),

    addTripExpense: (expense) => addItem('tripExpenses', expense, 'trip_expenses'),
    addFuelEntry: (fuel) => addItem('fuelEntries', fuel, 'fuel_entries'),
    addMaintenance: (mnt) => addItem('maintenance', mnt, 'maintenance'),
    addTyre: (tyre) => addItem('tyres', tyre, 'tyres'),
    updateTyre: (id, updates) => updateItem('tyres', id, updates, 'tyres'),
    addTyreEvent: (evt) => addItem('tyreEvents', evt, 'tyre_events'),
    addLedgerEntry: (entry) => addItem('driverLedger', entry, 'driver_ledger'),
    addDocument: (doc) => addItem('documents', doc, 'documents'),
    addInvoice: (inv) => addItem('invoices', inv, 'invoices'),
    addPayment: (pmt) => addItem('payments', pmt, 'payments'),

    // Calculators
    calculateTripPnL,
    calculateDriverBalance,
    calculateAgingReceivables,
    getExpiringDocuments,
    resetToSeedData,
    fetchFromSupabase
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
