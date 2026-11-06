import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { WebhookAndAuditEvent } from '../../types';

interface TrustBoundaryDrawerProps {
  events: WebhookAndAuditEvent[];
}

export const TrustBoundaryDrawer: React.FC<TrustBoundaryDrawerProps> = ({ events }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900 border-t border-slate-800 transition-all duration-300">
      {/* Drawer Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none"
      >
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">
            Trust & Cryptographic Verification Drawer (Live Audit Log)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            {events.length} security events recorded
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{isExpanded ? 'Collapse' : 'Expand Live Stream'}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Log Content */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 pb-4 animate-fadeIn">
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-2">
            {events.length === 0 ? (
              <div className="text-slate-500 text-center py-4">No audit events recorded yet.</div>
            ) : (
              events.map((ev) => {
                const isSuccess = ev.verification_status === 'SUCCESS';
                const isWarning = ev.verification_status === 'WARNING';
                const isRejected = ev.verification_status === 'REJECTED';

                return (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-slate-900/80 border-b border-slate-800/40 last:border-0"
                  >
                    <span className="text-slate-500 shrink-0 text-[11px]">
                      [{new Date(ev.timestamp).toLocaleTimeString()}]
                    </span>

                    <span className="shrink-0 mt-0.5">
                      {isSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : isRejected ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </span>

                    <span className="font-semibold text-slate-300 shrink-0">
                      [{ev.stage_name.split(' ')[1] || ev.stage_name}]
                    </span>

                    <span className="text-slate-400 truncate flex-1">
                      {ev.details}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isSuccess
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : isWarning
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : isRejected
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                          : 'bg-sky-950 text-sky-400 border border-sky-800/50'
                      }`}
                    >
                      {ev.verification_status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
