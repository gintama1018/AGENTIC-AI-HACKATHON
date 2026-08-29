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
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const SIDEBAR_W = 220;

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
  if (pathname === '/dashboard/returns')            return 'Returns Investigation';
  if (pathname === '/dashboard/patterns')           return 'Longitudinal Patterns';
  if (pathname === '/dashboard/products')           return 'Problem SKU Profiles';
  if (pathname === '/dashboard/recommendations')    return 'Actions';
  if (pathname === '/dashboard/import')             return 'Import Returns';
  if (pathname === '/dashboard/reports')            return 'Executive Brief';
  if (pathname === '/dashboard/settings')           return 'Settings';
  return 'Workstation';
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
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
      'flex items-center gap-2.5 px-3 py-2 rounded-control text-compact transition-colors duration-150',
      isActive
        ? 'bg-canvas text-charcoal font-semibold'
        : 'text-graphite hover:text-charcoal hover:bg-canvas',
    ].join(' ');
  };

  return (
    <div className="min-h-screen bg-canvas text-charcoal flex">

      {/* ── Left Rail Sidebar (desktop) ─────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-20 bg-surface border-r border-stone"
        style={{ width: SIDEBAR_W }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-mist">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-control bg-ink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-surface" />
            </div>
            <span className="font-semibold text-[14px] text-charcoal tracking-tight">ReturnShield</span>
          </Link>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-4 overflow-y-auto">
          <p className="px-3 pb-1.5 text-meta text-ash uppercase tracking-wider">Investigation</p>
          {primaryNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass(item.path)}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          <p className="px-3 pb-1.5 pt-5 text-meta text-ash uppercase tracking-wider">Operations</p>
          {secondaryNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass(item.path)}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: tenant info + actions */}
        <div className="px-3 py-3 border-t border-stone space-y-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            title="Reset Indian demo dataset"
            className="rs-btn-quiet w-full justify-start text-[13px] text-graphite"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seedMsg || 'Reset Demo'}
          </button>

          <div className="flex items-center justify-between pt-1">
            <div className="leading-tight min-w-0">
              <p className="text-[13px] font-medium text-charcoal truncate">{user?.name || 'Sonu Jangir'}</p>
              <p className="text-meta text-ash truncate">{user?.company_name || 'BharatThreads'}</p>
            </div>
            <button onClick={logout} title="Sign Out" className="p-1.5 rounded-control text-graphite hover:text-critical transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: SIDEBAR_W }}>

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-stone sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-control bg-ink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-surface" />
            </div>
            <span className="font-semibold text-[14px] text-charcoal">ReturnShield</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-control text-graphite hover:text-charcoal">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-surface border-b border-stone px-3 py-3 space-y-0.5 sticky top-14 z-20">
            <p className="px-3 py-1 text-meta text-ash uppercase tracking-wider">Investigation</p>
            {primaryNav.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={navLinkClass(item.path)}>
                <item.icon className="w-4 h-4" /> {item.name}
              </NavLink>
            ))}
            <p className="px-3 py-1 pt-3 text-meta text-ash uppercase tracking-wider">Operations</p>
            {secondaryNav.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={navLinkClass(item.path)}>
                <item.icon className="w-4 h-4" /> {item.name}
              </NavLink>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-mist px-1">
              <span className="text-[13px] text-charcoal font-medium">{user?.name || 'Sonu Jangir'}</span>
              <button onClick={logout} className="text-[13px] text-critical font-medium">Sign Out</button>
            </div>
          </div>
        )}

        {/* Page context sub-header */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 border-b border-mist bg-surface">
          <div className="flex items-center gap-2 text-compact text-graphite">
            <span className="font-semibold text-charcoal">{pageTitle(location.pathname)}</span>
            <span className="text-mist">·</span>
            <span>{user?.company_name || 'BharatThreads Lifestyle Pvt. Ltd.'}</span>
          </div>
          <Link
            to="/dashboard/import"
            className="rs-btn-secondary text-[13px]"
            style={{ height: 32, padding: '0 12px', fontSize: 13 }}
          >
            + Ingest Returns
          </Link>
        </div>

        {/* Workstation canvas */}
        <main className="flex-1 px-6 py-8 md:px-8 max-w-workstation w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
