import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, Shield, History, Activity, ChevronRight, CheckCircle2, Globe, 
  Cpu, Sprout, Bot, ScanLine, Sparkles, MapPin, Zap, ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../components/ui/index';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Instant automatic redirect to dashboard for authenticated users
  useEffect(() => {
    if (user && !loading) {
      const targetPath = user.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard';
      navigate(targetPath, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const features = [
    {
      icon: ScanLine,
      badge: "AI Scan Center",
      route: "/upload",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
      title: t('landing.feat1_title', "Real-Time AI Disease Diagnosis"),
      description: t('landing.feat1_desc', "Upload crop leaf photos to detect 1,200+ plant species and pathogens instantly using PyTorch EfficientNetV2 neural networks with Grad-CAM heatmaps.")
    },
    {
      icon: Sprout,
      badge: "My Farm & Operations",
      route: "/farm",
      color: "from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400",
      title: t('landing.feat2_title', "Agronomic Sector & Crop Lifecycle"),
      description: t('landing.feat2_desc', "Manage land sectors, active crop growth stages (Germination to Harvest), irrigation types, and 1-click GPS auto-coordinates.")
    },
    {
      icon: Cpu,
      badge: "ESP32 IoT Telemetry",
      route: "/devices",
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
      title: t('landing.feat3_title', "Real-Time Sensor Hardware Sync"),
      description: t('landing.feat3_desc', "Stream live field metrics (Air Temp, Humidity, Soil Moisture %, Rain, Sunlight Lux) directly from paired ESP32 field transceiver nodes.")
    },
    {
      icon: Bot,
      badge: "AI Agronomist Assistant",
      route: "/assistant",
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
      title: t('landing.feat4_title', "Multilingual Smart Chat Advisor"),
      description: t('landing.feat4_desc', "Get 24/7 personalized advice on soil NPK nutrients, organic bio-pesticide treatments, and spray schedules in your preferred language.")
    }
  ];

  return (
    <main className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent blur-3xl" />
      <div className="absolute top-1/3 left-0 -z-10 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-sky-400/15 via-indigo-400/10 to-transparent blur-3xl" />

      {/* Top Navbar Area */}
      <div className="absolute top-0 w-full p-4 sm:p-6 flex justify-between items-center z-20 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>
            Agri<span className="text-emerald-600 dark:text-emerald-400">Shield</span> AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              aria-label="Select Language"
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="en">English (US)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="hi">हिन्दी (Hindi)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="te">తెలుగు (Telugu)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ta">தமிழ் (Tamil)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="mr">मराठी (Marathi)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ml">മലയാളം (Malayalam)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="kn">ಕನ್ನಡ (Kannada)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="bn">বাংলা (Bengali)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="gu">ગુજરાતી (Gujarati)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>

          {user ? (
            <Link to="/dashboard">
              <Button size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col lg:flex-row items-center gap-12 flex-grow">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs sm:text-sm font-bold tracking-normal leading-normal max-w-full text-left sm:text-center flex-wrap">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
            <span>{t('landing.tagline', 'Empowering Modern Agriculture with PyTorch AI & ESP32 IoT')}</span>
          </div>
          
          <h1 className="font-extrabold text-slate-900 dark:text-slate-100 tracking-normal text-3xl sm:text-5xl lg:text-6xl leading-[1.3] sm:leading-[1.25] lg:leading-[1.2]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('landing.headline_1', 'Protect Your Crops.')} <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              {t('landing.headline_2', 'Detect Disease Instantly.')}
            </span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            {t('landing.subheadline', 'Upload leaf photos to identify crop diseases instantly. Monitor real-time ESP32 soil/weather telemetry and receive personalized agronomic guidance.')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-500/25 whitespace-nowrap" rightIcon={<ChevronRight className="h-5 w-5" />}>
                  {t('landing.go_dashboard', 'Go to Dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-500/25 whitespace-nowrap" rightIcon={<ChevronRight className="h-5 w-5" />}>
                    {t('landing.get_started', 'Get Started Free')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto whitespace-nowrap">
                    {t('landing.sign_in', 'Sign In Account')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-normal">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 h-4 w-4 shrink-0" /> {t('landing.classes', '1,200+ Botanical & Disease Classes')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 h-4 w-4 shrink-0" /> {t('landing.ai', 'PyTorch EfficientNetV2-S AI')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 h-4 w-4 shrink-0" /> {t('landing.iot', 'ESP32 Sensor Telemetry')}</span>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-sky-500/30 rounded-3xl blur-2xl opacity-40 transform rotate-2" />
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{t('landing.scan_active', 'AI Scan Center & Telemetry')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 leading-tight">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span>{t('landing.scanning_active', 'Live Diagnostic Scanning Active')}</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
                {t('landing.accuracy', '98.4% Accuracy')}
              </span>
            </div>

            {/* Diagnostic Card Preview */}
            <div className="relative rounded-2xl bg-slate-950 p-5 border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between min-h-[220px] group space-y-3">
              {/* Scan Beam Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-12 w-full animate-pulse top-1/4 pointer-events-none" />
              
              <div className="flex items-center justify-between z-10 flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tomato Sector A</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold whitespace-nowrap shrink-0">
                  {t('landing.diseased_detected', 'Diseased Detected')}
                </span>
              </div>

              <div className="z-10 space-y-1.5 my-auto">
                <p className="text-[11px] text-slate-400 uppercase tracking-normal font-semibold">{t('landing.pathology_result', 'AI Pathology Result')}</p>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">Tomato — Leaf Mold</h3>
                <p className="text-xs text-emerald-400 font-semibold flex items-start gap-1.5 leading-snug pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                  <span>{t('landing.organic_treatment', 'Organic Treatment: Copper Bio-Fungicide (Bordeaux 1%)')}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80 gap-2 flex-wrap">
                <span>Model: PyTorch EfficientNetV2</span>
                <span className="text-emerald-400 font-bold whitespace-nowrap">Confidence: 97.4%</span>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col justify-center">
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 tracking-normal leading-snug">{t('landing.healthy_ratio', 'Healthy Crop Ratio')}</p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">84%</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center flex flex-col justify-center">
                <p className="text-[11px] font-bold text-sky-800 dark:text-sky-300 tracking-normal leading-snug">{t('landing.avg_confidence', 'Avg AI Confidence')}</p>
                <p className="text-2xl font-extrabold text-sky-700 dark:text-sky-400 mt-1">94.8%</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('landing.precision_title', 'Designed for Precision Smart Agriculture')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {t('landing.precision_desc', 'Comprehensive agronomic tooling combining high-accuracy AI leaf diagnostics, ESP32 field telemetry, and personal agronomic advisory.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link key={idx} to={user ? feat.route : '/login'} className="block h-full">
                  <Card glass className="p-6 h-full flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${feat.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      <span>{t('landing.explore_module', 'Explore Module')}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
        <p>© 2026 AgriShield AI & IoT Crop Health Intelligence Platform. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
