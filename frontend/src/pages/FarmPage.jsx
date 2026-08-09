import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, MapPin, Droplets, Cpu, Bell, Save, Navigation, 
  Check, AlertCircle, RefreshCw, ShieldCheck, Thermometer, Radio, Archive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { Card, Button, Input, Select, Switch, Badge } from '../components/ui/index';
import API from '../services/api';
import { INDIA_STATES, getDistricts, getMandals, getVillages } from '../data/indiaLocations';

const FarmPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { activeFarm, farms, archivedFarms, createFarm, updateFarm: saveFarmEdit, deleteFarm, unarchiveFarm } = useFarm();
  
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  // Farm Info
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [farmUnit, setFarmUnit] = useState('acres');
  const [fieldsCount, setFieldsCount] = useState(1);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [irrigationMethod, setIrrigationMethod] = useState('Manual');
  const [waterSource, setWaterSource] = useState('Rain Water');

  // Derived cascading options
  const availableDistricts = getDistricts(state);
  const availableMandals = getMandals(state, district);
  const availableVillages = getVillages(state, district, mandal);
  const [customVillage, setCustomVillage] = useState(false);

  // Crop Management
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [plantingDate, setPlantingDate] = useState('');

  // IoT Hardware
  const [deviceId, setDeviceId] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [firmwareVersion, setFirmwareVersion] = useState('v2.5.0');

  // Alert Preferences
  const [notifications, setNotifications] = useState({
    disease: true,
    rain: true,
    battery: true,
    deviceOffline: true,
    irrigation: true,
    recommendation: true
  });

  useEffect(() => {
    if (activeFarm) {
      setFarmName(activeFarm.farm_name || '');
      setFarmSize(activeFarm.farm_size || '');
      setFarmUnit(activeFarm.farm_unit || 'acres');
      setFieldsCount(activeFarm.fields_count || 1);
      setCropName(activeFarm.crop_name || '');
      setCropVariety(activeFarm.crop_variety || '');
      setGrowthStage(activeFarm.growth_stage || 'Vegetative');
      setPlantingDate(activeFarm.planting_date || '');
      setState(activeFarm.state || '');
      setDistrict(activeFarm.district || '');
      setMandal(activeFarm.mandal || '');
      setVillage(activeFarm.village || '');
      setLatitude(activeFarm.latitude !== undefined && activeFarm.latitude !== null ? activeFarm.latitude.toString() : '');
      setLongitude(activeFarm.longitude !== undefined && activeFarm.longitude !== null ? activeFarm.longitude.toString() : '');
      setIrrigationMethod(activeFarm.irrigation_method || 'Manual');
      setWaterSource(activeFarm.water_source || 'Rain Water');
      setDeviceId(activeFarm.device_id || '');
    }
  }, [activeFarm]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await API.get('/api/v1/devices/status');
        setAvailableDevices(res.data || []);
      } catch (err) {
        console.warn("Failed to fetch available devices:", err);
      }
    };
    fetchDevices();
  }, []);

  const handleFetchGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        setLatitude(lat);
        setLongitude(lon);
        setGeoLoading(false);
        setToastMsg(`Live coordinates detected: ${lat}°N, ${lon}°E`);
      },
      (err) => {
        console.warn(err);
        setGeoLoading(false);
        setErrorMsg('Unable to retrieve location. Please grant location permission.');
      },
      { timeout: 8000 }
    );
  };

  const handleSaveFarm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setToastMsg('');

    try {
      const payload = {
        farm_name: farmName.trim() || 'My Farm Sector',
        farm_size: parseFloat(farmSize) > 0 ? parseFloat(farmSize) : 1.0,
        farm_unit: farmUnit || 'acres',
        number_of_fields: parseInt(fieldsCount) || 1,
        crop_name: cropName || 'Tomato',
        crop_variety: cropVariety || 'Standard',
        growth_stage: growthStage || 'Vegetative',
        planting_date: plantingDate || new Date().toISOString().split('T')[0],
        state: state || 'Andhra Pradesh',
        district: district || 'Anantapur',
        mandal: mandal || '',
        village: village || 'Sector 1',
        latitude: latitude ? parseFloat(latitude) : 16.5062,
        longitude: longitude ? parseFloat(longitude) : 80.6480,
        irrigation_method: irrigationMethod || 'Manual',
        water_source: waterSource || 'Rain Water',
        device_id: deviceId || ''
      };

      if (activeFarm && activeFarm.id) {
        await saveFarmEdit(activeFarm.id, payload);
      } else {
        await createFarm(payload);
      }

      setToastMsg('Farm & Agronomic details saved successfully!');
    } catch (err) {
      console.error("Save farm error:", err);
      let msg = 'Failed to save farm details.';
      if (typeof err.response?.data?.detail === 'string') {
        msg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail)) {
        msg = err.response.data.detail.map(d => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join('; ');
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'info', label: 'Farm Information & Location', icon: MapPin },
    { id: 'crop', label: 'Crop Management', icon: Droplets },
    { id: 'iot', label: 'IoT Hardware Nodes', icon: Cpu },
    { id: 'alerts', label: 'Alert Preferences', icon: Bell },
    { id: 'archived', label: 'Archived Sectors', icon: Archive }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto w-full pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              My Farm & Operations
            </h1>
            <div className="mt-1">
              <Badge variant="healthy">
                {activeFarm ? activeFarm.farm_name : 'Default Farm Sector'}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button 
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await createFarm({ farm_name: `New Farm Sector ${farms.length + 1}` });
                } catch (e) { console.error(e); }
              }} 
              isLoading={loading} 
              className="w-full sm:w-auto border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              + Add New Field
            </Button>
            <Button onClick={handleSaveFarm} isLoading={loading} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
              Save All Changes
            </Button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure your farm sector coordinates, crop growth stages, paired ESP32 IoT hardware nodes, and operational notification rules.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs Navigation Bar — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveFarm} className="space-y-6">
        {/* Tab 1: Farm Information & Location */}
        {activeTab === 'info' && (
          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Farm Sector & GPS Coordinates</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Set registered farm sector details and precise latitude/longitude coordinates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Farm Sector Name"
                placeholder="e.g. Green Acre Tomato Sector"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Total Farm Area"
                  type="number"
                  placeholder="e.g. 2.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                />
                <Select
                  label="Area Unit"
                  value={farmUnit}
                  onChange={(e) => setFarmUnit(e.target.value)}
                  options={[
                    { value: 'acres', label: 'Acres' },
                    { value: 'hectares', label: 'Hectares' },
                    { value: 'cents', label: 'Cents' }
                  ]}
                />
              </div>
            </div>

            {/* ── India Location Selector — State → District → Mandal → Village ── */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Farm Location (India)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 ml-1">— Helps match government schemes for your area</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">State / UT <span className="text-rose-500">*</span></label>
                  <select
                    value={state}
                    onChange={(e) => { setState(e.target.value); setDistrict(''); setMandal(''); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">-- Select State / UT --</option>
                    {INDIA_STATES.map(s => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">District <span className="text-rose-500">*</span></label>
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setMandal(''); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    disabled={!state}
                    required
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">{state ? '-- Select District --' : '-- Select State first --'}</option>
                    {availableDistricts.map(d => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Mandal / Taluka */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Mandal / Taluka</label>
                  <select
                    value={mandal}
                    onChange={(e) => { setMandal(e.target.value); setVillage(''); setCustomVillage(false); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    disabled={!district}
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">{district ? '-- Select Mandal --' : '-- Select District first --'}</option>
                    {availableMandals.map(m => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Village / Town — Always Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Village / Town</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    disabled={!mandal}
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">
                      {!mandal 
                        ? '-- Select Mandal first --' 
                        : availableVillages.length > 0 
                          ? '-- Select Village --' 
                          : '-- Select Village / Sector --'}
                    </option>
                    {availableVillages.map(v => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={v} value={v}>{v}</option>
                    ))}
                    {/* Common sector/village defaults if specific mandal data is pending */}
                    {availableVillages.length === 0 && mandal && (
                      <>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} Central Village`}>{mandal} Central Village</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} North Sector`}>{mandal} North Sector</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} South Sector`}>{mandal} South Sector</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} East Sector`}>{mandal} East Sector</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} West Sector`}>{mandal} West Sector</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Live Summary Badge */}
              {(state || district || mandal || village) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selected:</span>
                  {village && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-full">{village}</span>}
                  {mandal && <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-semibold rounded-full">{mandal}</span>}
                  {district && <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[11px] font-semibold rounded-full">{district}</span>}
                  {state && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-semibold rounded-full">{state}</span>}
                </div>
              )}
            </div>

            {/* GPS Coordinates Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">GPS Location Coordinates</span>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFetchGeolocation}
                  isLoading={geoLoading}
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                >
                  Auto-Detect Live GPS
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Latitude (°N)"
                  placeholder="e.g. 16.5062"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <Input
                  label="Longitude (°E)"
                  placeholder="e.g. 80.6480"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Irrigation Method"
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value)}
                options={[
                  { value: 'Drip', label: 'Drip Irrigation' },
                  { value: 'Sprinkler', label: 'Sprinkler System' },
                  { value: 'Flood', label: 'Flood / Furrow' },
                  { value: 'Manual', label: 'Manual Watering' }
                ]}
              />
              <Select
                label="Water Source"
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                options={[
                  { value: 'Borewell', label: 'Borewell' },
                  { value: 'Canal', label: 'Canal' },
                  { value: 'Rain Water', label: 'Rain Water Tank' },
                  { value: 'River', label: 'River / Reservoir' }
                ]}
              />
            </div>

            <div className="pt-6 border-t border-rose-200/50 dark:border-rose-900/30 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                <div>
                  <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Archive Sector</h3>
                  <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">Archive this farm sector to hide it from your dashboard while securely storing its historical telemetry data for future reference.</p>
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to archive this farm? It will be hidden from your dashboard but its history will be preserved.")) {
                      try {
                        await deleteFarm(activeFarm.id);
                        navigate('/');
                      } catch(e) { console.error(e); }
                    }
                  }}
                  className="w-full sm:w-auto border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                >
                  Archive Farm Sector
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Crop Management */}
        {activeTab === 'crop' && (
          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Crop Cultivation & Lifecycle</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Specify active crop type, variety, and growth stage for AI agronomic recommendations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Primary Crop"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                options={[
                  { value: 'Tomato', label: '🍅 Tomato (Solanum lycopersicum)' },
                  { value: 'Potato', label: '🥔 Potato (Solanum tuberosum)' },
                  { value: 'Corn', label: '🌽 Maize / Corn (Zea mays)' },
                  { value: 'Rice', label: '🌾 Paddy / Rice (Oryza sativa)' },
                  { value: 'Wheat', label: '🌾 Wheat (Triticum aestivum)' },
                  { value: 'Cotton', label: '🧶 Cotton (Gossypium)' },
                  { value: 'Chilli', label: '🌶️ Chilli Pepper (Capsicum annum)' },
                  { value: 'Sugarcane', label: '🎋 Sugarcane (Saccharum officinarum)' },
                  { value: 'Soybean', label: '🫘 Soybean / Pulses (Glycine max)' },
                  { value: 'Onion', label: '🧅 Onion (Allium cepa)' },
                  { value: 'Grape', label: '🍇 Grape (Vitis vinifera)' },
                  { value: 'Apple', label: '🍎 Apple (Malus domestica)' },
                  { value: 'Mango', label: '🥭 Mango (Mangifera indica)' },
                  { value: 'Banana', label: '🍌 Banana (Musa acuminata)' },
                  { value: 'Citrus', label: '🍊 Citrus / Orange (Citrus sinensis)' },
                  { value: 'Strawberry', label: '🍓 Strawberry (Fragaria × ananassa)' },
                  { value: 'Peach', label: '🍑 Peach (Prunus persica)' },
                  { value: 'Cucumber', label: '🥒 Cucumber / Squash (Cucumis sativus)' }
                ]}
              />

              <Input
                label="Crop Variety / Hybrid"
                placeholder="e.g. Arka Rakshak / Hybrid 88"
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
              />

              <Select
                label="Current Growth Stage"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                options={[
                  { value: 'Nursery', label: 'Nursery / Seedling' },
                  { value: 'Vegetative', label: 'Vegetative Growth' },
                  { value: 'Flowering', label: 'Flowering & Budding' },
                  { value: 'Fruiting', label: 'Fruiting & Maturation' },
                  { value: 'Harvesting', label: 'Harvesting Phase' }
                ]}
              />

              <Input
                label="Planting / Sowing Date"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
              />
            </div>
          </Card>
        )}

        {/* Tab 3: IoT Hardware */}
        {activeTab === 'iot' && (
          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Paired ESP32 Field Node</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Link your physical AgriShield ESP32 hardware unit to stream live sensor telemetry.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ESP32 Device Node ID</label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">-- Select a Paired Device --</option>
                  {availableDevices.map(dev => (
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={dev.device_id} value={dev.device_id}>
                      {dev.device_id} ({dev.status})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Firmware Version"
                value={firmwareVersion}
                disabled
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className={`w-5 h-5 ${deviceId ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Telemetry Transceiver Status</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {deviceId ? `Node [${deviceId}] active & posting 10s JSON telemetry` : 'No hardware device linked'}
                  </span>
                </div>
              </div>
              <Badge variant={deviceId ? 'healthy' : 'warning'}>
                {deviceId ? 'Paired' : 'Unlinked'}
              </Badge>
            </div>
          </Card>
        )}

        {/* Tab 4: Alert Preferences */}
        {activeTab === 'alerts' && (
          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Agronomic Alert Rules</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure automated notification alerts for disease outbreaks, low soil moisture, and hardware faults.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Fungal & Disease Outbreak Warnings</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Notify when high humidity/temp triggers spore infection risk</span>
                </div>
                <Switch 
                  checked={notifications.disease} 
                  onCheckedChange={(val) => setNotifications(prev => ({ ...prev, disease: val }))} 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Critical Soil Moisture & Irrigation Alerts</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Trigger warnings when soil moisture drops below 30% threshold</span>
                </div>
                <Switch 
                  checked={notifications.irrigation} 
                  onCheckedChange={(val) => setNotifications(prev => ({ ...prev, irrigation: val }))} 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Heavy Rainfall & Storm Advisories</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Alert before rain forecast so pesticide spraying can be delayed</span>
                </div>
                <Switch 
                  checked={notifications.rain} 
                  onCheckedChange={(val) => setNotifications(prev => ({ ...prev, rain: val }))} 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Hardware Fault & Low Battery Alarms</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive instant push notification if ESP32 node goes offline or battery critical</span>
                </div>
                <Switch 
                  checked={notifications.battery} 
                  onCheckedChange={(val) => setNotifications(prev => ({ ...prev, battery: val }))} 
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 5: Archived Sectors */}
        {activeTab === 'archived' && (
          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Archived Sectors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">View and restore past farm sectors and their historical telemetry.</p>
              </div>
            </div>

            {archivedFarms.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Archived Farms</h3>
                <p className="text-xs text-slate-500 mt-1">You haven't archived any farm sectors yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedFarms.map((farm) => (
                  <div key={farm.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-emerald-500/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{farm.farm_name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {farm.crop_name} • {farm.farm_size} {farm.farm_unit} • {farm.village}
                      </p>
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await unarchiveFarm(farm.id);
                          setActiveTab('info');
                        } catch(e) { console.error(e); }
                      }}
                      className="shrink-0 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    >
                      Restore Sector
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={loading} size="lg" leftIcon={<Save className="w-5 h-5" />}>
            Save All Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default FarmPage;
