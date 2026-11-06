import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Lock, 
  ShieldAlert, 
  Clock, 
  RotateCw 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TrustStageNumber, TrustStageState } from '../../contracts';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/Tooltip';

interface StageMeta {
  number: TrustStageNumber;
  name: string;
  subtitle: string;
  guarantee: string;
  icon: any;
}

const STAGES: StageMeta[] = [
  {
    number: 1,
    name: '1. AI Proposes',
    subtitle: 'Untrusted Natural Language',
    guarantee: 'Speech transcript is treated as untrusted user input. Claude proposes tools only.',
    icon: Bot,
  },
  {
    number: 2,
    name: '2. Server Validates',
    subtitle: 'Zod + Illustrative FX Quote',
    guarantee: 'Strict Zod schema validation & deterministic 10-minute locked reference FX quote.',
    icon: ShieldCheck,
  },
  {
    number: 3,
    name: '3. Merchant Authorizes',
    subtitle: 'Explicit Human-in-the-Loop',
    guarantee: 'Mandatory human approval (voice "Avunu/Haan/Yes" or 1-tap button). Zero unconfirmed mutations.',
    icon: CheckCircle2,
  },
  {
    number: 4,
    name: '4. PayPal Sandbox Processes',
    subtitle: 'Orders v2 / Invoicing / Shipping',
    guarantee: 'Authoritative server-side PayPal API call with PayPal-Request-Id idempotency key.',
    icon: Send,
  },
  {
    number: 5,
    name: '5. Ledger Verifies',
    subtitle: 'Signed Webhook & Atomic Lock',
    guarantee: 'Transition to VERIFIED_PAID only after cryptographic webhook signature validation.',
    icon: Lock,
  },
];

export const TrustBar: React.FC = () => {
  const { runId, runStartTime, stageStates, stageReasons } = useAppStore();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!runStartTime) {
      setElapsedMs(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - runStartTime);
    }, 100);
    return () => clearInterval(timer);
  }, [runStartTime]);

  return (
    <TooltipProvider>
      <div className="sticky top-14 z-20 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md px-4 py-2 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Indicator title */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-[var(--status-verified)] animate-pulse" />
            <span className="hidden sm:inline">Trust Boundary:</span>
          </div>

          {/* Center: The 5 Stages with Animated Connectors */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full md:w-auto flex-1 max-w-4xl">
            {STAGES.map((st, idx) => {
              const state = stageStates[st.number] || 'idle';
              const reason = stageReasons[st.number];
              const Icon = st.icon;

              const isIdle = state === 'idle';
              const isActive = state === 'active';
              const isDone = state === 'done';
              const isBlocked = state === 'blocked';

              return (
                <Tooltip key={st.number}>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-help ${
                        isActive
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] shadow-sm scale-102 ring-1 ring-[var(--accent-primary)]'
                          : isDone
                          ? 'border-[oklch(0.68_0.18_150_/_0.3)] bg-[var(--status-verified-bg)] text-[var(--status-verified)]'
                          : isBlocked
                          ? 'border-[oklch(0.65_0.22_25_/_0.4)] bg-[var(--status-unpaid-bg)] text-[var(--status-unpaid)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isBlocked ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-[var(--status-unpaid)] shrink-0" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-verified)] shrink-0" />
                        ) : isActive ? (
                          <RotateCw className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-spin shrink-0" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                        )}

                        <span
                          className={`text-[11px] font-bold truncate ${
                            isActive
                              ? 'text-[var(--accent-primary)]'
                              : isDone
                              ? 'text-[var(--status-verified)]'
                              : isBlocked
                              ? 'text-[var(--status-unpaid)]'
                              : 'text-[var(--text-main)]'
                          }`}
                        >
                          {st.name}
                        </span>
                      </div>

                      <span className="text-[10px] text-[var(--text-muted)] hidden lg:inline mt-0.5 truncate max-w-[130px]">
                        {isBlocked && reason ? reason : st.subtitle}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="font-semibold">{st.name} Guarantee:</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">{st.guarantee}</div>
                    {reason && (
                      <div className="text-[11px] text-[var(--status-unpaid)] font-mono mt-1 font-semibold">
                        Alert: {reason}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Right: Run ID + Elapsed Timer */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[var(--text-dim)] shrink-0">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)]">
              {runId}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3" />
              <span>{(elapsedMs / 1000).toFixed(1)}s</span>
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
