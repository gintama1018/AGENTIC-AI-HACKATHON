import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
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
          Sign in to workstation
        </h1>
        <p className="text-compact text-graphite mb-6">
          Access your return investigation environment.
        </p>

        {/* 1-Click Evaluation Entry */}
        <div className="border border-stone rounded-surface bg-surface p-4 mb-5">
          <p className="text-meta text-graphite mb-2.5">
            <span className="font-semibold text-charcoal">Evaluation access</span>
            {' '}— pre-seeded Indian D2C return data
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="rs-btn-primary w-full justify-center"
          >
            {loading ? 'Opening workstation…' : '1-click demo login — Sonu Jangir'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-mist flex-1" />
          <span className="text-meta text-ash">or sign in with password</span>
          <div className="h-px bg-mist flex-1" />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-surface mb-4 border"
            style={{ background: '#EEDDD9', borderColor: '#C49088', color: '#7D3F38' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-compact">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-meta font-semibold text-charcoal mb-1">Work email</label>
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
            <label className="block text-meta font-semibold text-charcoal mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rs-field"
            />
          </div>

          <button type="submit" disabled={loading} className="rs-btn-secondary w-full justify-center">
            {loading ? 'Authenticating…' : 'Sign in'}
          </button>
        </form>

        <p className="text-meta text-ash text-center mt-6">
          Need a brand workspace?{' '}
          <Link to="/signup" className="text-charcoal font-medium hover:underline underline-offset-2">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
