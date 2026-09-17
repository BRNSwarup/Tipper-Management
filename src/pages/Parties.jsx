import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  FileCheck2,
  Clock,
  MapPin
} from 'lucide-react';

export const Parties = () => {
  const { parties, addParty, updateParty, deleteParty } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    party_type: 'consignor',
    gstin: '',
    phone: '',
    address: '',
    credit_days: 30
  });

  const handleOpenForm = (party = null) => {
    if (party) {
      setEditingParty(party);
      setFormData(party);
    } else {
      setEditingParty(null);
      setFormData({
        name: '',
        party_type: 'consignor',
        gstin: '',
        phone: '',
        address: '',
        credit_days: 30
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingParty) {
      updateParty(editingParty.id, formData);
    } else {
      addParty(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this client party?")) {
      deleteParty(id);
    }
  };

  const filteredParties = parties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.phone.includes(search) ||
                          (p.gstin && p.gstin.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !typeFilter || p.party_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportData = filteredParties.map(p => ({
    Name: p.name,
    Type: p.party_type,
    GSTIN: p.gstin,
    Phone: p.phone,
    CreditDays: p.credit_days,
    Address: p.address
  }));

  const typeBadges = {
    consignor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    consignee: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    broker: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    vendor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  };

  return (
    <DashboardLayout title="Parties & Client Accounts">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Party Name, GSTIN, Phone..."
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
            <option value="">All Party Types</option>
            <option value="consignor">Consignors (Senders)</option>
            <option value="consignee">Consignees (Receivers)</option>
            <option value="broker">Brokers / Agents</option>
            <option value="vendor">Vendors & Suppliers</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="parties_directory.csv" />
          {canManageOps && (
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Party</span>
            </button>
          )}
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.map(party => (
          <div key={party.id} className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">{party.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-sky-400" /> {party.phone}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeBadges[party.party_type]}`}>
                  {party.party_type}
                </span>
              </div>

              <div className="space-y-2 my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">GSTIN:</span>
                  <span className="font-mono font-bold text-slate-200">{party.gstin || 'Unregistered'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Credit Term:</span>
                  <span className="font-semibold text-emerald-400">{party.credit_days} Days</span>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="truncate">{party.address || 'No address specified'}</span>
                </div>
              </div>
            </div>

            {canManageOps && (
              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3 text-xs">
                <button
                  onClick={() => handleOpenForm(party)}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(party.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Party Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingParty ? "Edit Party Client" : "Add New Party Account"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Party Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. UltraTech Cement Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Party Type *</label>
              <select
                value={formData.party_type}
                onChange={(e) => setFormData({ ...formData, party_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="consignor">Consignor (Sender)</option>
                <option value="consignee">Consignee (Receiver)</option>
                <option value="broker">Broker / Agent</option>
                <option value="vendor">Vendor / Fuel Pump Supplier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">GSTIN Number</label>
              <input
                type="text"
                placeholder="27AAACU9812K1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 22 6691 7000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Credit Days Allowed</label>
              <input
                type="number"
                value={formData.credit_days}
                onChange={(e) => setFormData({ ...formData, credit_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Full Registered Address</label>
            <textarea
              rows={2}
              placeholder="Building, Street, City, State, Pincode"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
            />
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
              {editingParty ? "Save Party" : "Add Party"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
