import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { WebhookAndAuditEvent } from '../../../types';

interface AuditTrailViewProps {
  auditEvents: WebhookAndAuditEvent[];
  onRefresh: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditEvents,
  onRefresh,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Cryptographic Audit & Webhook Event Trail
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Immutable SHA-256 validation log verifying every stage of the 5-Stage Trust Boundary pipeline.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Events Timeline */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold uppercase">
          <span>Verification Event ({auditEvents.length})</span>
          <span>Timestamp (UTC)</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {auditEvents.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-[var(--bg-surface-raised)] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {evt.verification_status === 'SUCCESS' || evt.verification_status === 'VERIFIED' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : evt.verification_status === 'REJECTED' ? (
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  <span className="font-bold text-[var(--text-primary)]">
                    {evt.stage_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {evt.action_name}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-xs pl-4">
                  {evt.details}
                </p>
              </div>

              <div className="text-[11px] font-mono text-[var(--text-tertiary)] pl-4 md:pl-0 shrink-0">
                {new Date(evt.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
