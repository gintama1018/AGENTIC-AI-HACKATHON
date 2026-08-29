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
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-control bg-ink flex items-center justify-center">
            <Shield className="w-4 h-4 text-surface" />
          </div>
          <span className="font-semibold text-[15px] text-charcoal tracking-tight">ReturnShield</span>
        </Link>

        {/* Heading */}
        <h1 className="text-[22px] font-semibold text-charcoal tracking-tight mb-1">
          Register brand workspace
        </h1>
        <p className="text-compact text-graphite mb-6">
          Set up an isolated investigation environment for your brand.
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-surface mb-4 border"
            style={{ background: '#EEDDD9', borderColor: '#C49088', color: '#7D3F38' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-compact">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-meta font-semibold text-charcoal mb-1">Your name</label>
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
            <label className="block text-meta font-semibold text-charcoal mb-1">Company / brand name</label>
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
            <label className="block text-meta font-semibold text-charcoal mb-1">Work email</label>
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
            <label className="block text-meta font-semibold text-charcoal mb-1">Password</label>
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

          <button type="submit" disabled={loading} className="rs-btn-primary w-full justify-center mt-2">
            {loading ? 'Creating workspace…' : 'Create workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-meta text-ash text-center mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-charcoal font-medium hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
