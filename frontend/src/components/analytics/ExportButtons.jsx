import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportButtons = ({ data, history, timeRange }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  const exportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Farm Analytics Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Time Range: ${timeRange.toUpperCase()}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 14, 36);
      
      // Summary Stats
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Summary Statistics', 14, 48);
      
      const stats = data?.counts || {};
      const perf = data?.performance || {};
      
      autoTable(doc, {
        startY: 52,
        head: [['Metric', 'Value']],
        body: [
          ['Total Scans', stats.total_scans || 0],
          ['Healthy Plants', stats.healthy_plants || 0],
          ['Diseased Plants', stats.diseased_plants || 0],
          ['Plant Identification Count', stats.plant_identification || 0],
          ['Agrochemical Scans', stats.agrochemical_scans || 0],
          ['Average Confidence', `${((perf.average_confidence || 0) * 100).toFixed(1)}%`],
          ['Average Inference Time', `${(perf.average_inference_time_ms || 0).toFixed(1)} ms`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
      });

      // Recent Scans
      if (history && history.length > 0) {
        doc.text('Recent Scans', 14, doc.lastAutoTable.finalY + 14);
        
        const tableBody = history.map(scan => [
          formatDate(scan.created_at),
          scan.crop_name || 'N/A',
          scan.disease_name || (scan.prediction_status === 'healthy' ? 'Healthy' : 'N/A'),
          `${((scan.confidence || 0) * 100).toFixed(1)}%`,
          scan.prediction_status || 'N/A'
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 18,
          head: [['Date', 'Crop', 'Disease/Status', 'Confidence', 'Type']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] } // blue-500
        });
      }

      doc.save(`farm-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export Failed:', err);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = () => {
    if (!history || history.length === 0) {
      alert("No recent scans to export in CSV format.");
      return;
    }
    
    setIsExporting(true);
    try {
      const headers = ['Date', 'Crop', 'Disease/Status', 'Confidence', 'Module', 'Inference Time (ms)'];
      const rows = history.map(scan => [
        `"${formatDate(scan.created_at)}"`,
        `"${scan.crop_name || 'N/A'}"`,
        `"${scan.disease_name || (scan.prediction_status === 'healthy' ? 'Healthy' : 'N/A')}"`,
        `${((scan.confidence || 0) * 100).toFixed(1)}%`,
        `"${scan.prediction_status || 'N/A'}"`,
        `${scan.prediction_time_ms || 0}`
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `farm-scans-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV Export Failed:', err);
      alert('Failed to generate CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportCSV}
        disabled={isExporting}
        className="flex items-center space-x-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline">CSV</span>
      </button>
      <button
        onClick={exportPDF}
        disabled={isExporting}
        className="flex items-center space-x-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
