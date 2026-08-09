import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Wifi, WifiOff, Battery, HardDrive, Clock, Activity, 
  RefreshCcw, AlertTriangle, CheckCircle2, Terminal, Radio, Server
} from 'lucide-react';
import { Card, Button, Badge, Progress } from '../components/ui/index';
import { useWebSocket } from '../context/WebSocketContext';
// WebBluetoothConnector removed — BLE disabled until Huge APP partition is configured

const DevicesPage = () => {
  const [deviceData, setDeviceData] = useState({
    name: "ESP32-NODE-ALPHA",
    status: "offline",
    firmware: "v2.0-main",
    battery: 0,
    batteryCharging: false,
    wifiStrength: -100,
    sensorHealth: "OFFLINE",
    sensorHealthSub: "Device disconnected",
    lastSync: "Never",
    sdCard: { status: "unmounted", usage: 0, total: 32 },
    uptime: "Offline",
    memory: { used: 0, total: 320 },
    cpu: 0,
    temperature: null,
    humidity: null,
    pressure: null,
    soilMoisture: null,
    rainDetected: false
  });

  const { connectionStatus, lastTelemetry, deviceStatusMap } = useWebSocket();

  const processDeviceTelemetry = (dev, telem) => {
    const isOnline = dev && dev.status === "online";
    let lastSyncText = "Never";
    if (dev && dev.seconds_since_seen !== undefined && dev.seconds_since_seen < 99999) {
      if (dev.seconds_since_seen < 10) lastSyncText = "Just now";
      else if (dev.seconds_since_seen < 60) lastSyncText = `${dev.seconds_since_seen}s ago`;
      else lastSyncText = `${Math.floor(dev.seconds_since_seen / 60)}m ago`;
    } else if (isOnline) {
      lastSyncText = "Just now";
    }

    const sdMounted = Boolean(telem.sd_card_status === "mounted");
    const sdUsedGb = (sdMounted && telem.sd_used_mb > 0) ? (telem.sd_used_mb / 1024) : 0;
    const sdTotalGb = (sdMounted && telem.sd_total_mb > 0) ? (telem.sd_total_mb / 1024) : 0;

    let validSensors = 0;
    if (telem.temperature != null || telem.humidity != null) validSensors++; // 1. AHT20
    if (telem.soil_moisture != null) validSensors++;                         // 2. Soil
    if (telem.light_lux != null) validSensors++;                             // 3. BH1750
    if (telem.battery_percentage != null) validSensors++;                    // 4. Battery
    if (telem.pressure != null) validSensors++;                              // 5. BMP280
    if (telem.rain_detected != null) validSensors++;                         // 6. Rain
    if (sdMounted) validSensors++;                                           // 7. SD Card

    let healthStatus = "OFFLINE";
    let healthSub = "Device disconnected";
    if (isOnline) {
      if (validSensors >= 6) {
        healthStatus = "OPTIMAL";
        healthSub = "All 7 sensors nominal";
      } else if (validSensors > 0) {
        healthStatus = `${validSensors}/7 ACTIVE`;
        healthSub = `${validSensors} of 7 modules connected`;
      } else {
        healthStatus = "READY";
        healthSub = "Connected, awaiting sensors";
      }
    }

    const rawBattery = isOnline ? (telem.battery_percentage ?? telem.battery ?? dev.battery ?? 0) : 0;
    const roundedBattery = Math.round(Number(rawBattery) || 0);
    const formattedVoltage = isOnline && telem.battery_voltage ? telem.battery_voltage.toFixed(2) : "0.00";

    setDeviceData({
      name: dev.device_name || dev.device_id || "ESP32-NODE-ALPHA",
      status: dev.status || "offline",
      firmware: dev.firmware_version || "v2.5.0-main",
      battery: roundedBattery,
      batteryVoltage: formattedVoltage,
      batteryCharging: isOnline ? Boolean(telem.charging) : false,
      batteryLow: isOnline ? Boolean(telem.battery_low) : false,
      wifiStrength: isOnline && telem.wifi_rssi !== undefined ? telem.wifi_rssi : (isOnline ? (telem.rssi ?? -65) : -100),
      sensorHealth: healthStatus,
      sensorHealthSub: healthSub,
      lastSync: lastSyncText,
      sdCard: {
        status: isOnline && sdMounted ? "mounted" : "unmounted",
        usageMb: isOnline ? (telem.sd_used_mb || 0) : 0,
        freeMb: isOnline ? (telem.sd_free_mb || (sdMounted ? 14850 : 0)) : 0,
        totalMb: isOnline ? (telem.sd_total_mb || (sdMounted ? 16384 : 0)) : 0,
        pendingRecords: isOnline ? (telem.sd_pending_records || 0) : 0,
        logFile: isOnline ? (telem.current_log_file || "/logs/2026/07") : "N/A"
      },
      uptime: isOnline ? (telem.uptime_formatted || (telem.uptime_seconds ? `${Math.floor(telem.uptime_seconds / 3600)}h` : "Online")) : "Offline",
      memory: {
        used: isOnline && telem.free_heap_kb ? (320 - telem.free_heap_kb) : 0,
        total: 320
      },
      cpu: isOnline ? (telem.cpu_load || 12) : 0,
      temperature: isOnline && telem.temperature != null ? Number(telem.temperature).toFixed(1) : null,
      humidity: isOnline && telem.humidity != null ? Number(telem.humidity).toFixed(1) : null,
      pressure: isOnline && telem.pressure != null ? Number(telem.pressure).toFixed(0) : null,
      soilMoisture: isOnline && telem.soil_moisture != null ? Number(telem.soil_moisture).toFixed(1) : (isOnline && telem.soil_percentage != null ? Number(telem.soil_percentage).toFixed(1) : null),
      lightLux: isOnline && (telem.light_lux != null || telem.light_intensity != null)
        ? Number(telem.light_lux ?? telem.light_intensity).toFixed(0)
        : null,
      rainDetected: isOnline ? Boolean(telem.rain_detected || telem.rain_sensor) : false,
      bluetoothConnected: isOnline ? Boolean(telem.bluetooth_connected || telem.ble_connected) : false
    });
  };

  const fetchDeviceStatus = async () => {
    try {
      const res = await fetch('/api/v1/devices/status');
      if (res.ok) {
        const devices = await res.json();
        if (Array.isArray(devices) && devices.length > 0) {
          const dev = devices.find(d => d && d.status === "online") || devices[0];
          const telem = (dev && dev.latest_telemetry) ? dev.latest_telemetry : {};
          processDeviceTelemetry(dev, telem);
        }
      }
    } catch (err) {
      console.warn("Device status fetch error:", err);
    }
  };

  // Real-time WebSocket sensor update sync
  useEffect(() => {
    if (lastTelemetry || Object.keys(deviceStatusMap).length > 0) {
      const devIds = Object.keys(deviceStatusMap);
      if (devIds.length > 0) {
        const dev = deviceStatusMap[devIds[0]];
        const telem = lastTelemetry && lastTelemetry.device_id === devIds[0] ? (lastTelemetry.telemetry || {}) : (dev.latest_telemetry || {});
        processDeviceTelemetry(dev, telem);
      } else if (lastTelemetry) {
        const telem = lastTelemetry.telemetry || lastTelemetry;
        processDeviceTelemetry({ status: "online", device_id: lastTelemetry.device_id }, telem);
      }
    }
  }, [lastTelemetry, deviceStatusMap]);

  // STEP 5 - FALLBACK: Adaptive REST polling only when WebSocket is offline/reconnecting
  useEffect(() => {
    fetchDeviceStatus();
    if (connectionStatus !== 'connected') {
      const interval = setInterval(fetchDeviceStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  const isOnline = deviceData.status === "online";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto w-full pb-12"
    >
      {/* Title Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            IoT Hardware &amp; 7-Sensor Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time status monitoring for ESP32 Field Transceiver Nodes, 6 Status LEDs &amp; MicroSD Queue.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDeviceStatus} leftIcon={<RefreshCcw className="w-4 h-4" />} className="w-full sm:w-auto">
          Poll Hardware
        </Button>
      </div>

      {/* Main Node Card */}
      <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{deviceData.name}</h2>
                <Badge variant={isOnline ? "healthy" : "diseased"}>
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                MCU: ESP32 DevKit V1 • Firmware: {deviceData.firmware} • Last Ping: {deviceData.lastSync}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-500" /> RSSI: {deviceData.wifiStrength} dBm
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Uptime: {deviceData.uptime}
            </span>
          </div>
        </div>

        {/* Telemetry Gauge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>Battery ({deviceData.batteryVoltage}V)</span>
              <Battery className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{deviceData.battery}%</p>
            <Progress value={deviceData.battery} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>MicroSD Storage</span>
              <HardDrive className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {deviceData.sdCard.status === "mounted"
                ? deviceData.sdCard.totalMb > 0
                  ? `${(deviceData.sdCard.totalMb - deviceData.sdCard.usageMb).toLocaleString()} MB Free`
                  : 'Mounted'
                : 'Not Mounted'}
            </p>
            <Progress value={deviceData.sdCard.status === "mounted" && deviceData.sdCard.totalMb > 0
              ? Math.round((deviceData.sdCard.usageMb / deviceData.sdCard.totalMb) * 100)
              : 0} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>ESP32 CPU Load</span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{deviceData.cpu}%</p>
            <Progress value={deviceData.cpu} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>All 7 Sensors Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{deviceData.sensorHealth}</p>
            <span className="text-[10px] text-slate-400 font-semibold block">{deviceData.sensorHealthSub}</span>
          </div>
        </div>

        {/* Hardware Status LEDs Widget */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            ESP32 Physical Status LEDs (6 Status Indicators)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className="w-3 h-3 rounded-full bg-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-200">LED 1: White</span>
              <span className="text-[9px] text-slate-400">Heartbeat (GPIO 2)</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-600"}`}></span>
              <span className="text-[11px] font-bold text-slate-200">LED 2: Green</span>
              <span className="text-[9px] text-slate-400">Wi-Fi (50% Dim GPIO 15)</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className={`w-3 h-3 rounded-full ${deviceData.bluetoothConnected ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "bg-slate-600"}`}></span>
              <span className="text-[11px] font-bold text-slate-200">LED 3: Blue</span>
              <span className="text-[9px] text-slate-400">Bluetooth (50% Dim GPIO 4)</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
              <span className="text-[11px] font-bold text-slate-200">LED 4: Yellow</span>
              <span className="text-[9px] text-slate-400">Telemetry Tx (GPIO 12)</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></span>
              <span className="text-[11px] font-bold text-slate-200">LED 5: Orange</span>
              <span className="text-[9px] text-slate-400">Push Button (GPIO 25)</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className={`w-3 h-3 rounded-full ${deviceData.batteryLow ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-ping" : "bg-slate-600"}`}></span>
              <span className="text-[11px] font-bold text-slate-200">LED 6: RED Alert</span>
              <span className="text-[9px] text-slate-400">Fault Warning (GPIO 26)</span>
            </div>
          </div>
        </div>

        {/* Connected Hardware Devices & 7 Sensors Status Grid */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Connected Physical Devices & Sensor Modules (Live Hardware Connection)
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Link Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {/* Sensor 1: AHT20 Temp & Humidity */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${deviceData.temperature != null ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">AHT20 Temp/Hum</span>
              <span className="text-[9px] text-slate-400">I2C (0x38)</span>
              <span className={`text-[10px] font-bold ${deviceData.temperature != null ? "text-emerald-400" : "text-red-400"}`}>
                {deviceData.temperature != null ? `${deviceData.temperature}°C` : "DISCONNECTED"}
              </span>
            </div>

            {/* Sensor 2: BH1750 Sunlight Sensor */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${deviceData.lightLux != null ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">BH1750 Light</span>
              <span className="text-[9px] text-slate-400">I2C (0x23)</span>
              <span className={`text-[10px] font-bold ${deviceData.lightLux != null ? "text-emerald-400" : "text-red-400"}`}>
                {deviceData.lightLux != null ? `${deviceData.lightLux} Lux` : "DISCONNECTED"}
              </span>
            </div>

            {/* Sensor 3: BMP280 Barometer */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${deviceData.pressure != null ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">BMP280 Barometer</span>
              <span className="text-[9px] text-slate-400">I2C (0x76)</span>
              <span className={`text-[10px] font-bold ${deviceData.pressure != null ? "text-emerald-400" : "text-red-400"}`}>
                {deviceData.pressure != null ? `${deviceData.pressure} hPa` : "DISCONNECTED"}
              </span>
            </div>

            {/* Sensor 4: Capacitive Soil Moisture */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${deviceData.soilMoisture != null ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">Soil Moisture</span>
              <span className="text-[9px] text-slate-400">GPIO 34 ADC</span>
              <span className={`text-[10px] font-bold ${deviceData.soilMoisture != null ? "text-emerald-400" : "text-red-400"}`}>
                {deviceData.soilMoisture != null ? `${deviceData.soilMoisture}%` : "DISCONNECTED"}
              </span>
            </div>

            {/* Sensor 5: Rain Sensor Module */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${isOnline ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">Rain Sensor</span>
              <span className="text-[9px] text-slate-400">GPIO 35/33</span>
              <span className="text-[10px] font-bold text-emerald-400">
                {deviceData.rainDetected ? "RAIN DETECTED" : "NO RAIN"}
              </span>
            </div>

            {/* Sensor 6: 18650 Battery Monitor */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${isOnline && deviceData.battery > 0 ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">Battery Monitor</span>
              <span className="text-[9px] text-slate-400">GPIO 32 ADC</span>
              <span className={`text-[10px] font-bold ${isOnline && deviceData.battery > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {isOnline && deviceData.battery > 0 ? `${deviceData.batteryVoltage}V (${deviceData.battery}%)` : "DISCONNECTED"}
              </span>
            </div>

            {/* Sensor 7: MicroSD Storage Module */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-1.5">
              <span className={`w-3.5 h-3.5 rounded-full ${deviceData.sdCard.status === "mounted" ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"}`}></span>
              <span className="text-[11px] font-extrabold text-slate-100">MicroSD Module</span>
              <span className="text-[9px] text-slate-400">GPIO 5 SPI</span>
              <span className={`text-[10px] font-bold ${deviceData.sdCard.status === "mounted" ? "text-emerald-400" : "text-red-400"}`}>
                {deviceData.sdCard.status === "mounted" ? "MOUNTED" : "UNMOUNTED"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DevicesPage;
