import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UploadCloud, Thermometer, Droplets, Sprout, Sun, CloudRain, Battery, HardDrive, Wifi,
  Clock, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Activity, Zap, RefreshCw, Gauge
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Button, Card, Skeleton, Badge } from '../components/ui/index';
import SensorCard from '../components/dashboard/SensorCard';
import WidgetErrorBoundary from '../components/WidgetErrorBoundary';
import { useWebSocket } from '../context/WebSocketContext';

// Intelligence System Widgets
import { WeatherDashboard } from '../components/intelligence/WeatherDashboard';
import { IrrigationAdvisor } from '../components/intelligence/IrrigationAdvisor';
import { DiseaseRiskCard } from '../components/intelligence/DiseaseRiskCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const { activeFarm, profileCompleted } = useFarm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);
  
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    diseased: 0,
    recent: [],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(true);
    setIsRefreshing(false);
  };

  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);

  // No fake default sensors — show real data or OFFLINE state
  const defaultSensors = null;

  const [coordinates, setCoordinates] = useState(() => {
    if (activeFarm && activeFarm.latitude && activeFarm.longitude) {
      return { lat: activeFarm.latitude, lon: activeFarm.longitude };
    }
    return { lat: 28.6139, lon: 77.2090 };
  });

  useEffect(() => {
    if (activeFarm && activeFarm.latitude && activeFarm.longitude) {
      setCoordinates({ lat: activeFarm.latitude, lon: activeFarm.longitude });
    }
  }, [activeFarm]);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const statsRes = await API.get('/api/history?limit=100');
      const list = statsRes.data.predictions || [];
      const total = statsRes.data.total || 0;
      let healthy = 0;
      let diseased = 0;
      
      list.forEach(item => {
        if (item.prediction_status === 'healthy') healthy++;
        else diseased++;
      });

      setStats({ total, healthy, diseased, recent: list.slice(0, 5) });

      const devicesRes = await API.get('/api/v1/devices/status');
      const deviceList = devicesRes.data || [];
      setDevices(deviceList);
      if (deviceList.length > 0) {
        const onlineDev = deviceList.find(d => d.status === 'online') || deviceList[0];
        setActiveDevice(prev => {
          if (prev && prev.device_id === onlineDev.device_id) {
             return { ...onlineDev, latest_telemetry: onlineDev.latest_telemetry || prev.latest_telemetry };
          }
          return onlineDev;
        });
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [coordinates, fetchDashboardData]);

  const { lastTelemetry, deviceStatusMap } = useWebSocket();

  useEffect(() => {
    if (lastTelemetry) {
      const telem = lastTelemetry.telemetry || lastTelemetry;
      setActiveDevice(prev => ({
        ...(prev || {}),
        device_id: lastTelemetry.device_id || prev?.device_id || "ESP32-NODE-ALPHA",
        status: lastTelemetry.status || 'online',
        latest_telemetry: {
          ...(prev?.latest_telemetry || {}),
          ...telem
        }
      }));
    } else if (Object.keys(deviceStatusMap).length > 0) {
      const devIds = Object.keys(deviceStatusMap);
      const dev = deviceStatusMap[devIds[0]];
      setActiveDevice(prev => ({
        ...(prev || {}),
        device_id: devIds[0],
        status: dev.status || 'online',
        latest_telemetry: {
          ...(prev?.latest_telemetry || {}),
          ...(dev.latest_telemetry || {})
        }
      }));
    }
  }, [lastTelemetry, deviceStatusMap]);

  const activeTelemetry = activeDevice?.latest_telemetry || defaultSensors || {};
  const farmId = activeFarm?.farm_id || activeFarm?.id;
  const cropName = activeFarm?.crop_name || "Tomato";
  const growthStage = activeFarm?.growth_stage || "Vegetative";
  const farmSize = activeFarm?.farm_size || 1.0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-pulse">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-80 rounded-2xl" />
          <Skeleton className="lg:col-span-5 h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full pb-12"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Monitoring Control Center
              </h1>
              <Badge variant="success" className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold">
                Live Stream
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time environmental telemetry, AI crop diagnostics &amp; automated drip irrigation advisor for <strong className="text-emerald-600 dark:text-emerald-400">{activeFarm?.farm_name || "My Farm"}</strong>.
            </p>
          </div>
          <Link to="/upload" className="w-full sm:w-auto">
            <Button variant="primary" size="md" leftIcon={<UploadCloud className="w-4 h-4" />} className="w-full sm:w-auto">
              AI Scan Center
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Scans */}
        <Card glass className="p-4 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Scans</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{stats.total}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{stats.healthy} Healthy • {stats.diseased} Diseased</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        {/* KPI 2: Crop */}
        <Card glass className="p-4 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Crop</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[100px]" style={{ fontFamily: 'var(--font-display)' }}>{cropName}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block capitalize">{growthStage} Stage</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
        </Card>

        {/* KPI 3: IoT Node Status */}
        <Card glass className="p-4 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">IoT Node</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-extrabold ${activeDevice?.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`} style={{ fontFamily: 'var(--font-display)' }}>
                {activeDevice ? (activeDevice.status === 'online' ? 'Online' : 'Offline') : 'No Device'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[110px]">{activeDevice?.device_id || 'ESP32-AGRI-NODE-01'}</span>
          </div>
          <div className={`p-3 rounded-2xl ${activeDevice?.status === 'online' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-500 dark:bg-rose-950/40'} shrink-0`}>
            <Zap className="w-5 h-5" />
          </div>
        </Card>

        {/* KPI 4: Farm Location */}
        <Card glass className="p-4 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Farm Location</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[110px]" style={{ fontFamily: 'var(--font-display)' }}>{activeFarm?.farm_name || 'Setup Farm'}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate max-w-[110px]">{activeFarm?.state || activeFarm?.farm_location || 'No location set'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        {/* KPI 5: Recent Scans */}
        <Card glass className="p-4 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Recent Activity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{stats.recent.length}</span>
              <span className="text-[10px] text-slate-500 font-bold">Recent Scans</span>
            </div>
            <Link to="/history" className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline block">
              View scan history →
            </Link>
          </div>
          <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Hero Rows: Weather Intelligence + Smart Irrigation Advisor */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <WidgetErrorBoundary name="Weather Intelligence">
            <WeatherDashboard farmId={farmId} lat={coordinates.lat} lon={coordinates.lon} />
          </WidgetErrorBoundary>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <WidgetErrorBoundary name="Smart Irrigation Advisor">
            <IrrigationAdvisor farmId={farmId} cropName={cropName} growthStage={growthStage} farmSize={farmSize} />
          </WidgetErrorBoundary>
          
          <WidgetErrorBoundary name="Disease Risk Forecast">
            <DiseaseRiskCard farmId={farmId} cropName={cropName} />
          </WidgetErrorBoundary>
        </div>
      </div>



      {/* 4. Live Environmental Sensor Telemetry Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>
            Live Environmental Micro-Telemetry Streams
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleManualRefresh()}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Refresh Telemetry"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(loading || isRefreshing) ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
            {activeDevice?.status === 'online'
              ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>LIVE</span>
              : <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-400"></span>ESP32 OFFLINE — Connect device for live data</span>
            }
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <SensorCard 
            title={t('metrics.temperature', 'Temperature')} 
            value={activeTelemetry?.temperature != null ? activeTelemetry.temperature : '--'} 
            unit={activeTelemetry?.temperature != null ? '°C' : ''} 
            icon={Thermometer} 
            color="#f97316" 
            delay={0.05} 
          />
          <SensorCard 
            title={t('metrics.humidity', 'Humidity')} 
            value={activeTelemetry?.humidity != null ? activeTelemetry.humidity : '--'} 
            unit={activeTelemetry?.humidity != null ? '%' : ''} 
            icon={Droplets} 
            color="#0ea5e9" 
            delay={0.1} 
          />
          <SensorCard 
            title={t('metrics.soil_moisture', 'Soil Moisture')} 
            value={(activeTelemetry?.soil_moisture != null || activeTelemetry?.soil_percentage != null) ? (activeTelemetry.soil_moisture ?? activeTelemetry.soil_percentage) : '--'} 
            unit={(activeTelemetry?.soil_moisture != null || activeTelemetry?.soil_percentage != null) ? '%' : ''} 
            icon={Sprout} 
            color="#10b981" 
            delay={0.15} 
          />
          <SensorCard 
            title={t('metrics.light', 'Light Level')} 
            value={(activeTelemetry?.light_intensity != null || activeTelemetry?.light_lux != null) ? (activeTelemetry.light_intensity ?? activeTelemetry.light_lux) : '--'} 
            unit={(activeTelemetry?.light_intensity != null || activeTelemetry?.light_lux != null) ? 'lx' : ''} 
            icon={Sun} 
            color="#eab308" 
            delay={0.2} 
          />
          <SensorCard 
            title={t('metrics.rain', 'Rain Status')} 
            value={activeTelemetry?.rain_sensor != null ? ((activeTelemetry.rain_sensor && (activeTelemetry.rain_analog === undefined || activeTelemetry.rain_analog > 100)) ? 'Raining' : 'Clear') : '--'} 
            unit="" 
            icon={CloudRain} 
            color="#3b82f6" 
            delay={0.25} 
          />
          <SensorCard 
            title={t('metrics.pressure', 'Pressure')} 
            value={activeTelemetry?.pressure != null ? activeTelemetry.pressure : '--'} 
            unit={activeTelemetry?.pressure != null ? 'hPa' : ''} 
            icon={Gauge} 
            color="#8b5cf6" 
            delay={0.3} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
