import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  RotateCcw, 
  TrendingUp, 
  PackageX, 
  Lightbulb, 
  UploadCloud, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  User,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Returns Explorer', path: '/dashboard/returns', icon: RotateCcw },
    { name: 'Trend Patterns', path: '/dashboard/patterns', icon: TrendingUp },
    { name: 'Problem Products', path: '/dashboard/products', icon: PackageX },
    { name: 'AI Recommendations', path: '/dashboard/recommendations', icon: Lightbulb },
    { name: 'Data Import & Ingestion', path: '/dashboard/import', icon: UploadCloud },
    { name: 'Executive Reports', path: '/dashboard/reports', icon: FileSpreadsheet },
    { name: 'Settings & n8n', path: '/dashboard/settings', icon: Settings }
  ];

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      setSeedNotice('Seeding realistic returns...');
      const res = await api.seedDemoData();
      setSeedNotice('✅ Demo dataset refreshed!');
      setTimeout(() => setSeedNotice(''), 3500);
      window.location.reload();
    } catch (err) {
      setSeedNotice('❌ Error refreshing data');
      setTimeout(() => setSeedNotice(''), 3000);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 glass-panel border-r border-slate-800/90 fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[6px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-brand-300 transition-colors">
                ReturnShield<span className="text-brand-400">.AI</span>
              </span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>

        {/* Company profile summary */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-slate-850/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tenant Profile</p>
            <span className="text-[10px] text-brand-400 font-mono">Multi-Tenant</span>
          </div>
          <p className="text-sm font-bold text-white truncate mt-0.5">{user?.company_name || 'Aurora Apparel'}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email || 'sarah@aurorafashion.com'}</p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Intelligence Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/20 to-indigo-600/10 text-white border border-brand-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400" />}
              </NavLink>
            );
          })}
        </div>

        {/* n8n Status Box & Seed Button */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" /> n8n AI Pipeline
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              v2: Classify → Root-Cause → Recs
            </p>
          </div>

          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/70 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            {seeding ? 'Refreshing Seed...' : 'Re-seed Demo Data'}
          </button>

          {seedNotice && (
            <p className="text-[11px] text-center text-emerald-400 font-medium animate-pulse">
              {seedNotice}
            </p>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navigation Header */}
        <header className="h-16 glass-panel border-b border-slate-800/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-white text-sm">ReturnShield</span>
            </Link>
          </div>

          {/* Quick Breadcrumb / Context */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Platform</Link>
            <span>/</span>
            <span className="text-white font-medium capitalize">
              {location.pathname.replace('/dashboard', '') || 'Overview'}
            </span>
          </div>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/import"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Import CSV Batch
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SJ'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-slate-400">{user?.role || 'Operations Director'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 glass-panel border-r border-slate-800 p-4 flex flex-col z-50 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-400" />
                  <span className="font-bold text-white">ReturnShield AI</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl ${
                        isActive ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    handleSeedDemoData();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2 text-xs bg-slate-800 text-slate-200 rounded-lg text-center font-medium"
                >
                  Re-seed Demo Data
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2 text-xs text-rose-400 bg-rose-500/10 rounded-lg text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
