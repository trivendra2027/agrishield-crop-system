import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui/index';
import { useToast } from '../components/ui/toast';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const targetPath = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(targetPath, { replace: true });
    }
  }, [user, navigate]);

  // Show session expired notification if forwarded with query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.warning('Session Expired', 'Please sign in again to access your dashboard.');
    }
  }, [location, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submit

    if (!email || !password) {
      setErrorMsg('Please fill in all credentials.');
      toast.error('Validation Error', 'Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      const loggedUser = await login(email, password, rememberMe);
      toast.success('Welcome Back!', 'Authentication successful.');
      const userRole = loggedUser?.role || (loggedUser?.user && loggedUser.user.role);
      const defaultPath = userRole === 'admin' ? '/admin' : '/dashboard';
      const from = location.state?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const raw = err.response?.data?.detail;
      const detail = Array.isArray(raw)
        ? raw.map(e => e.msg || JSON.stringify(e)).join(', ')
        : (typeof raw === 'string' ? raw : 'Incorrect email or password. Please try again.');
      setErrorMsg(detail);
      toast.error('Login Failed', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary-100/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />

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
          <h2 className="font-display font-extrabold text-gray-900 text-3xl tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your details to access your farm dashboard</p>
        </div>

        <Card className="p-8 shadow-glass border-white/50 bg-white/70 backdrop-blur-md" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

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
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                />
                Remember Me
              </label>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5">
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            New to AgriShield?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>

      {toastMsg && (
        <Toast 
          message={toastMsg} 
          type="info" 
          onClose={() => setToastMsg('')} 
        />
      )}
    </div>
  );
};

export default LoginPage;
