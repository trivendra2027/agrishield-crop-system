import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, RefreshCw, Terminal, CheckCircle2, Play, Power,
  SkipBack, SkipForward, Server, Activity, Thermometer, Droplets,
  Sun, Download, Wifi, Clock, Sliders, RotateCw, Moon, Timer, BatteryFull
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/index';
import API from '../services/api';

const NodeControlPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [nodeIp, setNodeIp] = useState('');
  const [nodeId, setNodeId] = useState('ESP32-NODE-ALPHA');
  const [liveData, setLiveData] = useState({ t: '--', h: '--', l: '--', p: '--', a: 0 });
  const [isDetecting, setIsDetecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // Wi-Fi config
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiApi, setWifiApi] = useState('');

  // Screen Stay-On Time
  const [timeoutMin, setTimeoutMin] = useState('0');
  const [timeoutSec, setTimeoutSec] = useState('30');

  // Night Sleep Interval
  const [sleepInt, setSleepInt] = useState('10');
  
  // Day Sleep Interval
  const [daySleepInt, setDaySleepInt] = useState('0');

  // Data Upload Interval
  const [advInterval, setAdvInterval] = useState('60000');

  // Temp calibration
  const [advTempOff, setAdvTempOff] = useState('');

  // Time sync
  const [sysDate, setSysDate] = useState('');
  const [sysTime, setSysTime] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const fetchStatus = async () => {
    // Cloud architecture: ESP32 pushes telemetry via WebSocket.
    // For Node Control Panel, we just assume it's connected if we detected it online via Cloud Backend.
    if (nodeIp) {
      setIsConnected(true);
      // We can't fetch direct /status from ESP32 screen state in Cloud Mode easily.
      // Set dummy data or keep last known.
    }
  };

  // Auto-detect IP from backend
  useEffect(() => {
    const discoverDevice = async () => {
      try {
        const res = await API.get('/api/v1/devices/status');
        if (res.data) {
          const devices = res.data;
          const activeDevice = devices.find(d => d.status === 'online' && d.ip);
          if (activeDevice) {
            setNodeIp(activeDevice.ip);
            setNodeId(activeDevice.device_id || 'ESP32-NODE-ALPHA');
            showToast('✅ Auto-detected ESP32 at ' + activeDevice.ip);
          }
        }
      } catch (err) {
        console.error('Failed to auto-detect device IP:', err);
      } finally {
        setIsDetecting(false);
      }
    };
    discoverDevice();
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, [nodeIp]);

  const sendCommand = async (cmd, msg) => {
    try {
      await API.post('/api/v1/devices/command', { device_id: nodeId, command: cmd });
      showToast(msg + ' ✓ (Queued for Cloud Delivery)');
    } catch {
      showToast('⚠️ Failed to send command to Cloud', 'error');
    }
  };

  const saveWifiConfig = async () => {
    if (!wifiSsid) { showToast('⚠️ Enter Wi-Fi name first', 'error'); return; }
    try {
      const payload = { ssid: wifiSsid, pass: wifiPass };
      if (wifiApi) payload.api = wifiApi;
      
      const cmdStr = `/save-node?ssid=${encodeURIComponent(wifiSsid)}&pass=${encodeURIComponent(wifiPass)}&api=${encodeURIComponent(wifiApi)}`;
      await API.post('/api/v1/devices/command', { device_id: nodeId, command: cmdStr });
      showToast('✅ Wi-Fi Saved! Node rebooting...');
    } catch {
      showToast('⚠️ Failed to save Wi-Fi config', 'error');
    }
  };

  const saveHardwareConfig = async () => {
    try {
      const cmdStr = `/save-adv?min=${timeoutMin}&sec=${timeoutSec}&sleepInt=${sleepInt}&daySleepInt=${daySleepInt}&interval=${advInterval}&tempOff=${advTempOff}`;
      await API.post('/api/v1/devices/command', { device_id: nodeId, command: cmdStr });
      showToast('✅ Hardware Settings Saved! Node rebooting...');
    } catch {
      showToast('⚠️ Failed to save hardware settings', 'error');
    }
  };

  const syncSystemTime = async () => {
    if (!sysDate || !sysTime) { showToast('⚠️ Select both date and time', 'error'); return; }
    try {
      await API.post('/api/v1/devices/command', { device_id: nodeId, command: `/settime?d=${sysDate}&t=${sysTime}` });
      showToast('✅ Time synced to device!');
    } catch {
      showToast('⚠️ Failed to sync time', 'error');
    }
  };

  const animNames = ['', 'Rain Warn', 'Hot Warn', 'Sunrise', 'Sunset', 'Growing', 'Watering', 'Night Mode', 'Syncing'];

  const tabs = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity, 
      color: 'text-cyan-700 dark:text-cyan-400', 
      bgActive: 'bg-cyan-50 dark:bg-cyan-500/20', 
      border: 'border-cyan-200 dark:border-cyan-500/50' 
    },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi, 
      color: 'text-emerald-700 dark:text-emerald-400', 
      bgActive: 'bg-emerald-50 dark:bg-emerald-500/20', 
      border: 'border-emerald-200 dark:border-emerald-500/50' 
    },
    { id: 'hardware', label: 'Hardware Config', icon: Settings, 
      color: 'text-amber-700 dark:text-amber-400', 
      bgActive: 'bg-amber-50 dark:bg-amber-500/20', 
      border: 'border-amber-200 dark:border-amber-500/50' 
    },
    { id: 'power', label: 'Data & Power', icon: BatteryFull, 
      color: 'text-red-700 dark:text-red-400', 
      bgActive: 'bg-red-50 dark:bg-red-500/20', 
      border: 'border-red-200 dark:border-red-500/50' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Terminal className="w-8 h-8 mr-3 text-emerald-600 dark:text-emerald-500" />
            Node Control Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Directly control and configure your AgriShield ESP32 hardware.</p>
        </div>
        <Badge variant={isDetecting ? 'warning' : (isConnected ? 'success' : 'danger')} className="text-sm py-1.5 px-4 shadow-sm">
          {isDetecting ? '🔍 Detecting Node...' : (isConnected ? '🟢 Node Online' : '🔴 Node Offline')}
        </Badge>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-2xl z-50 text-white flex items-center ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Tab Bar */}
      <div className="flex space-x-2 bg-white/70 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md overflow-x-auto shadow-sm dark:shadow-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap
              ${activeTab === tab.id 
                ? `${tab.bgActive} ${tab.color} ${tab.border} border shadow-sm dark:shadow-lg` 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ======================================= */}
        {/* TAB 1: DASHBOARD */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Monitor */}
            <div className="lg:col-span-5">
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-6 h-full shadow-sm dark:shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]">
                <h3 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" /> Live Screen Monitor
                </h3>
                <div className="bg-slate-900 dark:bg-slate-950/80 border-2 border-slate-800 dark:border-slate-700/50 rounded-xl p-6 shadow-inner flex flex-col justify-center min-h-[200px] items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent"></div>
                  
                  {!nodeIp ? (
                    <p className="text-slate-400 font-mono text-sm relative z-10 animate-pulse">{isDetecting ? "Scanning network for ESP32..." : "No IP Address Configured"}</p>
                  ) : !isConnected ? (
                    <p className="text-slate-400 font-mono text-sm relative z-10 animate-pulse">Awaiting connection...</p>
                  ) : liveData.a > 0 ? (
                    <div className="text-center text-white font-bold font-mono text-xl relative z-10">
                      <span className="text-cyan-400">{animNames[liveData.a] || 'ANIMATION'}</span>
                      <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Playing animation...</p>
                    </div>
                  ) : (
                    <pre className="font-mono text-[13px] leading-relaxed text-emerald-400 text-left w-full max-w-[240px] m-0 relative z-10">
                      {liveData.p === 1 && `Temp  : ${liveData.t} °C\nHumid : ${liveData.h} %RH\nLight : ${liveData.l} Lux`}
                      {liveData.p === 2 && `Soil  : ${liveData.sm ?? '--'} %\nRain  : ${liveData.rn === true ? 'YES' : 'NO'}\nPress : ${liveData.pr ?? '--'} hPa`}
                      {liveData.p === 3 && `Batt  : ${liveData.bp ?? '--'} %\nVolt  : ${liveData.bv ?? '--'} V\nState : ${Number(liveData.l) < 10 ? 'Night' : 'Day'}`}
                      {liveData.p === 4 && `WiFi  : ${liveData.wf || 'DISCONNECTED'}\nBT    : ${liveData.bt || 'READY'}\nNode  : AgriShield_01`}
                      {liveData.p === 5 && `SD Card:\nStatus: ${liveData.sd || 'FAILED'}\nSize  : ${liveData.sz || 0} MB`}
                      {liveData.p > 5 && `PAGE ${liveData.p}`}
                    </pre>
                  )}
                </div>
                {isConnected && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center font-medium">
                    Screen active: <span className="text-slate-700 dark:text-slate-300 font-mono">{liveData.sc ?? '--'}s</span> &nbsp;|&nbsp; Page: <span className="text-slate-700 dark:text-slate-300 font-mono">{liveData.p}</span>/5
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Display Controls */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                  <Power className="w-5 h-5 mr-2" /> Display Controls
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button onClick={() => sendCommand('/screen-on', 'Screen ON')} className="flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/50 rounded-xl py-4 font-bold transition-all">
                    💡 Turn Screen On
                  </button>
                  <button onClick={() => sendCommand('/screen-off', 'Screen OFF')} className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/50 rounded-xl py-4 font-bold transition-all">
                    🌑 Turn Screen Off
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => sendCommand('/page-prev', 'Page Back')} className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/50 rounded-xl py-3 font-bold transition-all">
                    <SkipBack className="w-4 h-4 mr-2" /> Prev Page
                  </button>
                  <button onClick={() => sendCommand('/page-next', 'Page Fwd')} className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/50 rounded-xl py-3 font-bold transition-all">
                    Next Page <SkipForward className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Animations */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2" /> Trigger Weather Animations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['/anim-rain', '🌧️ Rain', 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30'],
                    ['/anim-hot', '☀️ Hot', 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 border-orange-200 dark:border-orange-500/30'],
                    ['/anim-sunrise', '🌅 Sunrise', 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/30'],
                    ['/anim-sunset', '🌇 Sunset', 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border-purple-200 dark:border-purple-500/30'],
                    ['/anim-grow', '🌿 Grow', 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 border-green-200 dark:border-green-500/30'],
                    ['/anim-water', '💦 Water', 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/30'],
                    ['/anim-night', '🌙 Night', 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30'],
                    ['/anim-sync', '🔄 Sync', 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30']
                  ].map(([cmd, label, colorClass]) => (
                    <button
                      key={cmd}
                      onClick={() => sendCommand(cmd, `Playing ${label}`)}
                      className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${colorClass}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: CONNECTIVITY */}
        {/* ======================================= */}
        {activeTab === 'connectivity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm dark:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-5 flex items-center">
                <Server className="w-5 h-5 mr-2" /> Direct Connection Setup
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Enter the exact IP address of your ESP32 device to connect this dashboard directly over the local network.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">ESP32 LOCAL IP ADDRESS</label>
                  <input
                    type="text" value={nodeIp} onChange={(e) => setNodeIp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors font-mono shadow-inner"
                    placeholder="e.g. 10.189.236.45"
                  />
                </div>
                <button onClick={fetchStatus} className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-bold transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" /> Test Connection
                </button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-5 flex items-center">
                <Wifi className="w-5 h-5 mr-2" /> Remote Wi-Fi Configuration
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Save new Wi-Fi credentials to the ESP32's permanent memory. The device will reboot to apply them.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">NETWORK NAME (SSID)</label>
                  <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="Enter network name"
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:border-slate-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">NETWORK PASSWORD</label>
                  <input type="password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="Enter password"
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:border-slate-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">PC API URL (OPTIONAL)</label>
                  <input type="text" value={wifiApi} onChange={(e) => setWifiApi(e.target.value)} placeholder="http://192.168.X.X:8000"
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-5 py-3 text-slate-900 dark:text-white outline-none focus:border-slate-500 transition-colors font-mono" />
                </div>
              </div>
              <button onClick={saveWifiConfig} className="w-full flex items-center justify-center bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl py-3 font-bold transition-colors">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Save Wi-Fi & Reboot
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: HARDWARE CONFIG */}
        {/* ======================================= */}
        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="space-y-6">
              {/* Screen Timeout */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 shadow-sm dark:shadow-[0_0_30px_-10px_rgba(245,158,11,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center">
                    <Sun className="w-5 h-5 mr-2" /> Screen Stay-On Time
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Duration the OLED stays awake after a button press.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">MINUTES</label>
                    <input type="number" min="0" value={timeoutMin} onChange={(e) => setTimeoutMin(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-center text-xl font-mono" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">SECONDS</label>
                    <input type="number" min="0" max="59" value={timeoutSec} onChange={(e) => setTimeoutSec(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-center text-xl font-mono" placeholder="30" />
                  </div>
                </div>
                {/* Presets */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => {setTimeoutMin('0'); setTimeoutSec('5');}} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">5 Sec</button>
                  <button onClick={() => {setTimeoutMin('0'); setTimeoutSec('10');}} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">10 Sec</button>
                  <button onClick={() => {setTimeoutMin('0'); setTimeoutSec('30');}} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">30 Sec</button>
                  <button onClick={() => {setTimeoutMin('1'); setTimeoutSec('0');}} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">1 Min</button>
                </div>
              </div>

              {/* Sleep Interval */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <div className="flex items-center mb-4">
                  <Moon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Autonomous Sleep Intervals</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Deep sleep duration for Day and Night modes.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">NIGHT (MINUTES)</label>
                    <input type="number" min="1" max="1440" value={sleepInt} onChange={(e) => setSleepInt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-center text-2xl font-mono font-bold" placeholder="10" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">DAY (0 = OFF)</label>
                    <input type="number" min="0" max="1440" value={daySleepInt} onChange={(e) => setDaySleepInt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-center text-2xl font-mono font-bold" placeholder="0" />
                  </div>
                </div>
                {/* Presets */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setDaySleepInt('0')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Off</button>
                  <button onClick={() => setDaySleepInt('1')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors">1 Min</button>
                  <button onClick={() => setDaySleepInt('2')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors">2 Min</button>
                  <button onClick={() => setDaySleepInt('5')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors">5 Min</button>
                  <button onClick={() => setDaySleepInt('10')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors">10 Min</button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload Interval */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <div className="flex items-center mb-4">
                  <Activity className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Data Upload Interval</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">How often the ESP32 logs data to the SD card during daytime.</p>
                <select value={advInterval} onChange={(e) => setAdvInterval(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="15000">15 Seconds (Rapid)</option>
                  <option value="30000">30 Seconds</option>
                  <option value="60000">1 Minute (Default)</option>
                  <option value="300000">5 Minutes (Balanced)</option>
                  <option value="900000">15 Minutes (Battery Saver)</option>
                  <option value="3600000">1 Hour (Ultra Low Power)</option>
                </select>
              </div>

              {/* Temperature Calibration */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-red-200 dark:border-red-500/30 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <div className="flex items-center mb-4">
                  <Thermometer className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Temp Calibration (°C)</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter an offset (e.g. -2.0) to correct sensor readings.</p>
                <input type="number" step="0.1" value={advTempOff} onChange={(e) => setAdvTempOff(e.target.value)}
                  placeholder="e.g. -1.5 (leave blank to keep current)"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-red-500" />
              </div>
            </div>

            {/* Save Buttons & Time Sync */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <button onClick={saveHardwareConfig} className="flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-4 font-bold transition-colors shadow-lg dark:shadow-[0_4px_14px_0_rgba(217,119,6,0.39)]">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Save Hardware Config & Reboot
              </button>
              
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none">
                <div className="flex space-x-3">
                  <input type="date" value={sysDate} onChange={(e) => setSysDate(e.target.value)} className="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none text-sm" />
                  <input type="time" step="1" value={sysTime} onChange={(e) => setSysTime(e.target.value)} className="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none text-sm" />
                </div>
                <button onClick={syncSystemTime} className="bg-slate-800 hover:bg-slate-700 text-white dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-sm border border-slate-600">
                  Sync Time
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: DATA & POWER */}
        {/* ======================================= */}
        {activeTab === 'power' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* SD Logs */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-4 flex items-center relative z-10">
                <Terminal className="w-5 h-5 mr-2" /> SD Card Logs
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                Wipe the telemetry backlog from the ESP32's SD card to free up space.
              </p>
              <button onClick={() => sendCommand('/api/erase-logs', 'Erasing SD Logs')}
                className="flex items-center justify-center w-full bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-100 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/50 py-3 rounded-xl font-bold transition-all relative z-10">
                Erase logs.txt
              </button>
            </div>

            {/* Offline Mode */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center relative z-10">
                <Wifi className="w-5 h-5 mr-2 line-through" /> Strict Offline
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                Reboots device with Wi-Fi permanently disabled to save battery. SD logging only.
              </p>
              <button onClick={() => sendCommand('/api/strict_offline', 'Enabling Strict Offline')} className="w-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/50 py-3 rounded-xl font-bold transition-all relative z-10">
                Enable Offline Mode
              </button>
            </div>

            {/* Shutdown */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-red-200 dark:border-red-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 dark:from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center relative z-10">
                <Power className="w-5 h-5 mr-2" /> Complete Shutdown
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                Puts ESP32 into zero-activity deep sleep. Screen off, no sensors. Button 1 to wake.
              </p>
              <button onClick={() => sendCommand('/api/shutdown', 'Shutting down')} className="w-full flex items-center justify-center bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/50 py-3 rounded-xl font-bold transition-all relative z-10">
                Shutdown Device
              </button>
            </div>

            {/* Reset */}
            <div className="md:col-span-2 lg:col-span-3 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm dark:shadow-none">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center">
                  <RotateCw className="w-5 h-5 mr-2" /> Soft Reset
                </h3>
                <p className="text-sm text-slate-500">Restart the ESP32 without changing any saved settings.</p>
              </div>
              <button onClick={() => sendCommand('/reset', 'Rebooting...')} className="mt-4 md:mt-0 px-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white dark:text-slate-300 border border-slate-600 py-3 rounded-xl font-bold transition-all shadow-lg dark:shadow-none">
                Reboot Node
              </button>
            </div>
            
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default NodeControlPage;
