import React from 'react';
import { Download } from 'lucide-react';

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const ExportButton = ({ data, filename, label = "Export CSV" }) => {
  return (
    <button
      onClick={() => exportToCSV(data, filename)}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
    >
      <Download className="w-3.5 h-3.5 text-sky-400" />
      <span>{label}</span>
    </button>
  );
};
