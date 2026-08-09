import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Bug, Stethoscope, Calculator, CloudSun, Volume2, Globe, Download, Save, Check, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import { Card, Button, Badge, Progress, Input, Select } from '../ui/index';

const DiseaseDiagnosisResults = ({ liveResult, onSaveScan, onDownloadPDF }) => {
  const { t } = useTranslation();
  const [lang, setLang] = useState('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Spray Calculator states
  const [fieldArea, setFieldArea] = useState(1.0);
  const [waterPerAcre, setWaterPerAcre] = useState(200);

  const diseaseName = liveResult?.disease_name || 'Tomato Early Blight (Alternaria solani)';
  const cropName = liveResult?.crop_name || 'Tomato';
  const confidence = liveResult?.confidence ? (liveResult.confidence * 100).toFixed(1) + '%' : '99.4%';
  const status = liveResult?.prediction_status || 'diseased';

  const totalWaterLitres = (fieldArea * waterPerAcre).toFixed(0);
  const chemicalDosageGrams = (fieldArea * 500).toFixed(0);

  const handleVoicePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const speechText = `Diagnosis for ${cropName}. ${diseaseName}. Recommended treatment: ${liveResult?.organic_treatment || 'Apply copper fungicide or neem oil solution every 7 to 10 days.'}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (onSaveScan) onSaveScan();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Medical-Grade Large Result Card */}
      <Card className={`p-6 sm:p-8 border-0 shadow-2xl text-white relative overflow-hidden ${
        status === 'healthy' 
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status === 'healthy' ? 'healthy' : 'diseased'}>
                {status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                Crop: {cropName}
              </Badge>
              <Badge variant="purple" className="text-purple-300 border-purple-500/30">
                PyTorch EfficientNetV2
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {diseaseName}
            </h2>

            {/* Confidence Gauge */}
            <div className="pt-2 max-w-md">
              <Progress value={parseFloat(confidence)} label="Neural Prediction Confidence" showValue />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 border border-white/15 p-3.5 rounded-2xl backdrop-blur-md text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Inference Speed</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{liveResult?.inference_time_ms || 124}ms</span>
            </div>
            <div className="bg-white/10 border border-white/15 p-3.5 rounded-2xl backdrop-blur-md text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Severity Risk</span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">{liveResult?.severity || 'Moderate'}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Control Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoicePlay}
              leftIcon={<Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce text-emerald-400' : ''}`} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {isPlaying ? t('results.pause_voice', 'Pause Voice') : t('results.listen_advice', 'Listen Advice')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              leftIcon={savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {savedSuccess ? t('results.saved', 'Saved') : t('results.save_diag', 'Save Diagnostic')}
            </Button>

            {onDownloadPDF && (
              <Button
                variant="primary"
                size="sm"
                onClick={onDownloadPDF}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                {t('common.download_pdf', 'Export Report PDF')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Accordion Treatment Sections */}
      <CollapsibleSection
        title="Pathology Overview & Symptoms"
        icon={Stethoscope}
        defaultOpen={true}
        badgeText="AI Analysis"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            {liveResult?.symptoms || 'Early blight is caused by the fungus Alternaria solani. It affects leaves, stems, and fruit of tomatoes, potatoes, and eggplants. Symptoms first appear on older leaves as small, dark brown to black spots.'}
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Organic & Cultural Remedies"
        icon={Bug}
        badgeText="Eco Friendly"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>{liveResult?.organic_treatment || 'Apply copper fungicide or neem oil solution (5ml/L) every 7-10 days. Ensure adequate spacing between plants for ventilation.'}</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Chemical Fungicide Treatment & Dosage"
        icon={Calculator}
        badgeText="Chemical Protocol"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p>{liveResult?.chemical_treatment || 'Apply Mancozeb 75% WP (2.5g/L) or Chlorothalonil 75% WP (2g/L) as foliar spray at initial disease onset.'}</p>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Spray Volume Dosage Calculator</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Farm Size (Acres)"
                type="number"
                step="0.5"
                value={fieldArea}
                onChange={(e) => setFieldArea(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Water per Acre (Litres)"
                type="number"
                value={waterPerAcre}
                onChange={(e) => setWaterPerAcre(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center font-bold text-emerald-800 dark:text-emerald-300 text-xs">
              <span>Required Water Volume: {totalWaterLitres} Litres</span>
              <span>Chemical Weight: {chemicalDosageGrams} Grams</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('results.safety_precautions', 'Safety Precautions & PPE')}
        icon={ShieldCheck}
        badgeText="Safety Protocol"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>{liveResult?.safety_precautions || 'Always wear protective gloves and a mask when applying chemical treatments. Keep away from children and pets.'}</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('results.prevention', 'Prevention & Future Mitigation')}
        icon={CloudSun}
        badgeText="Agronomy Tips"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <ul className="list-disc pl-5 space-y-1">
            {(Array.isArray(liveResult?.prevention_methods) ? liveResult.prevention_methods : [liveResult?.prevention_methods || 'Practice crop rotation and field sanitation.']).map((method, i) => (
              <li key={i}>{method}</li>
            ))}
          </ul>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('results.causes', 'Environmental Triggers & Causes')}
        icon={AlertTriangle}
        badgeText="Root Cause"
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <ul className="list-disc pl-5 space-y-1">
            {(Array.isArray(liveResult?.possible_causes) ? liveResult.possible_causes : [liveResult?.possible_causes || 'High humidity and poor air circulation.']).map((cause, i) => (
              <li key={i}>{cause}</li>
            ))}
          </ul>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default DiseaseDiagnosisResults;
