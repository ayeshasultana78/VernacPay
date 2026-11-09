import React from 'react';
import { 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Lock, 
  ShieldAlert, 
  RotateCw,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TrustStageNumber } from '../../contracts';

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
    guarantee: 'Speech transcript is untrusted user input. Claude proposes tools only.',
    icon: Bot,
  },
  {
    number: 2,
    name: '2. Server Validates',
    subtitle: 'Zod + Reference FX Quote',
    guarantee: 'Strict Zod schema parsing & deterministic 15-minute locked reference FX quote.',
    icon: ShieldCheck,
  },
  {
    number: 3,
    name: '3. Merchant Authorizes',
    subtitle: 'Explicit Human Approval',
    guarantee: 'Mandatory human confirmation (#CNF code). Zero unconfirmed financial mutations.',
    icon: CheckCircle2,
  },
  {
    number: 4,
    name: '4. PayPal Processes',
    subtitle: 'Sandbox Orders / Invoicing',
    guarantee: 'Authoritative server-side PayPal REST call with idempotency key.',
    icon: Send,
  },
  {
    number: 5,
    name: '5. Ledger Verifies',
    subtitle: 'Signed Webhook & Immutable Lock',
    guarantee: 'Flipping to VERIFIED_PAID only after cryptographic webhook verification.',
    icon: Lock,
  },
];

export const TrustBoundary: React.FC = () => {
  const { stageStates, stageReasons } = useAppStore();

  // Determine current active or highest completed stage
  const activeStage = STAGES.find(st => stageStates[st.number] === 'active') ||
    [...STAGES].reverse().find(st => stageStates[st.number] === 'done') ||
    STAGES[0];

  const activeNumber = activeStage.number;
  const isAnyBlocked = Object.values(stageStates).some(s => s === 'blocked');

  return (
    <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 md:px-6 py-3 select-none">
      {/* --- Desktop Layout (>= 768px): Spacious 5-Stage Workflow Bar --- */}
      <div className="hidden md:flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] shrink-0">
          <span className={`w-2 h-2 rounded-full ${isAnyBlocked ? 'bg-[var(--accent-coral)]' : 'bg-[var(--accent-emerald)]'} animate-pulse`} />
          <span className="font-mono">Trust Boundary:</span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end max-w-4xl">
          {STAGES.map((st, idx) => {
            const state = stageStates[st.number] || 'idle';
            const reason = stageReasons[st.number];
            const Icon = st.icon;

            const isDone = state === 'done';
            const isActive = state === 'active';
            const isBlocked = state === 'blocked';

            return (
              <React.Fragment key={st.number}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all relative ${
                    isBlocked
                      ? 'border-red-500/40 bg-red-500/10 text-red-300 font-semibold'
                      : isDone
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-medium'
                      : isActive
                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-200 font-semibold ring-1 ring-blue-500/30 shadow-sm'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
                  }`}
                  title={`${st.guarantee}${reason ? ` (${reason})` : ''}`}
                >
                  {isBlocked ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                  )}

                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-[11px] leading-tight truncate">
                      {st.name}
                    </span>
                    <span className="text-[9px] text-[var(--text-tertiary)] truncate">
                      {st.subtitle}
                    </span>
                  </div>
                </div>

                {idx < STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* --- Mobile Layout (< 768px): Compact Non-Overlapping Stepper --- */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAnyBlocked ? 'bg-[var(--accent-coral)]' : 'bg-[var(--accent-emerald)]'} animate-pulse`} />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Stage {activeNumber} of 5: {activeStage.name.split('. ')[1]}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
            {stageStates[activeNumber] || 'IDLE'}
          </span>
        </div>

        {/* 5-Segment Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
          {STAGES.map((st) => {
            const state = stageStates[st.number] || 'idle';
            const isDone = state === 'done';
            const isActive = state === 'active';
            const isBlocked = state === 'blocked';

            return (
              <div
                key={st.number}
                className={`rounded-full transition-all ${
                  isBlocked
                    ? 'bg-red-500'
                    : isDone
                    ? 'bg-emerald-500'
                    : isActive
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-[var(--border-subtle)]'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
