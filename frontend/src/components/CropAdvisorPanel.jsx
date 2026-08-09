import React from 'react';
import { 
  Leaf, 
  Activity, 
  Droplet, 
  Wind, 
  Thermometer, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Shield,
  ThumbsUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const CropAdvisorPanel = ({ advisor }) => {
  if (!advisor) return null;

  const { crop, severity, treatment, spray, recovery, prevention, tips } = advisor;

  return (
    <div className="space-y-6 mt-6">
      {/* 1. Header & Severity Summary */}
      <div 
        className="rounded-xl border p-6 flex flex-col md:flex-row items-center justify-between shadow-sm"
        style={{ borderColor: severity.color, backgroundColor: `${severity.color}10` }}
      >
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner"
            style={{ backgroundColor: `${severity.color}20`, color: severity.color }}
          >
            {severity.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {crop.name} • <span style={{ color: severity.color }}>{severity.level} Risk</span>
            </h2>
            <p className="text-gray-600 mt-1">{severity.description}</p>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border dark:border-slate-700 text-center shadow-sm">
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recovery Estimate</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {recovery.expected_days > 0 ? `${recovery.expected_days} Days` : "Healthy"}
          </div>
        </div>
      </div>

      {/* 2. Action Plan Tabs / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Organic Treatment */}
        {treatment.organic && treatment.organic.length > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-900/50 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900/50">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/30 pb-4">
              <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center text-lg">
                <Leaf className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-500" />
                Organic Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {treatment.organic.map((step, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Chemical Treatment */}
        {treatment.chemical && treatment.chemical.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900/50">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/30 pb-4">
              <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-500" />
                Chemical Intervention
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {treatment.chemical.map((step, idx) => (
                  <li key={idx} className="flex items-start">
                    <Info className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. Spray Advisory */}
      {spray.best_time !== "No urgent spray needed" && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-100 dark:border-indigo-900 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
              <Droplet className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Optimal Spray Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-4 border border-indigo-50 dark:border-indigo-900/50 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Timing</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{spray.best_time}</div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-4 border border-indigo-50 dark:border-indigo-900/50 flex items-start space-x-3">
                <Wind className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Wind Alert</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{spray.wind_warning}</div>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-4 border border-indigo-50 dark:border-indigo-900/50 flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Interval</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Every {spray.interval_days} days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Prevention & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prevention */}
        <Card className="border-amber-200 shadow-sm">
          <CardHeader className="bg-amber-50/50 pb-4">
            <CardTitle className="text-amber-800 flex items-center text-lg">
              <Shield className="w-5 h-5 mr-2 text-amber-600" />
              Future Prevention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {prevention.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0 mr-3"></span>
                  <span className="text-gray-700 leading-relaxed text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Farmer Tips */}
        <Card className="border-sky-200 shadow-sm">
          <CardHeader className="bg-sky-50/50 pb-4">
            <CardTitle className="text-sky-800 flex items-center text-lg">
              <ThumbsUp className="w-5 h-5 mr-2 text-sky-600" />
              Expert Farmer Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {tips.map((item, idx) => (
                <li key={idx} className="flex items-start bg-sky-50/50 p-3 rounded-lg border border-sky-100">
                  <Info className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0 mr-3" />
                  <span className="text-gray-700 leading-relaxed text-sm italic">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default CropAdvisorPanel;
