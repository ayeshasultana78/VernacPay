import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Send, 
  QrCode, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { PayPalTransaction } from '../../../types';
import { useAppStore } from '../../store/useAppStore';

interface InvoicesViewProps {
  transactions: PayPalTransaction[];
  onOpenQrModal: (tx: PayPalTransaction) => void;
  onSendReminder: (tx: PayPalTransaction) => void;
  onSendPreset: (presetKey: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  transactions,
  onOpenQrModal,
  onSendReminder,
  onSendPreset,
}) => {
  const { setActiveView } = useAppStore();

  const invoiceTxs = transactions.filter(t => t.paypal_rail === 'INVOICE' || Boolean(t.paypal_invoice_id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              PayPal Invoicing v2 Management
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Create, send, track, and remind cross-border export invoices with instant QR generation.
          </p>
        </div>

        <button
          onClick={() => setActiveView('voice')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-emerald)] hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Stage New Invoice via Voice</span>
        </button>
      </div>

      {/* Invoices List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoiceTxs.map((inv) => (
          <div
            key={inv.id}
            className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-blue-400">
                  {inv.paypal_invoice_id || inv.id.slice(0, 12)}
                </span>
                {inv.status === 'VERIFIED_PAID' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PAID</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3 h-3" />
                    <span>AWAITING BUYER</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {inv.customer_name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                {inv.item_name}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-base font-mono font-bold text-emerald-400 block tabular-nums">
                  ${inv.settlement_amount_usd.toFixed(2)} USD
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                  ₹{inv.spoken_amount_inr.toLocaleString('en-IN')} INR
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenQrModal(inv)}
                  className="p-2 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] text-blue-400 border border-[var(--border-subtle)]"
                  title="View PayPal QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                {inv.status === 'AWAITING_BUYER' && (
                  <button
                    onClick={() => onSendReminder(inv)}
                    className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30"
                    title="Send Reminder"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
