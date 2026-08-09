import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui/index';
import { useToast } from '../components/ui/toast';

const RegisterPage = () => {
  const { register, login, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submit
    setErrorMsg('');

    // Field Validations
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      toast.error('Validation Error', 'All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      toast.error('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      toast.error('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    
    try {
      await register(name, email, password, preferredLanguage);
      await login(email, password, false);
      toast.success('Account Created!', 'Welcome to AgriShield AI.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      const raw = err.response?.data?.detail;
      const detail = Array.isArray(raw)
        ? raw.map(e => e.msg || JSON.stringify(e)).join(', ')
        : (typeof raw === 'string' ? raw : 'Failed to create account. Please check your information.');
      setErrorMsg(detail);
      toast.error('Registration Failed', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background decoration blur bubbles */}
      <div className="absolute top-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary-100/50 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-display font-extrabold text-gray-900 tracking-tight text-2xl">
              AgriShield <span className="text-primary-600 font-normal">AI</span>
            </span>
          </Link>
          <h2 className="font-display font-extrabold text-gray-900 text-3xl tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Start protecting your crops with machine intelligence</p>
        </div>

        <Card className="p-8 shadow-glass border-white/50 bg-white/70 backdrop-blur-md" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Farmer John"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@farmer.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="language" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Preferred Language
              </label>
              <select
                id="language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold text-gray-800 cursor-pointer"
              >
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="en">English (English)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="hi">हिन्दी (Hindi)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="te">తెలుగు (Telugu)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ta">தமிழ் (Tamil)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="kn">ಕನ್ನಡ (Kannada)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ml">മലയാളം (Malayalam)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="bn">বাংলা (Bengali)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="mr">मराठी (Marathi)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="gu">ગુજરાતી (Gujarati)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="ur">اردو (Urdu)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="or">ଓଡ଼ିଆ (Odia)</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="as">অসমীয়া (Assamese)</option>
              </select>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5 mt-2">
              Create Account & Log In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
