import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, FileText, FileSpreadsheet, Trash2, Calendar, Eye, ChevronLeft, ChevronRight, Activity, Cpu, RefreshCw } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Dialog, EmptyState, Skeleton } from '../components/ui/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HistoryPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('prediction');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const backendBaseUrl = import.meta.env.VITE_API_URL || '';

  const [predictionData, setPredictionData] = useState([]);
  const [sensorData, setSensorData] = useState([]);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const [selectedFarmer, setSelectedFarmer] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');

  const uniqueFarmers = useMemo(() => {
    const list = activeTab === 'prediction' ? predictionData : sensorData;
    const farmers = new Set();
    list.forEach(item => {
      if (item.farmer_name) farmers.add(item.farmer_name);
    });
    return Array.from(farmers).sort();
  }, [predictionData, sensorData, activeTab]);

  const uniqueDevices = useMemo(() => {
    const devices = new Set();
    sensorData.forEach(item => {
      if (item.device || item.device_id) devices.add(item.device || item.device_id);
    });
    return Array.from(devices).sort();
  }, [sensorData]);

  const itemsPerPage = 10;

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    API.get('/api/v1/devices/status').then(res => {
      const nodes = Array.isArray(res.data) ? res.data : (res.data?.nodes || []);
      setIsOnline(nodes.some(n => n.status === 'online'));
    }).catch(() => setIsOnline(false));
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (!predictionData.length && !sensorData.length && !isManual) setLoading(true);
    if (isManual) setIsRefreshing(true);
    try {
      const res = await API.get('/api/history', { params: { limit: 5000, page: 1 } });
      const rawPreds = res.data.predictions || [];
      const formattedPreds = rawPreds.map(p => {
        const pDate = p.created_at || p.prediction_date;
        const pTs = pDate ? new Date(pDate) : null;
        return {
          ...p,
          displayDate: pTs && !isNaN(pTs.getTime()) ? pTs.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : (p.prediction_date || 'N/A'),
          displayTime: pTs && !isNaN(pTs.getTime()) ? pTs.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : (p.prediction_time || 'N/A')
        };
      });
      setPredictionData(formattedPreds);
      
      try {
        const telRes = await API.get('/api/v1/iot/telemetry/history', { params: { limit: 5000, timeframe: 'raw' } });
        let rawData = telRes.data || [];
        
        const parseDateTime = (raw) => {
          if (!raw || raw === 'null') return null;
          if (typeof raw === 'string') {
            let s = raw.trim();
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
              s = s.replace(' ', 'T');
            }
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d;
          }
          const d = new Date(raw);
          return !isNaN(d.getTime()) ? d : null;
        };

        // Sort newest first
        rawData.sort((a, b) => {
          const timeA = parseDateTime(a.timestamp)?.getTime() || 0;
          const timeB = parseDateTime(b.timestamp)?.getTime() || 0;
          return timeB - timeA;
        });
        
        const rows = rawData.map((n, i) => {
          const ts = parseDateTime(n.timestamp);
          let isoDateStr = '';
          if (ts) {
            const year = ts.getFullYear();
            const month = String(ts.getMonth() + 1).padStart(2, '0');
            const day = String(ts.getDate()).padStart(2, '0');
            isoDateStr = `${year}-${month}-${day}`;
          }

          return {
            id: n.id || `sens-${i}`,
            rawDate: isoDateStr,
            rawTimestamp: n.timestamp,
            date: ts ? ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A',
            time: ts ? ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : 'N/A',
            temperature: n.temperature ?? '--',
            humidity: n.humidity ?? '--',
            light: n.light_intensity ?? '--',
            soil: n.soil_moisture ?? '--',
            rain: n.rain_sensor ? '1' : '0',
            battery: n.battery_percentage ?? '--',
            device: n.device_id || 'ESP32-Node-1',
            farmer_name: n.farmer_name || 'Unknown'
          };
        });
        setSensorData(rows);
        if (isManual) {
          setToastMsg('✅ Sensor telemetry and logs refreshed!');
        }
      } catch (err) {
        console.warn("Sensor data fetch failed", err);
      }
    } catch (err) {
      console.error(err);
      if (!predictionData.length) setToastMsg('Failed to load history data.');
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [predictionData.length, sensorData.length]);

  useEffect(() => {
    fetchData();
    let interval;
    if (isOnline) {
      interval = setInterval(() => fetchData(), 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, fetchData]);


  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, activeTab]);

  const setQuickDate = (type) => {
    const now = new Date();
    const getIso = (d) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${da}`;
    };
    
    if (type === 'today') {
      const todayStr = getIso(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(getIso(past));
      setEndDate(getIso(now));
    } else if (type === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(getIso(past));
      setEndDate(getIso(now));
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const getItemIsoDate = (item, tab) => {
    if (tab === 'prediction') {
      const raw = item.prediction_date || item.created_at || item.timestamp || '';
      if (!raw) return '';
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
        return raw.slice(0, 10);
      }
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${da}`;
      }
      return '';
    } else {
      return item.rawDate || '';
    }
  };

  const processedData = useMemo(() => {
    let data = activeTab === 'prediction' ? [...predictionData] : [...sensorData];

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(item => {
        if (activeTab === 'prediction') {
          return (
            (item.crop_name || '').toLowerCase().includes(lowerSearch) ||
            (item.disease_name || '').toLowerCase().includes(lowerSearch) ||
            (item.prediction_status || '').toLowerCase().includes(lowerSearch)
          );
        } else {
          return (item.device || '').toLowerCase().includes(lowerSearch);
        }
      });
    }

    if (startDate) {
      data = data.filter(item => {
        const itemDate = getItemIsoDate(item, activeTab);
        return itemDate && itemDate >= startDate;
      });
    }
    if (endDate) {
      data = data.filter(item => {
        const itemDate = getItemIsoDate(item, activeTab);
        return itemDate && itemDate <= endDate;
      });
    }

    
    if (selectedFarmer !== 'all') {
      data = data.filter(item => item.farmer_name === selectedFarmer);
    }
    if (activeTab === 'sensor' && selectedDevice !== 'all') {
      data = data.filter(item => (item.device || item.device_id) === selectedDevice);
    }

    return data;
  }, [predictionData, sensorData, activeTab, search, startDate, endDate, selectedFarmer, selectedDevice]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, page, itemsPerPage]);

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await API.delete(`/api/history/${id}`);
      setPredictionData(prev => prev.filter(item => item.id !== id));
      setToastMsg('Record deleted successfully.');
    } catch {
      setToastMsg('Failed to delete record.');
    }
  };

  const handleExportCSV = () => {
    if (processedData.length === 0) return;
    let headers = [];
    let rows = [];

    if (activeTab === 'prediction') {
      headers = ["ID", "Farmer", "Date", "Time", "Crop", "Disease", "Confidence (%)", "Status"];
      rows = processedData.map(p => [
        p.id,
        p.farmer_name || 'N/A',
        p.displayDate || p.prediction_date || 'N/A',
        p.displayTime || p.prediction_time || 'N/A',
        p.crop_name,
        p.disease_name,
        (p.confidence * 100).toFixed(1),
        p.prediction_status
      ]);
    } else {
      headers = ["ID", "Device", "Farmer", "Date", "Time", "Temp (C)", "Humidity (%)", "Soil (%)", "Light (lux)", "Rain", "Battery (%)"];
      rows = processedData.map(s => [
        s.id,
        s.device,
        s.farmer_name || 'N/A',
        s.date,
        s.time,
        s.temperature,
        s.humidity,
        s.soil,
        s.light,
        s.rain === '1' ? 'Wet' : 'Dry',
        s.battery
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agrishield_${activeTab}_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-sm font-medium flex items-center gap-2"
        >
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="ml-2 text-slate-400 hover:text-white">&times;</button>
        </motion.div>
      )}

      {/* Title Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Scan & Diagnostic History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Searchable, paginated audit records for crop health scans and ESP32 telemetry logs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-4 h-4 text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="w-full sm:w-auto font-medium border-emerald-500/30 hover:border-emerald-500/60"
          >
            {isRefreshing ? 'Refreshing...' : 'Reload Telemetry'}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />} className="w-full sm:w-auto">
            Export CSV Log
          </Button>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <Card glass className="p-4 border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <Button
              variant={activeTab === 'prediction' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('prediction')}
              className="text-xs font-semibold rounded-lg"
            >
              AI Predictions ({predictionData.length})
            </Button>
            <Button
              variant={activeTab === 'sensor' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sensor')}
              className="text-xs font-semibold rounded-lg"
            >
              Sensor Telemetry ({sensorData.length})
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
            <button
              onClick={() => setQuickDate('today')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setQuickDate('7days')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            >
              7 Days
            </button>
            <button
              onClick={() => setQuickDate('30days')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            >
              30 Days
            </button>
            <button
              onClick={() => setQuickDate('all')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Search and Date Pickers */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full sm:w-60">
            <Input
              placeholder="Search crop, disease, node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="text-xs"
            />
          </div>

          {/* Clean Inline Date Range Box */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-400 uppercase">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>

          {(startDate || endDate || search || selectedFarmer !== 'all' || selectedDevice !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStartDate(''); setEndDate(''); setSearch(''); setSelectedFarmer('all'); setSelectedDevice('all'); }}
              className="text-xs text-rose-500 hover:bg-rose-500/10 font-medium px-2.5"
            >
              Reset Filters
            </Button>
          )}

          {isAdmin && (
            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Farmers</option>
              {uniqueFarmers.map(f => (
                <option key={f} value={f} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{f}</option>
              ))}
            </select>
          )}
          {isAdmin && activeTab === 'sensor' && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Devices</option>
              {uniqueDevices.map(d => (
                <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{d}</option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Main Data Table */}
      {processedData.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No History Records Found"
          description="Try broadening your search keywords or adjusting date range filters."
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                {activeTab === 'prediction' ? (
                  <>
                    <TableHead>Thumbnail</TableHead>
                    {isAdmin && <TableHead>Farmer / Owner</TableHead>}
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Crop Target</TableHead>
                    <TableHead>Diagnosis / Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Device Node</TableHead>
                    {isAdmin && <TableHead>Farmer / Owner</TableHead>}
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                    <TableHead>Humidity (%)</TableHead>
                    <TableHead>Soil Moisture</TableHead>
                    <TableHead>Light (lux)</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => {
                if (activeTab === 'prediction') {
                  const isHealthy = item.prediction_status === 'healthy';
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                          {item.image_path ? (
                            <img
                              src={`${backendBaseUrl}/${item.image_path.replace(/\\/g, '/')}`}
                              alt="Scan"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Photo</div>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && <TableCell className="text-xs font-bold text-sky-600 dark:text-sky-400">{item.farmer_name || 'Unknown'}</TableCell>}
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{item.displayDate || item.prediction_date}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.displayTime || item.prediction_time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {item.crop_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isHealthy ? 'healthy' : 'diseased'}>
                          {item.disease_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {(item.confidence * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setInspectRecord(item); setInspectModalOpen(true); }}
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRecord(item.id)}
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-500" />
                          {item.device}
                        </div>
                      </TableCell>
                      {isAdmin && <TableCell className="text-xs font-bold text-sky-600 dark:text-sky-400">{item.farmer_name || 'Unknown'}</TableCell>}
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{item.date}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50 shadow-sm">
                          {item.temperature}°C
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-sky-50/50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50 shadow-sm">
                          {item.humidity}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 shadow-sm">
                          {item.soil}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 shadow-sm">
                          {item.light} lx
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, processedData.length)} of {processedData.length} entries
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspect Modal */}
      <Dialog
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Diagnostic Record Details"
      >
        {inspectRecord && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Crop: {inspectRecord.crop_name}</span>
              <Badge variant={inspectRecord.prediction_status === 'healthy' ? 'healthy' : 'diseased'}>
                {inspectRecord.disease_name}
              </Badge>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p><strong>Confidence:</strong> {(inspectRecord.confidence * 100).toFixed(1)}%</p>
              <p><strong>Date & Time:</strong> {inspectRecord.prediction_date} {inspectRecord.prediction_time}</p>
              <p><strong>Record ID:</strong> {inspectRecord.id}</p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default HistoryPage;
