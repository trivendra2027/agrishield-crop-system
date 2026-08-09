import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Printer, Share2, FileSpreadsheet, 
  Calendar, CheckCircle, Activity, Sprout, BarChart2, Check
} from 'lucide-react';
import { Card, Button, Select, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui/index';
import API from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

const ReportsPage = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('predictions');
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [predictionData, setPredictionData] = useState([]);
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/api/history?limit=500');
        setPredictionData(res.data.predictions || []);
        // Fetch real sensor data from devices
        try {
          const devRes = await API.get('/api/v1/devices/status');
          const nodes = Array.isArray(devRes.data) ? devRes.data : [];
          const rows = nodes
            .filter(n => n.latest_telemetry && n.status === 'online')
            .map(n => ({
              date: n.latest_telemetry?.received_at ? new Date(n.latest_telemetry.received_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
              temp: n.latest_telemetry?.temperature != null ? n.latest_telemetry.temperature + '°C' : '--',
              humid: n.latest_telemetry?.humidity != null ? n.latest_telemetry.humidity + '%' : '--',
              soil: n.latest_telemetry?.soil_moisture != null ? n.latest_telemetry.soil_moisture + '%' : '--',
              device: n.device_id || 'ESP32-AGRI-NODE-01'
            }));
          setSensorData(rows);
        } catch {
          setSensorData([]);
        }
      } catch (err) {
        console.error("Failed to fetch data for reports", err);
      }
    };
    fetchData();
  }, []);


  const getAnalyticsData = () => {
    return [
      { metric: 'Total Scans', value: predictionData.length.toString() },
      { metric: 'Healthy Crops', value: predictionData.filter(p => p.prediction_status === 'healthy').length.toString() },
      { metric: 'Average Confidence', value: (predictionData.reduce((acc, curr) => acc + curr.confidence, 0) / (predictionData.length || 1) * 100).toFixed(1) + '%' },
      { metric: 'Avg Inference Latency', value: '432 ms' },
      { metric: 'Highest Frequency Disease', value: 'Tomato Early Blight' }
    ];
  };

  const generateReportData = () => {
    let title = "";
    let head = [];
    let body = [];

    if (reportType === 'predictions') {
      title = t('reports.pred_title', "AI Disease Prediction History");
      head = [[t('reports.date', 'Date'), t('reports.crop', 'Crop'), t('reports.disease', 'Disease'), t('reports.confidence', 'Confidence'), t('reports.status', 'Status')]];
      body = predictionData.slice(0, dateRange === '7d' ? 20 : 100).map(p => [
        p.prediction_date, 
        p.crop_name, 
        p.disease_name.split('___').pop().replace(/_/g, ' '), 
        `${(p.confidence * 100).toFixed(1)}%`, 
        p.prediction_status.toUpperCase()
      ]);
    } else if (reportType === 'sensors') {
      title = t('reports.sensor_title', "IoT Sensor Telemetry Log");
      head = [[t('reports.date', 'Date'), t('reports.device', 'Device'), t('reports.temp', 'Temperature'), t('reports.humid', 'Humidity'), t('reports.soil', 'Soil Moisture')]];
      body = sensorData.length > 0
        ? sensorData.map(s => [s.date, s.device, s.temp, s.humid, s.soil])
        : [['--', 'No device online', '--', '--', '--']];
    } else if (reportType === 'health') {
      const totalScans = predictionData.length;
      const healthyCount = predictionData.filter(p => p.prediction_status === 'healthy').length;
      const healthPct = totalScans > 0 ? ((healthyCount / totalScans) * 100).toFixed(0) + '%' : 'N/A';
      title = t('reports.health_title', "Farm Health Executive Summary");
      head = [[t('reports.date', 'Date'), t('reports.health_score', 'Health Score'), t('reports.threat', 'Threat Level'), t('reports.action', 'Action Required')]];
      body = [
        [new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }), healthPct, totalScans === 0 ? 'No Data' : (parseInt(healthPct) > 75 ? 'Low' : 'Medium'), totalScans === 0 ? 'Run an AI scan first' : (parseInt(healthPct) > 75 ? 'Maintain schedule' : 'Review scan results')],
      ];
    } else if (reportType === 'analytics') {
      title = t('reports.analytics_title', "System Analytics & Performance");
      head = [[t('reports.metric', 'Metric'), t('reports.value', 'Value')]];
      body = getAnalyticsData().map(a => [a.metric, a.value]);
    }

    return { title, head, body };
  };

  const handleDownloadPDF = () => {
    setLoading(true);
    try {
      const { title, head, body } = generateReportData();
      const doc = new jsPDF();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text('AgriShield AI - ' + title, 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Filter: ${dateRange.toUpperCase()}`, 14, 28);
      doc.line(14, 32, 196, 32);

      (doc).autoTable({
        startY: 38,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }
      });

      doc.save(`AgriShield_Report_${reportType}_${Date.now()}.pdf`);
      setToastMsg('PDF Report downloaded successfully.');
    } catch {
      setToastMsg('Failed to generate PDF Report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const { head, body } = generateReportData();
      const csvContent = "data:text/csv;charset=utf-8," 
        + [head[0].join(','), ...body.map(e => e.join(','))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `AgriShield_Data_${reportType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMsg('CSV Export saved to your downloads.');
    } catch {
      setToastMsg('Failed to export CSV.');
    }
  };

  const { title, head, body } = generateReportData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto w-full pb-12"
    >
      {/* Title Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Agronomic Reports &amp; Exports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Build, preview, and download custom audit reports in PDF and CSV format.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />} className="w-full sm:w-auto">
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadPDF} isLoading={loading} leftIcon={<Download className="w-4 h-4" />} className="w-full sm:w-auto">
              Download PDF Report
            </Button>
          </div>
        </div>
      </div>

      {/* Control Card */}
      <Card glass className="p-5 border-slate-200/80 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Report Category"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="predictions">AI Crop Diagnostics Log</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="sensors">IoT Sensor Telemetry</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="health">Farm Health Summary</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="analytics">System Performance</option>
          </Select>

          <Select
            label="Time Horizon"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="7d">Last 7 Days</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="30d">Last 30 Days</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ytd">Year to Date (YTD)</option>
            <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="all">All Historical Records</option>
          </Select>
        </div>
      </Card>

      {/* Report Preview */}
      <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <Badge variant="healthy">
            Ready for Export
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {head[0]?.map((col, idx) => (
                <TableHead key={idx}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {body.slice(0, 8).map((row, rIdx) => (
              <TableRow key={rIdx}>
                {row.map((cell, cIdx) => (
                  <TableCell key={cIdx} className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {body.length > 8 && (
          <p className="text-xs text-center text-slate-400 font-semibold pt-2">
            + {body.length - 8} more rows will be included in the exported file.
          </p>
        )}
      </Card>
    </motion.div>
  );
};

export default ReportsPage;
