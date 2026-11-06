import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Sun, 
  Moon, 
  Sparkles,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Badge } from './ui/Badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/Tooltip';

export const TopBar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setComplianceOpen,
    setCommandPaletteOpen,
  } = useAppStore();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <TooltipProvider>
      <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
        {/* Left: Brand + Merchant Context */}
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center font-black text-white text-base shadow-sm">
            VP
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[var(--text-main)]">
                VernacPay-Global
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--status-staged-bg)] text-[var(--status-staged)] border border-[oklch(0.76_0.16_75_/_0.3)] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-staged)] animate-pulse" />
                SANDBOX
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[240px] sm:max-w-none">
              Lakshmi Handlooms & Crafts · Hyderabad
            </span>
          </div>
        </div>

        {/* Center: Live FX Reference Chip (Always visible) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="font-medium text-[var(--text-main)]">1 USD = ₹84.00 INR</span>
          <span className="text-[10px] text-[var(--text-dim)]">(Illustrative Reference Quote)</span>
        </div>

        {/* Right: Actions (Compliance, Command Palette, Theme Toggle) */}
        <div className="flex items-center gap-2">
          {/* Indian Exporter Compliance Readiness Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setComplianceOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--status-verified)] bg-[var(--bg-surface-raised)] hover:bg-[var(--status-verified-bg)] text-[var(--text-muted)] hover:text-[var(--status-verified)] text-xs font-medium transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--status-verified)]" />
                <span className="hidden sm:inline">Compliance Readiness</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Indian Exporter Checklist: PAN, linked bank account, Purpose Code P0102, and DGFT IEC
            </TooltipContent>
          </Tooltip>

          {/* Command Palette Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-xs">Search actions</span>
                <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-dim)]">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent>Open Command Palette ({isMac ? '⌘K' : 'Ctrl+K'})</TooltipContent>
          </Tooltip>

          {/* Theme Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};
