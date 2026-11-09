import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Truck, 
  ShieldCheck, 
  ArrowUpRight, 
  Mic, 
  ReceiptText, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import { PayPalTransaction, StagedConfirmation } from '../../../types';
import { useAppStore } from '../../store/useAppStore';

interface OverviewViewProps {
  transactions: PayPalTransaction[];
  onOpenQrModal: (tx: PayPalTransaction) => void;
  onSendPreset: (presetKey: string) => void;
  isLoadingVoice: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  transactions,
  onOpenQrModal,
  onSendPreset,
  isLoadingVoice,
}) => {
  const { setActiveView, backendConfig } = useAppStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const buyerEmail = backendConfig?.sandboxBuyer?.email || 'sb-pj4347w53813178@personal.example.com';
  const buyerPassword = backendConfig?.sandboxBuyer?.password || '[Configured in Environment]';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Metrics
  const verifiedTxs = transactions.filter(t => t.status === 'VERIFIED_PAID');
  const totalVerifiedUsd = verifiedTxs.reduce((sum, t) => sum + t.settlement_amount_usd, 0);
  const totalVerifiedInr = verifiedTxs.reduce((sum, t) => sum + t.spoken_amount_inr, 0);

  const pendingTxs = transactions.filter(t => t.status === 'AWAITING_BUYER' || t.status === 'PENDING_APPROVAL');
  const totalPendingUsd = pendingTxs.reduce((sum, t) => sum + t.settlement_amount_usd, 0);

  const shippedCount = transactions.filter(t => t.shipment_status === 'SHIPPED').length;

  const isLive = backendConfig?.isLivePayPal || backendConfig?.appMode === 'SANDBOX' || backendConfig?.appMode === 'PRODUCTION';

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Top Banner: Welcome & Quick Launch */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-raised)] to-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)]" />
            <span className="text-xs font-mono font-semibold text-[var(--accent-emerald)] uppercase tracking-wider">
              Artisan Export Operations
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Lakshmi Handlooms & Crafts Command Center
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Empowering vernacular artisans to issue PayPal Orders v2 cross-border payments with instant scannable QR codes, and lock verified double-entry ledgers via Indic speech.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('voice')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Open Voice Studio</span>
          </button>
          <button
            onClick={() => setActiveView('transactions')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface-highlight)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] transition-all"
          >
            <ReceiptText className="w-4 h-4" />
            <span>View Full Ledger</span>
          </button>
        </div>
      </div>

      {/* --- TEST AS A JUDGE PANEL --- */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-surface-raised)] via-[var(--bg-surface)] to-[var(--bg-surface-raised)] border-2 border-indigo-500/30 shadow-xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Hackathon Reviewer & Judge Test Panel
                </h2>
                {isLive ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    PAYPAL LIVE SANDBOX
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    LOCAL DEMO SIMULATOR
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Execute a 1-click Indic voice command below, tap <b>Approve</b> to generate a scannable PayPal order & QR, and test checkout using the sandbox buyer account.
              </p>
            </div>
          </div>

          {/* 1-Click Sandbox Buyer Credentials */}
          <div className="flex flex-wrap items-center gap-2 bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-tertiary)]">Buyer:</span>
              <code className="font-mono text-[11px] text-indigo-300 select-all">{buyerEmail}</code>
              <button
                onClick={() => copyToClipboard(buyerEmail, 'email')}
                className="p-1 hover:bg-[var(--bg-surface-raised)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Copy Buyer Email"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[var(--border-subtle)]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-tertiary)]">Pass:</span>
              <code className="font-mono text-[11px] text-indigo-300 select-all">{buyerPassword}</code>
              <button
                onClick={() => copyToClipboard(buyerPassword, 'pass')}
                className="p-1 hover:bg-[var(--bg-surface-raised)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Copy Buyer Password"
              >
                {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Sample Voice Actions (Telugu, Hindi, English, Urdu) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Telugu */}
          <button
            onClick={() => onSendPreset('telugu_order_sarah')}
            disabled={isLoadingVoice}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-highlight)] border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                తెలుగు (Telugu)
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="text-xs font-telugu font-semibold text-[var(--text-primary)] line-clamp-2 mt-1">
              "సారా కి పోచంపల్లి పట్టు చీర కోసం ₹12,000 పేపాల్ ఆర్డర్ పంపండి"
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
              Order for Sarah: ₹12,000 → $142.86 USD
            </div>
          </button>

          {/* 2. Hindi */}
          <button
            onClick={() => onSendPreset('hindi_order_rahul')}
            disabled={isLoadingVoice}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-highlight)] border border-blue-500/20 hover:border-blue-500/40 text-left transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-semibold">
                हिंदी (Hindi)
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-xs font-devanagari font-semibold text-[var(--text-primary)] line-clamp-2 mt-1">
              "राहुल के लिए पीतल के बर्तन के लिए ₹4,200 का पेपाल ऑर्डर बनाएं"
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
              Order for Rahul: ₹4,200 → $50.00 USD
            </div>
          </button>

          {/* 3. English */}
          <button
            onClick={() => onSendPreset('english_order_emily')}
            disabled={isLoadingVoice}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-highlight)] border border-purple-500/20 hover:border-purple-500/40 text-left transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-semibold">
                English (India)
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mt-1">
              "Create PayPal order for Emily: ₹8,400 for handcrafted woodwork"
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
              Order for Emily: ₹8,400 → $100.00 USD
            </div>
          </button>

          {/* 4. Urdu (Text-only honesty) */}
          <button
            onClick={() => onSendPreset('urdu_order_zainab')}
            disabled={isLoadingVoice}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-highlight)] border border-amber-500/20 hover:border-amber-500/40 text-left transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                اردو (Urdu)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 uppercase">
                Text-Only
              </span>
            </div>
            <div className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mt-1 dir-rtl text-right">
              "زینب کے لیے ہاتھ سے بنی قالین کے لیے ₹15,000 کا آرڈر بنائیں"
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
              Order for Zainab: ₹15,000 → $178.57 USD (Sarvam TTS has no Urdu audio)
            </div>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Verified Payments */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Verified (USD)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            ${totalVerifiedUsd.toFixed(2)}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
            ₹{totalVerifiedInr.toLocaleString('en-IN')} Spoken INR
          </div>
        </div>

        {/* Metric 2: Pending Collections */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
            ${totalPendingUsd.toFixed(2)}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {pendingTxs.length} orders awaiting buyer payment
          </div>
        </div>

        {/* Metric 3: Active FX Reference */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Locked Reference Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-blue-400 tabular-nums">
            ₹{backendConfig?.fxRate.toFixed(2) || '84.00'}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            Deterministic code engine (1 USD)
          </div>
        </div>

        {/* Metric 4: Trust Boundary Level */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Trust Boundary
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-teal-300">
            5-Stage Hard Guard
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            Zero autonomous fund movement
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-[var(--text-secondary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Recent Cross-Border Transactions
            </h2>
          </div>
          <button
            onClick={() => setActiveView('transactions')}
            className="text-xs font-semibold text-[var(--accent-emerald)] hover:underline flex items-center gap-1"
          >
            <span>Open AG Grid Command Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <th className="pb-3 font-semibold uppercase text-[10px]">Reference</th>
                <th className="pb-3 font-semibold uppercase text-[10px]">Buyer</th>
                <th className="pb-3 font-semibold uppercase text-[10px]">Item</th>
                <th className="pb-3 font-semibold uppercase text-[10px]">Amount</th>
                <th className="pb-3 font-semibold uppercase text-[10px]">Status</th>
                <th className="pb-3 font-semibold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--bg-surface-raised)] transition-colors">
                  <td className="py-3 font-mono font-medium text-[var(--text-primary)]">
                    {tx.paypal_invoice_id || tx.paypal_order_id || tx.id.slice(0, 12)}
                  </td>
                  <td className="py-3 font-medium text-[var(--text-primary)]">
                    {tx.customer_name}
                  </td>
                  <td className="py-3 text-[var(--text-secondary)] max-w-xs truncate">
                    {tx.item_name}
                  </td>
                  <td className="py-3 font-mono">
                    <span className="font-bold text-emerald-400">${tx.settlement_amount_usd.toFixed(2)} USD</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">₹{tx.spoken_amount_inr.toLocaleString('en-IN')} INR</span>
                  </td>
                  <td className="py-3">
                    {tx.status === 'VERIFIED_PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED PAID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>AWAITING BUYER</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onOpenQrModal(tx)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-highlight)] hover:bg-[var(--bg-surface-sunken)] text-[11px] font-medium text-[var(--accent-blue)] border border-[var(--border-subtle)]"
                    >
                      View QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
