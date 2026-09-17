import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck,
  Plus,
  Search,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Truck,
  Users
} from 'lucide-react';

export const Documents = () => {
  const { documents, trucks, drivers, addDocument } = useData();
  const { canManageOps } = useAuth();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    entity_type: 'truck',
    entity_id: trucks[0]?.id || '',
    document_type: 'insurance',
    document_number: 'INS-881920-POLICY',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '2026-10-15',
    file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600'
  });

  const handleOpenForm = () => {
    setFormData({
      entity_type: 'truck',
      entity_id: trucks[0]?.id || '',
      document_type: 'insurance',
      document_number: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '2026-10-25',
      file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument(formData);
    setIsFormOpen(false);
  };

  const getDaysLeft = (expiryDateStr) => {
    if (!expiryDateStr) return 999;
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const filteredDocs = documents.map(doc => {
    const daysLeft = getDaysLeft(doc.expiry_date);
    return { ...doc, daysLeft };
  }).filter(doc => {
    const matchesSearch = doc.document_number.toLowerCase().includes(search.toLowerCase()) ||
                          doc.document_type.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = !entityFilter || doc.entity_type === entityFilter;

    let matchesExpiry = true;
    if (expiryFilter === 'expired') matchesExpiry = doc.daysLeft <= 0;
    if (expiryFilter === '1_7') matchesExpiry = doc.daysLeft > 0 && doc.daysLeft <= 7;
    if (expiryFilter === '8_15') matchesExpiry = doc.daysLeft > 7 && doc.daysLeft <= 15;
    if (expiryFilter === '16_30') matchesExpiry = doc.daysLeft > 15 && doc.daysLeft <= 30;

    return matchesSearch && matchesEntity && matchesExpiry;
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const exportData = filteredDocs.map(d => ({
    EntityType: d.entity_type,
    DocumentType: d.document_type,
    DocumentNumber: d.document_number,
    IssueDate: d.issue_date,
    ExpiryDate: d.expiry_date,
    DaysRemaining: d.daysLeft
  }));

  return (
    <DashboardLayout title="Compliance Document Vault & Expiry Radar">
      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Document #, Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="truck">Truck Assets</option>
            <option value="driver">Driver Profiles</option>
          </select>

          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Expiry Ranges</option>
            <option value="expired">Expired (0 Days)</option>
            <option value="1_7">Critical (1 to 7 Days)</option>
            <option value="8_15">Urgent (8 to 15 Days)</option>
            <option value="16_30">Upcoming (16 to 30 Days)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="documents_compliance_list.csv" />
          {canManageOps && (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const targetEntity = doc.entity_type === 'truck'
            ? trucks.find(t => t.id === doc.entity_id)
            : drivers.find(d => d.id === doc.entity_id);

          return (
            <div key={doc.id} className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">{doc.document_type.replace('_', ' ')}</span>
                    <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">#{doc.document_number}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    doc.daysLeft <= 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 badge-glow-rose' :
                    doc.daysLeft <= 15 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 badge-glow-amber' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {doc.daysLeft <= 0 ? 'EXPIRED' : `${doc.daysLeft} Days Left`}
                  </span>
                </div>

                <div className="my-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Belongs To:</span>
                    <span className="font-semibold text-slate-200">{targetEntity?.registration_number || targetEntity?.name || 'Asset'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500 text-[11px]">Expiry Date:</span>
                    <span className="font-bold text-amber-400">{doc.expiry_date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500">Issued: {doc.issue_date || 'N/A'}</span>
                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    View File <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500 text-[10px]">No File Uploaded</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Upload Compliance Document"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Entity Type *</label>
              <select
                value={formData.entity_type}
                onChange={(e) => {
                  const type = e.target.value;
                  const defaultId = type === 'truck' ? trucks[0]?.id : drivers[0]?.id;
                  setFormData({ ...formData, entity_type: type, entity_id: defaultId || '' });
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="truck">Truck Vehicle</option>
                <option value="driver">Driver Person</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Select Target Entity *</label>
              <select
                value={formData.entity_id}
                onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                {formData.entity_type === 'truck' ? (
                  trucks.map(t => <option key={t.id} value={t.id}>{t.registration_number}</option>)
                ) : (
                  drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Document Type *</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="rc">Registration Certificate (RC)</option>
                <option value="insurance">Insurance Policy</option>
                <option value="fitness">Fitness Certificate</option>
                <option value="permit">State Road Permit</option>
                <option value="national_permit">National Permit (NP)</option>
                <option value="puc">PUC Pollution Certificate</option>
                <option value="driving_licence">Driving Licence (DL)</option>
                <option value="other">Other Document</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Document Number *</label>
              <input
                type="text"
                required
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Issue Date</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">File Document Attachment (Supabase Storage URL)</label>
            <input
              type="text"
              placeholder="https://... (Supabase Storage document link)"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
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
              Upload & Save
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
