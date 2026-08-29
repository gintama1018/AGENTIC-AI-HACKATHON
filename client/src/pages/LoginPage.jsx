import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email,    setEmail]    = useState('Sonu.jangir2024@uem.edu.in');
  const [password, setPassword] = useState('demo1234');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, loginAsDemo }  = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">ReturnShield</span>
        </Link>

        {/* Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Sign In to Workstation
            </h1>
            <p className="text-xs text-slate-400">
              Access your return investigation dashboard.
            </p>
          </div>

          {/* 1-Click Evaluation Entry */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Hackathon Evaluation
              </span>
              <span className="text-[10px] text-emerald-400 font-num font-semibold">Pre-seeded Indian Data</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full rs-btn-primary justify-center text-xs font-bold"
              style={{ height: 40 }}
            >
              {loading ? 'Entering...' : '1-Click Demo Login (Sonu Jangir)'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] text-slate-500 font-medium">or sign in with password</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.in"
                className="rs-field"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rs-field"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full rs-btn-secondary justify-center text-xs font-bold">
              {loading ? 'Authenticating…' : 'Sign In with Password'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center pt-2">
            Need a brand workspace?{' '}
            <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
