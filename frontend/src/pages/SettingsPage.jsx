import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, ShieldCheck, Globe, Key, Save, LogOut, Check, AlertCircle, Sprout, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select } from '../components/ui/index';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'farmer';
  const isFarmer = userRole === 'farmer';
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setMobileNumber(user.mobile || '');
      setEmail(user.email || '');
      setLanguage(user.preferred_language || 'en');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setToastMsg('');

    try {
      if (password) {
        if (password !== confirmPassword) {
          setErrorMsg('Password confirmation does not match.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: fullName,
        mobile: mobileNumber,
        preferred_language: language,
      };

      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      setToastMsg('Account profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save account settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto w-full pb-12"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Account & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, security credentials, and preferred display language.
        </p>
      </div>

      {/* Redirect Banner to Dedicated Farm Tab — Farmer only */}
      {isFarmer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Looking for Farm Sector, Crop & IoT Hardware Settings?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Farm profile coordinates, crop lifecycle stages, ESP32 pairing, and alert preferences have been upgraded into the dedicated <strong>My Farm</strong> tab.
              </p>
            </div>
          </div>

          <Link to="/farm">
            <Button size="sm" leftIcon={<Sprout className="w-4 h-4" />} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Go to My Farm
            </Button>
          </Link>
        </div>
      )}

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

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <Card glass className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your account name, mobile number, and preferred language.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Mobile Phone Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />
            <Input
              label="Email Address"
              value={email}
              disabled
              helperText="Email address cannot be changed."
            />
            <Select
              label="System Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'hi', label: 'Hindi (हिंदी)' },
                { value: 'te', label: 'Telugu (తెలుగు)' },
                { value: 'ta', label: 'Tamil (தமிழ்)' },
                { value: 'mr', label: 'Marathi (मराठी)' },
                { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' }
              ]}
            />
          </div>
        </Card>

        {/* Security / Password */}
        <Card glass className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Account Security</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your login password (leave blank to keep current password).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </Card>

        {/* Save Button & Logout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}
            className="w-full sm:w-auto border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            Log Out Account
          </Button>

          <Button
            type="submit"
            isLoading={loading}
            size="lg"
            leftIcon={<Save className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Save Account Settings
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
