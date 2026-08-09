import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Save, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge } from '../components/ui/index';
import { INDIA_STATES, getDistricts, getMandals, getVillages } from '../data/indiaLocations';
import { useWebSocket } from '../context/WebSocketContext';
import LiveWeatherWidget from '../components/intelligence/LiveWeatherWidget';
import SprayAdvisorWidget from '../components/intelligence/SprayAdvisorWidget';
import FarmRoutineWidget from '../components/intelligence/FarmRoutineWidget';
import WidgetErrorBoundary from '../components/WidgetErrorBoundary';
import { Sparkles, Palette } from 'lucide-react';
import { useNavbarTheme } from '../hooks/useNavbarTheme';
import { useColorTheme } from '../hooks/useColorTheme';
import NavbarSceneRenderer from '../components/animations/NavbarSceneRenderer';

const ANIMATION_THEMES = [
  // 🚜 Precision Agriculture (1-10)
  { id: 'smart-tractor', name: 'Smart Tractor', category: '🚜 Precision Agriculture' },
  { id: 'agri-drone', name: 'Agri-Drone', category: '🚜 Precision Agriculture' },
  { id: 'greenhouse', name: 'Greenhouse', category: '🚜 Precision Agriculture' },
  { id: 'solar-panels', name: 'Solar Panels', category: '🚜 Precision Agriculture' },
  { id: 'wind-turbine', name: 'Wind Turbine', category: '🚜 Precision Agriculture' },
  { id: 'smart-sprinklers', name: 'Sprinklers', category: '🚜 Precision Agriculture' },
  { id: 'harvest-robot', name: 'Harvest Robot', category: '🚜 Precision Agriculture' },
  { id: 'conveyor-belt', name: 'Conveyor', category: '🚜 Precision Agriculture' },
  { id: 'crop-rows', name: 'Crop Rows', category: '🚜 Precision Agriculture' },
  { id: 'fence-patrol', name: 'Fence Patrol', category: '🚜 Precision Agriculture' },
  // 🌱 Crop Biology (11-20)
  { id: 'seed-sprouting', name: 'Sprouting', category: '🌱 Crop Biology' },
  { id: 'photosynthesis', name: 'Photosynthesis', category: '🌱 Crop Biology' },
  { id: 'chlorophyll-flow', name: 'Chlorophyll', category: '🌱 Crop Biology' },
  { id: 'roots-growing', name: 'Root System', category: '🌱 Crop Biology' },
  { id: 'wheat-field', name: 'Wheat Field', category: '🌱 Crop Biology' },
  { id: 'sunflower-track', name: 'Sunflower', category: '🌱 Crop Biology' },
  { id: 'fruit-ripening', name: 'Fruit Ripen', category: '🌱 Crop Biology' },
  { id: 'pollination', name: 'Pollination', category: '🌱 Crop Biology' },
  { id: 'leaf-unfurl', name: 'Leaf Unfurl', category: '🌱 Crop Biology' },
  { id: 'cell-division', name: 'Cell Division', category: '🌱 Crop Biology' },
  // 🔬 Disease Detection (21-30)
  { id: 'disease-scan', name: 'Disease Scan', category: '🔬 Disease Detection' },
  { id: 'spore-alert', name: 'Spore Alert', category: '🔬 Disease Detection' },
  { id: 'ai-diagnosis', name: 'AI Diagnosis', category: '🔬 Disease Detection' },
  { id: 'microscope-view', name: 'Microscope', category: '🔬 Disease Detection' },
  { id: 'health-spectrum', name: 'Health Meter', category: '🔬 Disease Detection' },
  { id: 'leaf-xray', name: 'Leaf X-Ray', category: '🔬 Disease Detection' },
  { id: 'pathogen-track', name: 'Pathogen Track', category: '🔬 Disease Detection' },
  { id: 'confidence-meter', name: 'Confidence', category: '🔬 Disease Detection' },
  { id: 'image-classify', name: 'Classifier', category: '🔬 Disease Detection' },
  { id: 'model-training', name: 'Model Train', category: '🔬 Disease Detection' },
  // 🌦️ Weather (31-40)
  { id: 'gentle-rain', name: 'Gentle Rain', category: '🌦️ Weather & Climate' },
  { id: 'heavy-storm', name: 'Thunderstorm', category: '🌦️ Weather & Climate' },
  { id: 'snowfall', name: 'Snowfall', category: '🌦️ Weather & Climate' },
  { id: 'misty-morning', name: 'Misty Morning', category: '🌦️ Weather & Climate' },
  { id: 'golden-sunrise', name: 'Sunrise', category: '🌦️ Weather & Climate' },
  { id: 'purple-sunset', name: 'Sunset', category: '🌦️ Weather & Climate' },
  { id: 'heatwave', name: 'Heatwave', category: '🌦️ Weather & Climate' },
  { id: 'rainbow-arc', name: 'Rainbow', category: '🌦️ Weather & Climate' },
  { id: 'wind-gusts', name: 'Wind Gusts', category: '🌦️ Weather & Climate' },
  { id: 'cloud-drift', name: 'Cloud Drift', category: '🌦️ Weather & Climate' },
  // 🟤 Soil & Earth (41-50)
  { id: 'soil-layers', name: 'Soil Layers', category: '🟤 Soil & Earth' },
  { id: 'moisture-gradient', name: 'Moisture', category: '🟤 Soil & Earth' },
  { id: 'mineral-crystals', name: 'Minerals', category: '🟤 Soil & Earth' },
  { id: 'earthworm-tunnel', name: 'Earthworm', category: '🟤 Soil & Earth' },
  { id: 'erosion-flow', name: 'Erosion', category: '🟤 Soil & Earth' },
  { id: 'compost-cycle', name: 'Compost', category: '🟤 Soil & Earth' },
  { id: 'topo-contours', name: 'Topography', category: '🟤 Soil & Earth' },
  { id: 'volcanic-soil', name: 'Volcanic', category: '🟤 Soil & Earth' },
  { id: 'desert-dunes', name: 'Desert Dunes', category: '🟤 Soil & Earth' },
  { id: 'permafrost-thaw', name: 'Permafrost', category: '🟤 Soil & Earth' },
  // 📡 IoT & Hardware (51-60)
  { id: 'esp32-pulse', name: 'ESP32 Pulse', category: '📡 IoT & Hardware' },
  { id: 'sensor-array', name: 'Sensor Array', category: '📡 IoT & Hardware' },
  { id: 'bluetooth-pair', name: 'Bluetooth', category: '📡 IoT & Hardware' },
  { id: 'wifi-broadcast', name: 'WiFi Signal', category: '📡 IoT & Hardware' },
  { id: 'ota-update', name: 'OTA Update', category: '📡 IoT & Hardware' },
  { id: 'telemetry-feed', name: 'Telemetry', category: '📡 IoT & Hardware' },
  { id: 'battery-charge', name: 'Battery', category: '📡 IoT & Hardware' },
  { id: 'circuit-board', name: 'Circuit Board', category: '📡 IoT & Hardware' },
  { id: 'gateway-node', name: 'Gateway Hub', category: '📡 IoT & Hardware' },
  { id: 'edge-compute', name: 'Edge Compute', category: '📡 IoT & Hardware' },
  // 💧 Water & Irrigation (61-70)
  { id: 'drip-irrigation', name: 'Drip System', category: '💧 Water & Irrigation' },
  { id: 'river-flow', name: 'River Flow', category: '💧 Water & Irrigation' },
  { id: 'water-pump', name: 'Water Pump', category: '💧 Water & Irrigation' },
  { id: 'hydroponic-system', name: 'Hydroponics', category: '💧 Water & Irrigation' },
  { id: 'reservoir-fill', name: 'Reservoir', category: '💧 Water & Irrigation' },
  { id: 'canal-network', name: 'Canal Network', category: '💧 Water & Irrigation' },
  { id: 'rain-harvest', name: 'Rain Harvest', category: '💧 Water & Irrigation' },
  { id: 'flood-warning', name: 'Flood Warning', category: '💧 Water & Irrigation' },
  { id: 'water-quality', name: 'Water Quality', category: '💧 Water & Irrigation' },
  { id: 'fogponics', name: 'Fogponics', category: '💧 Water & Irrigation' },
  // 🦋 Nature & Ecosystem (71-80)
  { id: 'butterfly-garden', name: 'Butterflies', category: '🦋 Nature & Ecosystem' },
  { id: 'honeybee-hive', name: 'Honeybees', category: '🦋 Nature & Ecosystem' },
  { id: 'bird-migration', name: 'Bird Flight', category: '🦋 Nature & Ecosystem' },
  { id: 'firefly-night', name: 'Fireflies', category: '🦋 Nature & Ecosystem' },
  { id: 'frog-pond', name: 'Frog Pond', category: '🦋 Nature & Ecosystem' },
  { id: 'ladybug-patrol', name: 'Ladybug', category: '🦋 Nature & Ecosystem' },
  { id: 'spider-web', name: 'Spider Web', category: '🦋 Nature & Ecosystem' },
  { id: 'bamboo-forest', name: 'Bamboo', category: '🦋 Nature & Ecosystem' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', category: '🦋 Nature & Ecosystem' },
  { id: 'coral-reef', name: 'Coral Reef', category: '🦋 Nature & Ecosystem' },
  // 📊 Data Visualization (81-90)
  { id: 'neural-network', name: 'Neural Net', category: '📊 Data & Analytics' },
  { id: 'yield-chart', name: 'Yield Chart', category: '📊 Data & Analytics' },
  { id: 'data-stream', name: 'Data Stream', category: '📊 Data & Analytics' },
  { id: 'radar-sweep', name: 'Radar Sweep', category: '📊 Data & Analytics' },
  { id: 'biometric-pulse', name: 'Biometric', category: '📊 Data & Analytics' },
  { id: 'pie-chart', name: 'Pie Chart', category: '📊 Data & Analytics' },
  { id: 'bar-graph', name: 'Bar Graph', category: '📊 Data & Analytics' },
  { id: 'scatter-plot', name: 'Scatter Plot', category: '📊 Data & Analytics' },
  { id: 'heatmap-grid', name: 'Heatmap', category: '📊 Data & Analytics' },
  { id: 'flow-diagram', name: 'Data Flow', category: '📊 Data & Analytics' },
  // ✨ Premium Abstract (91-100)
  { id: 'aurora-borealis', name: 'Aurora', category: '✨ Premium Abstract' },
  { id: 'liquid-chrome', name: 'Liquid Chrome', category: '✨ Premium Abstract' },
  { id: 'glass-orbs', name: 'Glass Orbs', category: '✨ Premium Abstract' },
  { id: 'deep-space', name: 'Deep Space', category: '✨ Premium Abstract' },
  { id: 'abyssal-blue', name: 'Abyssal Blue', category: '✨ Premium Abstract' },
  { id: 'neon-edge', name: 'Neon Edge', category: '✨ Premium Abstract' },
  { id: 'carbon-fiber', name: 'Carbon Fiber', category: '✨ Premium Abstract' },
  { id: 'vercel-dark', name: 'Vercel Dark', category: '✨ Premium Abstract' },
  { id: 'hyper-speed', name: 'Hyper-Speed', category: '✨ Premium Abstract' },
  { id: 'sonic-wave', name: 'Sonic Wave', category: '✨ Premium Abstract' },
  // 🎭 Role-Based Welcome (101-103)
  { id: 'welcome-farmer', name: '👨‍🌾 Welcome Farmer', category: '🎭 Welcome' },
  { id: 'welcome-admin', name: '🛡️ Welcome Admin', category: '🎭 Welcome' },
  { id: 'welcome-tester', name: '🔧 Welcome Tester', category: '🎭 Welcome' },
  // Phase 2 Expansion (104-203)
  { id: 'pa-11', name: 'Auto Steer', category: '🚜 Precision Agriculture' },
  { id: 'pa-12', name: 'Drone Swarm', category: '🚜 Precision Agriculture' },
  { id: 'pa-13', name: 'Smart Silo', category: '🚜 Precision Agriculture' },
  { id: 'pa-14', name: 'Agri Bot V2', category: '🚜 Precision Agriculture' },
  { id: 'pa-15', name: 'Lidar Scan', category: '🚜 Precision Agriculture' },
  { id: 'pa-16', name: 'GPS Track', category: '🚜 Precision Agriculture' },
  { id: 'pa-17', name: 'Auto Harvester', category: '🚜 Precision Agriculture' },
  { id: 'pa-18', name: 'Robo Weed', category: '🚜 Precision Agriculture' },
  { id: 'pa-19', name: 'Laser Level', category: '🚜 Precision Agriculture' },
  { id: 'pa-20', name: 'Yield Monitor', category: '🚜 Precision Agriculture' },
  { id: 'cb-11', name: 'Gene Edit', category: '🌱 Crop Biology' },
  { id: 'cb-12', name: 'DNA Helix', category: '🌱 Crop Biology' },
  { id: 'cb-13', name: 'Mito Flow', category: '🌱 Crop Biology' },
  { id: 'cb-14', name: 'Plant Cell', category: '🌱 Crop Biology' },
  { id: 'cb-15', name: 'Stomata Open', category: '🌱 Crop Biology' },
  { id: 'cb-16', name: 'Root Hair', category: '🌱 Crop Biology' },
  { id: 'cb-17', name: 'Stem Xylem', category: '🌱 Crop Biology' },
  { id: 'cb-18', name: 'Flower Bloom', category: '🌱 Crop Biology' },
  { id: 'cb-19', name: 'Fruit Set', category: '🌱 Crop Biology' },
  { id: 'cb-20', name: 'Seed Pod', category: '🌱 Crop Biology' },
  { id: 'dd-11', name: 'Virus Trace', category: '🔬 Disease Detection' },
  { id: 'dd-12', name: 'Bacteria Scan', category: '🔬 Disease Detection' },
  { id: 'dd-13', name: 'Fungi Spores', category: '🔬 Disease Detection' },
  { id: 'dd-14', name: 'Nematode Alert', category: '🔬 Disease Detection' },
  { id: 'dd-15', name: 'Blight Zone', category: '🔬 Disease Detection' },
  { id: 'dd-16', name: 'Rust Alert', category: '🔬 Disease Detection' },
  { id: 'dd-17', name: 'Mildew Scan', category: '🔬 Disease Detection' },
  { id: 'dd-18', name: 'Lesion Detect', category: '🔬 Disease Detection' },
  { id: 'dd-19', name: 'Spectral Scan', category: '🔬 Disease Detection' },
  { id: 'dd-20', name: 'Bio Assay', category: '🔬 Disease Detection' },
  { id: 'wc-11', name: 'Tornado', category: '🌦️ Weather & Climate' },
  { id: 'wc-12', name: 'Hailstorm', category: '🌦️ Weather & Climate' },
  { id: 'wc-13', name: 'Frost Warning', category: '🌦️ Weather & Climate' },
  { id: 'wc-14', name: 'Dew Drop', category: '🌦️ Weather & Climate' },
  { id: 'wc-15', name: 'Monsoon Rain', category: '🌦️ Weather & Climate' },
  { id: 'wc-16', name: 'Drought Heat', category: '🌦️ Weather & Climate' },
  { id: 'wc-17', name: 'Microclimate', category: '🌦️ Weather & Climate' },
  { id: 'wc-18', name: 'Barometer', category: '🌦️ Weather & Climate' },
  { id: 'wc-19', name: 'Wind Rose', category: '🌦️ Weather & Climate' },
  { id: 'wc-20', name: 'Ozone Layer', category: '🌦️ Weather & Climate' },
  { id: 'se-11', name: 'Nitrogen Fix', category: '🟤 Soil & Earth' },
  { id: 'se-12', name: 'Phosphorus', category: '🟤 Soil & Earth' },
  { id: 'se-13', name: 'Potassium', category: '🟤 Soil & Earth' },
  { id: 'se-14', name: 'Microbiome', category: '🟤 Soil & Earth' },
  { id: 'se-15', name: 'Mycorrhizae', category: '🟤 Soil & Earth' },
  { id: 'se-16', name: 'Humus Layer', category: '🟤 Soil & Earth' },
  { id: 'se-17', name: 'Clay Particles', category: '🟤 Soil & Earth' },
  { id: 'se-18', name: 'Silt Flow', category: '🟤 Soil & Earth' },
  { id: 'se-19', name: 'Sand Texture', category: '🟤 Soil & Earth' },
  { id: 'se-20', name: 'Bedrock', category: '🟤 Soil & Earth' },
  { id: 'ih-11', name: 'Lora Node', category: '📡 IoT & Hardware' },
  { id: 'ih-12', name: 'Sigfox Hub', category: '📡 IoT & Hardware' },
  { id: 'ih-13', name: 'NB-IoT', category: '📡 IoT & Hardware' },
  { id: 'ih-14', name: '5G Farm', category: '📡 IoT & Hardware' },
  { id: 'ih-15', name: 'RFID Tag', category: '📡 IoT & Hardware' },
  { id: 'ih-16', name: 'Camera Feed', category: '📡 IoT & Hardware' },
  { id: 'ih-17', name: 'Thermistor', category: '📡 IoT & Hardware' },
  { id: 'ih-18', name: 'Strain Gauge', category: '📡 IoT & Hardware' },
  { id: 'ih-19', name: 'Actuator', category: '📡 IoT & Hardware' },
  { id: 'ih-20', name: 'Solar Battery', category: '📡 IoT & Hardware' },
  { id: 'wi-11', name: 'Aquifer', category: '💧 Water & Irrigation' },
  { id: 'wi-12', name: 'Center Pivot', category: '💧 Water & Irrigation' },
  { id: 'wi-13', name: 'Micro Sprinkler', category: '💧 Water & Irrigation' },
  { id: 'wi-14', name: 'Furrow Flow', category: '💧 Water & Irrigation' },
  { id: 'wi-15', name: 'Flood Gate', category: '💧 Water & Irrigation' },
  { id: 'wi-16', name: 'Dam Release', category: '💧 Water & Irrigation' },
  { id: 'wi-17', name: 'Evapo Rate', category: '💧 Water & Irrigation' },
  { id: 'wi-18', name: 'Soil Tension', category: '💧 Water & Irrigation' },
  { id: 'wi-19', name: 'Pipe Pressure', category: '💧 Water & Irrigation' },
  { id: 'wi-20', name: 'Filter Wash', category: '💧 Water & Irrigation' },
  { id: 'ne-11', name: 'Bat Flight', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-12', name: 'Moth Hover', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-13', name: 'Earthworm Crawl', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-14', name: 'Snail Pace', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-15', name: 'Ant Colony', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-16', name: 'Aphid Cluster', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-17', name: 'Predator Wasp', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-18', name: 'Praying Mantis', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-19', name: 'Owl Night', category: '🦋 Nature & Ecosystem' },
  { id: 'ne-20', name: 'Fox Patrol', category: '🦋 Nature & Ecosystem' },
  { id: 'dv-11', name: '3D Surface', category: '📊 Data & Analytics' },
  { id: 'dv-12', name: 'Bubble Chart', category: '📊 Data & Analytics' },
  { id: 'dv-13', name: 'Line Trend', category: '📊 Data & Analytics' },
  { id: 'dv-14', name: 'Box Plot', category: '📊 Data & Analytics' },
  { id: 'dv-15', name: 'Violin Plot', category: '📊 Data & Analytics' },
  { id: 'dv-16', name: 'Area Graph', category: '📊 Data & Analytics' },
  { id: 'dv-17', name: 'Funnel Data', category: '📊 Data & Analytics' },
  { id: 'dv-18', name: 'Gauge Meter', category: '📊 Data & Analytics' },
  { id: 'dv-19', name: 'Kpi Board', category: '📊 Data & Analytics' },
  { id: 'dv-20', name: 'Node Graph', category: '📊 Data & Analytics' },
  { id: 'pa2-11', name: 'Quantum Fluct', category: '✨ Premium Abstract' },
  { id: 'pa2-12', name: 'Neon Grid', category: '✨ Premium Abstract' },
  { id: 'pa2-13', name: 'Holo Core', category: '✨ Premium Abstract' },
  { id: 'pa2-14', name: 'Synth Wave', category: '✨ Premium Abstract' },
  { id: 'pa2-15', name: 'Cyber Fluid', category: '✨ Premium Abstract' },
  { id: 'pa2-16', name: 'Prism Light', category: '✨ Premium Abstract' },
  { id: 'pa2-17', name: 'Tesseract Spin', category: '✨ Premium Abstract' },
  { id: 'pa2-18', name: 'Dark Matter', category: '✨ Premium Abstract' },
  { id: 'pa2-19', name: 'Plasma Flow', category: '✨ Premium Abstract' },
  { id: 'pa2-20', name: 'Nova Burst', category: '✨ Premium Abstract' }
];

const COLOR_THEMES = [
  { id: 'agrishield-default', name: '🌿 AgriShield Default', desc: 'Classic emerald green theme for agriculture and crop diagnostic platforms.', colorClass: 'bg-[#10b981]' },
  { id: 'harvest-gold', name: '🌾 Harvest Gold', desc: 'Warm amber tones representing golden wheat fields and harvest season.', colorClass: 'bg-[#f59e0b]' },
  { id: 'ocean-irrigation', name: '🌊 Ocean Irrigation', desc: 'Water blue tones representing smart irrigation and flow management systems.', colorClass: 'bg-[#3b82f6]' },
  { id: 'sunset-farm', name: '🌅 Sunset Farm', desc: 'Warm orange and peach shades matching serene sunset field skies.', colorClass: 'bg-[#f97316]' },
  { id: 'cherry-blossom', name: '🌸 Cherry Blossom', desc: 'Elegant pink rose tones reflecting spring floral bloom cycles.', colorClass: 'bg-[#ec4899]' },
  { id: 'lavender-fields', name: '💜 Lavender Fields', desc: 'Beautiful aromatic purple hues styled after lavender farming zones.', colorClass: 'bg-[#a855f7]' },
  { id: 'forest-floor', name: '🌲 Forest Floor', desc: 'Lush organic green shades representing forest and crop ecosystems.', colorClass: 'bg-[#22c55e]' },
  { id: 'cyberpunk-ai', name: '🤖 Cyberpunk AI', desc: 'Futuristic fuchsia neon colors for high-tech autonomous farm labs.', colorClass: 'bg-[#d946ef]' },
  { id: 'midnight-lab', name: '🔬 Midnight Lab', desc: 'Deep scientific indigo colors optimized for late-night crop research.', colorClass: 'bg-[#6366f1]' },
  { id: 'desert-oasis', name: '🏜️ Desert Oasis', desc: 'Clean sandy teal colors ideal for arid-zone protected farming.', colorClass: 'bg-[#14b8a6]' },
  { id: 'volcanic-soil', name: '🌋 Volcanic Soil', desc: 'Rich charcoal and fire red colors themed after volcanic mineral soil.', colorClass: 'bg-[#ef4444]' },
  { id: 'arctic-research', name: '❄️ Arctic Research', desc: 'Frosty cyan shades styled for cold-frame botanical research stations.', colorClass: 'bg-[#06b6d4]' },
  { id: 'barley-bronze', name: '🟤 Barley Bronze', desc: 'Rich metallic earth brown colors representing organic soil health.', colorClass: 'bg-[#b45309]' },
  { id: 'citrus-orchard', name: '🍋 Citrus Orchard', desc: 'Zesty lime green colors for citrus tree monitoring networks.', colorClass: 'bg-[#84cc16]' },
  { id: 'mist-dew', name: '☁️ Mist & Dew', desc: 'Soft slate grey tones reflecting high-altitude mist and moisture levels.', colorClass: 'bg-[#64748b]' },
  { id: 'emerald-valley', name: '🌿 Emerald Valley', desc: 'Vibrant teal and emerald blending for lush field environments.', colorClass: 'bg-[#10b981]' },
  { id: 'crimson-harvest', name: '🍎 Crimson Harvest', desc: 'Deep ruby and red tones reflecting late season harvesting.', colorClass: 'bg-[#ef4444]' },
  { id: 'sapphire-stream', name: '💎 Sapphire Stream', desc: 'Bright indigo shades optimized for high-contrast visibility.', colorClass: 'bg-[#6366f1]' },
  { id: 'golden-wheat', name: '🌾 Golden Wheat', desc: 'Warm amber tones representing golden wheat fields and harvest season.', colorClass: 'bg-[#f59e0b]' },
  { id: 'amethyst-sky', name: '🔮 Amethyst Sky', desc: 'Beautiful purple hues styled after twilight farming zones.', colorClass: 'bg-[#a855f7]' },
  { id: 'obsidian-tech', name: '🖤 Obsidian Tech', desc: 'Sleek dark slate colors for modern tech-forward interfaces.', colorClass: 'bg-[#64748b]' },
  { id: 'coral-reef', name: '🪸 Coral Reef', desc: 'Bright rose and pink colors reflecting tropical flora.', colorClass: 'bg-[#f43f5e]' },
  { id: 'olive-grove', name: '🫒 Olive Grove', desc: 'Subtle lime and olive greens for Mediterranean climate agriculture.', colorClass: 'bg-[#84cc16]' },
  { id: 'tropical-rain', name: '🌴 Tropical Rain', desc: 'Vibrant cyan tones for high humidity environment monitoring.', colorClass: 'bg-[#06b6d4]' },
  { id: 'autumn-leaves', name: '🍂 Autumn Leaves', desc: 'Warm orange and peach shades matching serene autumn skies.', colorClass: 'bg-[#f97316]' },
  { id: 'glacial-melt', name: '🧊 Glacial Melt', desc: 'Crisp sky blue shades styled for cold-frame botanical stations.', colorClass: 'bg-[#0ea5e9]' },
  { id: 'neon-cyber', name: '👾 Neon Cyber', desc: 'Intense fuchsia neon colors for high-tech autonomous labs.', colorClass: 'bg-[#d946ef]' },
  { id: 'rust-iron', name: '⚙️ Rust & Iron', desc: 'Industrial stone and rust tones for heavy machinery tracking.', colorClass: 'bg-[#78716c]' },
  { id: 'peony-pink', name: '🌺 Peony Pink', desc: 'Elegant pink rose tones reflecting spring floral bloom cycles.', colorClass: 'bg-[#ec4899]' },
  { id: 'sunflower-field', name: '🌻 Sunflower Field', desc: 'Bright yellow tones representing high-energy summer growth.', colorClass: 'bg-[#eab308]' },
  { id: 'deep-ocean', name: '🐋 Deep Ocean', desc: 'Water blue tones representing smart irrigation systems.', colorClass: 'bg-[#3b82f6]' },
  { id: 'alpine-meadow', name: '🏔️ Alpine Meadow', desc: 'Lush organic green shades representing mountain crop ecosystems.', colorClass: 'bg-[#22c55e]' },
  { id: 'mocha-roast', name: '☕ Mocha Roast', desc: 'Rich coffee and zinc colors representing organic soil health.', colorClass: 'bg-[#71717a]' },
  { id: 'matcha-green', name: '🍵 Matcha Green', desc: 'Zesty lime green colors for citrus tree monitoring networks.', colorClass: 'bg-[#a3e635]' },
  { id: 'space-nebula', name: '🌌 Space Nebula', desc: 'Deep violet scientific colors optimized for late-night research.', colorClass: 'bg-[#8b5cf6]' }
];

const ProfilePage = () => {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const updateProfile = auth.updateProfile || (async () => {});
  const userRole = user?.role?.toLowerCase() || 'farmer';
  
  const [activeTab, setActiveTab] = React.useState('profile');
  const { theme, changeTheme } = useNavbarTheme();
  const { colorTheme, changeColorTheme } = useColorTheme();
  
  const { lastTelemetry } = useWebSocket();
  const activeTelemetry = lastTelemetry?.telemetry || lastTelemetry || {};
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [farmLocation, setFarmLocation] = React.useState('');
  const [state, setState] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [mandal, setMandal] = React.useState('');
  const [village, setVillage] = React.useState('');
  const [preferredLanguage, setPreferredLanguage] = React.useState('en');
  const [farmingPractices, setFarmingPractices] = React.useState('Conventional');

  // Derived cascading options for profile location
  const availableDistricts = getDistricts(state);
  const availableMandals = getMandals(state, district);
  const availableVillages = getVillages(state, district, mandal);
  
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [toastMsg, setToastMsg] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setFarmLocation(user.farm_location || '');
      setPreferredLanguage(user.preferred_language || 'en');
      setFarmingPractices(user.farming_practices || 'Conventional');
      
      // Parse location string if format is "Village, Mandal, District, State"
      if (user.farm_location && user.farm_location.includes(',')) {
        const parts = user.farm_location.split(',').map(s => s.trim());
        if (parts.length >= 4) {
          setVillage(parts[0]);
          setMandal(parts[1]);
          setDistrict(parts[2]);
          setState(parts[3]);
        } else if (parts.length === 2) {
          setDistrict(parts[0]);
          setState(parts[1]);
        }
      }
    }
  }, [user]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setToastMsg('');

    try {
      const fullLocationString = [village, mandal, district, state].filter(Boolean).join(', ') || farmLocation.trim();

      await updateProfile({
        name: name.trim(),
        farm_location: fullLocationString,
        preferred_language: preferredLanguage,
        crop_history: user?.crop_history || [],
        farming_practices: farmingPractices
      });
      setToastMsg('Profile details & farm location updated successfully.');
    } catch (err) {
      console.error("Profile update error:", err);
      const detail = err.response?.data?.detail || 'Failed to update profile information.';
      setErrorMsg(typeof detail === 'string' ? detail : 'Update error.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' , timeZone: 'Asia/Kolkata'})
    : 'Recently';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 w-full pb-12"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {userRole === 'admin' ? 'Administrator' : userRole === 'tester' ? 'QA Tester' : 'Farmer'} Profile & Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your credentials and update your personal profile attributes.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Profile Settings
          {activeTab === 'profile' && (
            <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === 'intelligence' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Farm Intelligence
          {activeTab === 'intelligence' && (
            <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('visuals')}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === 'visuals' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Visual Customization
          {activeTab === 'visuals' && (
            <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === 'themes' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Website Themes
          {activeTab === 'themes' && (
            <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-3 gap-6 tab-enter">
        {/* Profile Identity Card */}
        <Card glass className="p-6 text-center md:col-span-1 flex flex-col items-center justify-between border-slate-200/80 dark:border-slate-800 card-lift glow-card-hover">
          <div className="flex flex-col items-center">
            <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 h-20 w-20 rounded-full flex items-center justify-center font-extrabold text-3xl shadow-inner mb-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{user?.name || 'AgriShield User'}</h3>
            <div className="mt-1">
              <Badge variant="healthy">
                {user?.role ? user.role.toUpperCase() : 'FARMER'}
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 w-full mt-6 pt-4 text-left space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400 shrink-0" /> <span className="truncate">{user?.email || 'N/A'}</span></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400 shrink-0" /> Joined {formattedDate}</div>
            {user?.farm_location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" /> {user.farm_location}
              </div>
            )}
          </div>
        </Card>

        {/* Update Form Card */}
        <Card glass className="p-6 md:col-span-2 border-slate-200/80 dark:border-slate-800">
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Agronomic Profile Settings
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {toastMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="Email Address"
                value={email}
                disabled
                helperText="Email is locked to account authentication."
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* ── India Location Selector — State → District → Mandal → Village ── */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Farmer Native Location (India)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 ml-1">— Matches local government scheme alerts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">State / UT</label>
                  <select
                    value={state}
                    onChange={(e) => { setState(e.target.value); setDistrict(''); setMandal(''); setVillage(''); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">-- Select State / UT --</option>
                    {INDIA_STATES.map(s => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">District</label>
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setMandal(''); setVillage(''); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    disabled={!state}
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
                    onChange={(e) => { setMandal(e.target.value); setVillage(''); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    disabled={!district}
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">{district ? '-- Select Mandal --' : '-- Select District first --'}</option>
                    {availableMandals.map(m => (
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Village / Town Dropdown */}
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
                    {availableVillages.length === 0 && mandal && (
                      <>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} Central Village`}>{mandal} Central Village</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} North Sector`}>{mandal} North Sector</option>
                        <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={`${mandal} South Sector`}>{mandal} South Sector</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Selected location summary */}
              {(state || district || mandal || village) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved Location:</span>
                  {village && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-full">{village}</span>}
                  {mandal && <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-semibold rounded-full">{mandal}</span>}
                  {district && <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[11px] font-semibold rounded-full">{district}</span>}
                  {state && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-semibold rounded-full">{state}</span>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Farming Practice"
                value={farmingPractices}
                onChange={(e) => setFarmingPractices(e.target.value)}
                options={[
                  { value: 'Conventional', label: 'Conventional Farming' },
                  { value: 'Organic', label: 'Organic Farming' },
                  { value: 'Hydroponic', label: 'Hydroponic / Protected' },
                  { value: 'Regenerative', label: 'Regenerative Agro-forestry' }
                ]}
              />

              <Select
                label="AI Advisor Language Preference"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi (हिंदी)' },
                  { value: 'te', label: 'Telugu (తెలుగు)' },
                  { value: 'ta', label: 'Tamil (தமிழ்)' }
                ]}
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={loading}
                leftIcon={<Save className="w-4 h-4" />}
                className="btn-spring"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
        </div>
      )}

      {activeTab === 'visuals' && (
        <div className="tab-enter">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette className="h-6 w-6 text-emerald-500" />
                Navbar Animation Gallery
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Customize your farming experience. Choose from 103 exclusive, high-fidelity dynamic themes for your top navigation bar.
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-none px-3 py-1 text-sm font-bold">
              103 Themes Available
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ANIMATION_THEMES.map((t, index) => {
              const isActive = theme === t.id;
              return (
                <button 
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`relative text-left p-3 rounded-2xl border-2 transition-all duration-300 stagger-item group flex flex-col justify-between h-[145px] overflow-hidden
                    ${isActive 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/20' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-lg hover:-translate-y-1'
                    }`}
                  style={{ animationDelay: `${index * 0.01}s` }}
                >
                  <div className="w-full">
                    {isActive && (
                      <div className="absolute top-2 right-2 text-emerald-500 z-20">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </div>
                    )}
                    {/* Live preview container */}
                    <div className="relative h-14 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50 bg-slate-950 mb-2 pointer-events-none z-10">
                      <NavbarSceneRenderer theme={t.id} noWrapper={true} />
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs leading-tight transition-colors line-clamp-1 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600'}`}>
                      {t.name}
                    </h3>
                    <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1 font-bold uppercase tracking-wider">{t.category.replace(/[^a-zA-Z0-9\s&]/g, '').trim()}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'themes' && (
        <div className="tab-enter">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette className="h-6 w-6 text-emerald-500" />
                Website Color Themes
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Personalize your workspace. Choose from 15 custom-crafted color palettes to change the entire website appearance.
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-none px-3 py-1 text-sm font-bold">
              15 Themes Available
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COLOR_THEMES.map((themeItem, index) => {
              const isActive = colorTheme === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  onClick={() => changeColorTheme(themeItem.id)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 flex gap-4 group ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-md shadow-emerald-500/10' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-inner ${themeItem.colorClass}`}>
                      {isActive && <Check className="w-6 h-6 drop-shadow-md" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm tracking-tight transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600'}`}>
                      {themeItem.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {themeItem.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tab-enter">
          <WidgetErrorBoundary name="Autonomous Farm Schedule">
            <div className="lg:col-span-2">
              <FarmRoutineWidget />
            </div>
          </WidgetErrorBoundary>
          
          <WidgetErrorBoundary name="Live Weather Intelligence">
            <LiveWeatherWidget telemetry={activeTelemetry} />
          </WidgetErrorBoundary>
          
          <WidgetErrorBoundary name="Spray Application Advisor">
            <SprayAdvisorWidget telemetry={activeTelemetry} />
          </WidgetErrorBoundary>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage;
