import React, { useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  ArrowRightLeft, 
  ShieldCheck, 
  Globe, 
  Layers,
  Menu,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { LanguageCode } from '../../types';

export const AppHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    setComplianceOpen,
    setCommandPaletteOpen,
    setAuditDrawerOpen,
    backendConfig,
    setBackendConfig,
    toggleSidebar
  } = useAppStore();

  // Fetch safe environment configuration from backend
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendConfig({
          appMode: (data.appMode || (data.environment === 'PAYPAL_LIVE_SANDBOX' ? 'SANDBOX' : data.environment === 'PAYPAL_SANDBOX' ? 'SANDBOX' : 'MOCK')) as any,
          isLivePayPal: Boolean(data.mode === 'LIVE' || data.isLivePayPal),
          service: data.service || 'VernacPay-Global v2.0',
          fxRate: data.fx_rate || 84.00,
          sandboxBuyer: data.sandbox_buyer || {
            email: 'sb-pj4347w53813178@personal.example.com',
            password: '••••••••',
          },
        });
      })
      .catch(() => {
        // Safe default
      });
  }, [setBackendConfig]);

  const appMode = backendConfig?.appMode || 'MOCK';
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <header className="h-16 px-4 md:px-6 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 sticky top-0 z-20 select-none">
      {/* Left: Mobile Menu + View Context / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Environment Badge (Truthful & Non-Deceptive) */}
        {appMode === 'PRODUCTION' ? (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE PAYMENTS
          </span>
        ) : appMode === 'SANDBOX' && backendConfig?.isLivePayPal ? (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            PAYPAL LIVE SANDBOX
          </span>
        ) : (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5" title="Operating with local high-fidelity sandbox generators">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            LOCAL DEMO SIMULATOR
          </span>
        )}
      </div>

      {/* Center: Live FX Reference Pill (With Honest Illustrative Label) */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
        <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
        <span className="font-semibold text-[var(--text-primary)]">1 USD = ₹{backendConfig?.fxRate.toFixed(2) || '84.00'} INR</span>
        <span className="text-[10px] text-[var(--text-tertiary)]">(Illustrative Reference Quote)</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]">
          <Globe className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent border-none text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="te-IN" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">తెలుగు (Telugu)</option>
            <option value="hi-IN" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">हिंदी (Hindi)</option>
            <option value="ur-IN" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">اردو (Urdu)</option>
            <option value="en-IN" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">English (India)</option>
          </select>
        </div>

        {/* Global Search CMD+K Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>

        {/* Compliance Readiness Modal Trigger */}
        <button
          onClick={() => setComplianceOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--accent-emerald)] transition-all"
          title="Indian Exporter Compliance Readiness"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden md:inline">Compliance</span>
        </button>

        {/* Audit Drawer Trigger */}
        <button
          onClick={() => setAuditDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          title="Open Cryptographic Audit Trail"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden md:inline">Audit Log</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border border-transparent hover:border-[var(--border-subtle)] transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
