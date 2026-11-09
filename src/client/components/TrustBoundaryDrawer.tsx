import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Layers 
} from 'lucide-react';
import { WebhookAndAuditEvent } from '../../types';
import { useAppStore } from '../store/useAppStore';

interface TrustBoundaryDrawerProps {
  events: WebhookAndAuditEvent[];
}

export const TrustBoundaryDrawer: React.FC<TrustBoundaryDrawerProps> = ({ events }) => {
  const { isAuditDrawerOpen, setAuditDrawerOpen } = useAppStore();

  if (!isAuditDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setAuditDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-Over Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Cryptographic Audit Trail
                </h2>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {events.length} security events recorded
                </span>
              </div>
            </div>

            <button
              onClick={() => setAuditDrawerOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]"
              aria-label="Close Audit Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Stream Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono text-xs">
            {events.length === 0 ? (
              <div className="text-[var(--text-tertiary)] text-center py-12">
                No audit events recorded yet.
              </div>
            ) : (
              events.map((ev) => {
                const isSuccess = ev.verification_status === 'SUCCESS' || ev.verification_status === 'VERIFIED';
                const isWarning = ev.verification_status === 'WARNING';
                const isRejected = ev.verification_status === 'REJECTED';

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-medium)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isRejected ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-[var(--text-primary)]">
                          {ev.stage_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-secondary)] pl-5 font-sans">
                      {ev.details}
                    </div>

                    <div className="text-[10px] text-[var(--text-tertiary)] pl-5">
                      Action: <span className="text-[var(--accent-blue)]">{ev.action_name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Authoritative SHA-256 Ledger</span>
            </span>
            <button
              onClick={() => setAuditDrawerOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-sunken)] hover:bg-[var(--bg-surface-highlight)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
