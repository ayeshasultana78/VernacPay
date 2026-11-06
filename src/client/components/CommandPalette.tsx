import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { 
  Sparkles, 
  Filter, 
  Download, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Search,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Dialog, DialogContent } from './ui/Dialog';

interface CommandPaletteProps {
  onRunSample: (presetKey: string) => void;
  onFilterGrid: (status?: string) => void;
  onExportCsv: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onRunSample,
  onFilterGrid,
  onExportCsv,
}) => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    theme,
    toggleTheme,
    setComplianceOpen,
  } = useAppStore();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = (callback: () => void) => {
    callback();
    setCommandPaletteOpen(false);
  };

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="p-0 overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] max-w-xl">
        <Command className="flex flex-col w-full h-full">
          <div className="flex items-center px-4 border-b border-[var(--border-subtle)]">
            <Search className="w-4 h-4 text-[var(--text-muted)] mr-2 shrink-0" />
            <Command.Input
              placeholder="Type a command or search actions (e.g. invoice, filter, export, theme)..."
              className="w-full py-3.5 bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none"
            />
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              ESC
            </span>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2 text-xs space-y-1">
            <Command.Empty className="p-4 text-center text-xs text-[var(--text-muted)]">
              No matching actions found.
            </Command.Empty>

            <Command.Group heading="Sample Voice Workflows (Judge Demo)" className="text-[10px] font-semibold text-[var(--text-dim)] px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => handleSelect(() => onRunSample('telugu_invoice_sarah'))}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>[Telugu] Invoice Sarah ₹12,000 (Pochampally Saree)</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--text-dim)]" />
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => onRunSample('hindi_tracking_emma'))}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--status-staged)]" />
                  <span>[Hindi] Add DHL Tracking to Emma's Paid Order</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--text-dim)]" />
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => onRunSample('english_unpaid_remind'))}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--status-verified)]" />
                  <span>[English] Filter Grid to Unpaid & Remind David</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--text-dim)]" />
              </Command.Item>
            </Command.Group>

            <Command.Group heading="AG Grid Ledger Filters" className="text-[10px] font-semibold text-[var(--text-dim)] px-2 py-1 uppercase tracking-wider mt-2">
              <Command.Item
                onSelect={() => handleSelect(() => onFilterGrid(undefined))}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Show All Transactions</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onFilterGrid('VERIFIED_PAID'))}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                <Filter className="w-3.5 h-3.5 text-[var(--status-verified)]" />
                <span>Show Verified Paid Only</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onFilterGrid('AWAITING_BUYER'))}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                <Filter className="w-3.5 h-3.5 text-[var(--status-unpaid)]" />
                <span>Show Unpaid / Overdue Invoices</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Tools & Settings" className="text-[10px] font-semibold text-[var(--text-dim)] px-2 py-1 uppercase tracking-wider mt-2">
              <Command.Item
                onSelect={() => handleSelect(onExportCsv)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Export Ledger as CSV</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => setComplianceOpen(true))}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--status-verified)]" />
                <span>Open RBI & DGFT Compliance Checklist</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(toggleTheme)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface-raised)] cursor-pointer text-[var(--text-main)]"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface-sunken)] border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-dim)]">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>VernacPay-Global Quick Command Bar</span>
            </span>
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
