import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Shield,
  RotateCcw,
  TrendingUp,
  Package,
  CheckSquare,
  UploadCloud,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AskReturnShieldDrawer } from '../ui/AskReturnShieldDrawer';

const SIDEBAR_W = 230;

const primaryNav = [
  { name: 'Overview',     path: '/dashboard',                 icon: LayoutGrid  },
  { name: 'Returns',      path: '/dashboard/returns',         icon: RotateCcw   },
  { name: 'Patterns',     path: '/dashboard/patterns',        icon: TrendingUp  },
  { name: 'Problem SKUs', path: '/dashboard/products',        icon: Package     },
  { name: 'Actions',      path: '/dashboard/recommendations', icon: CheckSquare },
];

const secondaryNav = [
  { name: 'Import',    path: '/dashboard/import',   icon: UploadCloud },
  { name: 'Reports',   path: '/dashboard/reports',  icon: FileText    },
  { name: 'Settings',  path: '/dashboard/settings', icon: Settings    },
];

const pageTitle = (pathname) => {
  if (pathname === '/dashboard')                    return 'Operational Briefing';
  if (pathname.startsWith('/dashboard/returns/'))   return 'Return Evidence Dossier';
  if (pathname === '/dashboard/returns')            return 'Returns Investigation Table';
  if (pathname === '/dashboard/patterns')           return 'Longitudinal Patterns';
  if (pathname === '/dashboard/products')           return 'Problem SKU Profiles';
  if (pathname === '/dashboard/recommendations')    return 'Actions Hub';
  if (pathname === '/dashboard/import')             return 'Import Returns';
  if (pathname === '/dashboard/reports')            return 'Executive Brief';
  if (pathname === '/dashboard/settings')           return 'Settings & Integrations';
  return 'Workstation';
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);
  const [seeding, setSeeding]       = useState(false);
  const [seedMsg, setSeedMsg]       = useState('');
  const location = useLocation();

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMsg('Refreshing dataset…');
      await api.seedDemoData();
      setSeedMsg('Dataset refreshed');
      setTimeout(() => setSeedMsg(''), 2500);
      window.location.reload();
    } catch {
      setSeedMsg('Failed to refresh');
      setTimeout(() => setSeedMsg(''), 2500);
    } finally {
      setSeeding(false);
    }
  };

  const navLinkClass = (path) => {
    const isActive =
      path === '/dashboard'
        ? location.pathname === '/dashboard'
        : location.pathname.startsWith(path);
    return [
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150',
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent',
    ].join(' ');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex font-sans">

      {/* ── Left Rail Sidebar (desktop) ─────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-20 bg-[#0D121F] border-r border-slate-800/80"
        style={{ width: SIDEBAR_W }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-sm text-white tracking-tight block">ReturnShield</span>
              <span className="text-[10px] text-slate-400 font-medium">Return Intelligence</span>
            </div>
          </Link>
        </div>

        {/* Ask ReturnShield Quick Trigger */}
        <div className="px-3 pt-4">
          <button
            onClick={() => setAskDrawerOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-700/60 text-indigo-300 text-xs font-bold hover:border-indigo-500 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              Ask ReturnShield
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200">AI</span>
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Investigation</p>
          {primaryNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass(item.path)}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          <p className="px-3 pb-2 pt-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operations</p>
          {secondaryNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass(item.path)}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: tenant info + actions */}
        <div className="px-3 py-3 border-t border-slate-800/80 bg-[#0A0E18] space-y-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            title="Reset Indian demo dataset"
            className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seedMsg || 'Reset Indian Demo'}</span>
          </button>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="leading-tight min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Sonu Jangir'}</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{user?.company_name || 'BharatThreads'}</p>
            </div>
            <button onClick={logout} title="Sign Out" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: SIDEBAR_W }}>

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D121F] border-b border-slate-800 sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">ReturnShield</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setAskDrawerOpen(true)} className="p-1.5 rounded-lg text-indigo-400 bg-indigo-950/50 border border-indigo-700/60">
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0D121F] border-b border-slate-800 px-3 py-3 space-y-1 sticky top-14 z-20">
            <p className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Investigation</p>
            {primaryNav.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={navLinkClass(item.path)}>
                <item.icon className="w-4 h-4" /> {item.name}
              </NavLink>
            ))}
            <p className="px-3 py-1 pt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operations</p>
            {secondaryNav.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={navLinkClass(item.path)}>
                <item.icon className="w-4 h-4" /> {item.name}
              </NavLink>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 px-1">
              <span className="text-xs text-slate-200 font-medium">{user?.name || 'Sonu Jangir'}</span>
              <button onClick={logout} className="text-xs text-rose-400 font-medium">Sign Out</button>
            </div>
          </div>
        )}

        {/* Page context sub-header */}
        <div className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-slate-800/80 bg-[#0D121F]">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="font-bold text-white text-sm">{pageTitle(location.pathname)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Tenant: <strong className="text-slate-200">{user?.company_name || 'BharatThreads Lifestyle Pvt. Ltd.'}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAskDrawerOpen(true)}
              className="rs-btn-secondary text-xs flex items-center gap-1.5"
              style={{ height: 34, padding: '0 12px' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Ask ReturnShield
            </button>
            <Link
              to="/dashboard/import"
              className="rs-btn-primary"
              style={{ height: 34, padding: '0 14px', fontSize: 12 }}
            >
              + Ingest Returns
            </Link>
          </div>
        </div>

        {/* Workstation canvas */}
        <main className="flex-1 px-6 py-8 md:px-8 max-w-workstation w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>

      {/* Ask ReturnShield Drawer */}
      <AskReturnShieldDrawer
        isOpen={askDrawerOpen}
        onClose={() => setAskDrawerOpen(false)}
        runId="current"
      />
    </div>
  );
};
