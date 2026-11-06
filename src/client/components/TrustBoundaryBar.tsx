import React from 'react';
import { Bot, ShieldAlert, CheckCircle, Send, Lock } from 'lucide-react';
import { TrustBoundaryStage } from '../../types';

interface TrustBoundaryBarProps {
  currentStage: TrustBoundaryStage;
  authCode?: string;
}

export const TrustBoundaryBar: React.FC<TrustBoundaryBarProps> = ({ currentStage, authCode }) => {
  const stages: { id: TrustBoundaryStage; label: string; icon: any; short: string }[] = [
    {
      id: '1. AI PROPOSED (Untrusted)',
      label: '1. AI Proposes',
      short: 'Untrusted Speech',
      icon: Bot,
    },
    {
      id: '2. ZOD SCHEMA VALIDATED',
      label: '2. Server Validates',
      short: 'Zod + Illustrative FX',
      icon: ShieldAlert,
    },
    {
      id: '3. MERCHANT AUTHORIZED',
      label: '3. Merchant Authorizes',
      short: authCode ? `Confirmed (${authCode})` : 'Voice / 1-Tap',
      icon: CheckCircle,
    },
    {
      id: '4. PAYPAL API EXECUTED',
      label: '4. PayPal Sandbox Processes',
      short: 'Invoicing v2 / Shipping',
      icon: Send,
    },
    {
      id: '5. WEBHOOK VERIFIED & LEDGER LOCKED',
      label: '5. Ledger Verifies',
      short: 'Signed Webhook Lock',
      icon: Lock,
    },
  ];

  // Helper to determine stage state
  const stageOrder: TrustBoundaryStage[] = [
    '1. AI PROPOSED (Untrusted)',
    '2. ZOD SCHEMA VALIDATED',
    '3. MERCHANT AUTHORIZED',
    '4. PAYPAL API EXECUTED',
    '5. WEBHOOK VERIFIED & LEDGER LOCKED',
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Trust Boundary Flow:</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 md:gap-3 w-full md:w-auto flex-1 max-w-4xl">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = idx === currentIndex;
            const isCompleted = idx < currentIndex;

            return (
              <div
                key={st.id}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-500/80 shadow-lg shadow-emerald-500/10 scale-102'
                    : isCompleted
                    ? 'bg-slate-800/80 border-emerald-800/60 text-slate-300'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? 'text-emerald-400 animate-pulse'
                        : isCompleted
                        ? 'text-emerald-500'
                        : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold truncate ${
                      isCurrent
                        ? 'text-emerald-300'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline mt-0.5 truncate">
                  {st.short}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
