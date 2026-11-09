import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Plus, 
  ExternalLink, 
  PackageCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PayPalTransaction } from '../../../types';
import { useAppStore } from '../../store/useAppStore';

interface ShipmentsViewProps {
  transactions: PayPalTransaction[];
  onAddTracking: (tx: PayPalTransaction) => void;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  transactions,
  onAddTracking,
}) => {
  const { setActiveView } = useAppStore();

  const shippedTxs = transactions.filter(t => t.shipment_status === 'SHIPPED');
  const unshippedPaid = transactions.filter(t => t.status === 'VERIFIED_PAID' && t.shipment_status !== 'SHIPPED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-blue-400" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Cross-Border Shipment Tracking (PayPal Shipping v1)
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Submitting shipment tracking to PayPal supports Seller Protection and accelerates access to held export funds.
          </p>
        </div>

        <button
          onClick={() => setActiveView('voice')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Stage Tracking via Voice</span>
        </button>
      </div>

      {/* Shipped Items List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Dispatched Global Shipments ({shippedTxs.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shippedTxs.map((tx) => (
            <div
              key={tx.id}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  {tx.carrier_code || 'DHL'}: #{tx.tracking_number}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SELLER PROTECTION ACTIVE</span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {tx.customer_name} ({tx.customer_country || 'United States'})
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {tx.item_name}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] text-xs flex items-center justify-between font-mono">
                <span className="text-[var(--text-secondary)]">Invoice Ref:</span>
                <span className="text-[var(--text-primary)] font-bold">{tx.paypal_invoice_id || tx.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unshipped Verified Orders */}
      {unshippedPaid.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Awaiting Tracking Submission ({unshippedPaid.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unshippedPaid.map((tx) => (
              <div
                key={tx.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-amber-500/30 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    {tx.customer_name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">
                    {tx.item_name}
                  </p>
                  <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                    ${tx.settlement_amount_usd.toFixed(2)} USD (Paid)
                  </span>
                </div>

                <button
                  onClick={() => onAddTracking(tx)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-all shadow-sm"
                >
                  + Add Tracking ID
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
