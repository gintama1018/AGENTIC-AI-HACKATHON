import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company_name: '', password: '' });
  const [error,   setError]    = useState('');
  const [loading, setLoading]  = useState(false);
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
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
              Register Brand Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Set up dedicated return intelligence for your Indian store.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sonu Jangir"
                className="rs-field"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Brand / Company Name</label>
              <input
                type="text"
                required
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. BharatThreads Lifestyle Pvt. Ltd."
                className="rs-field"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Work Email</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.in"
                className="rs-field"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="rs-field"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full rs-btn-primary justify-center text-xs font-bold mt-2" style={{ height: 40 }}>
              {loading ? 'Creating...' : 'Create Workspace & Launch'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center pt-2">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
