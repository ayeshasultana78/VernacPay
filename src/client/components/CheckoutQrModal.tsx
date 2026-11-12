import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ExternalLink, CheckCircle2, X, ShieldCheck, Clock } from 'lucide-react';
import { PayPalTransaction } from '../../types';

interface CheckoutQrModalProps {
  transaction: PayPalTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutQrModal: React.FC<CheckoutQrModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [captured, setCaptured] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  // Reset local capture state when switching transactions or reopening
  useEffect(() => {
    setCaptured(transaction?.status === 'VERIFIED_PAID');
  }, [transaction?.id, transaction?.status, isOpen]);

  // Synchronize React visibility with native top-layer <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && transaction) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, transaction]);

  // Poll order status every 2 seconds for live convergence while QR is scanned
  useEffect(() => {
    if (!isOpen || !transaction?.paypal_order_id || transaction.status === 'VERIFIED_PAID' || captured) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/paypal/order-status/${transaction.paypal_order_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'VERIFIED_PAID') {
            setCaptured(true);
            setTimeout(() => {
              onClose();
            }, 1800);
          }
        }
      } catch {
        // network polling fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, transaction, captured, onClose]);

  const isOutsideDialogCard = (e: React.PointerEvent<HTMLDialogElement>, dialog: HTMLDialogElement) => {
    const rect = dialog.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  if (!isOpen || !transaction) return null;

  const isPaid = transaction.status === 'VERIFIED_PAID' || captured;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="checkout-qr-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        const dialog = dialogRef.current;
        pressedOutsideRef.current = dialog ? isOutsideDialogCard(e, dialog) : false;
      }}
      onPointerUp={(e) => {
        const dialog = dialogRef.current;
        if (pressedOutsideRef.current && dialog && isOutsideDialogCard(e, dialog)) {
          onClose();
        }
        pressedOutsideRef.current = false;
      }}
      className="m-auto w-full max-w-md bg-transparent p-4 border-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full p-6 shadow-2xl relative text-slate-100">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close Live PayPal Checkout Modal"
          className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex p-3 bg-paypal-blue/20 border border-paypal-lightBlue/40 rounded-2xl text-paypal-lightBlue mb-2">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 id="checkout-qr-modal-title" className="text-lg font-bold text-white">
            Live PayPal Sandbox QR &amp; Checkout
          </h3>
          <p className="text-xs text-slate-300">
            Scan via smartphone or open checkout link to complete real Sandbox payment
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-950/75 rounded-xl p-3.5 border border-slate-700/80 text-xs mb-4 space-y-2">
          <div className="flex justify-between gap-3">
            <span className="text-slate-300">Customer:</span>
            <span className="font-semibold text-white text-right">{transaction.customer_name}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-300">Item:</span>
            <span className="font-semibold text-white truncate max-w-[220px] text-right">{transaction.item_name}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-300">Amount Due:</span>
            <span className="font-extrabold text-emerald-300 tabular-nums text-right">
              ${transaction.settlement_amount_usd.toFixed(2)} USD (₹{transaction.spoken_amount_inr.toLocaleString('en-IN')})
            </span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-slate-300">Status:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${
              isPaid
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
            }`}>
              {isPaid ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> : <Clock className="w-3 h-3" aria-hidden="true" />}
              <span>{isPaid ? 'VERIFIED_PAID' : transaction.status}</span>
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner my-4">
          <img
            src={transaction.qr_code_base64 || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.sandbox.paypal.com'}
            alt="PayPal Sandbox QR Code"
            className="w-48 h-48 object-contain"
          />
          <div className="mt-2.5 text-[11px] text-slate-800 font-mono flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-paypal-blue" aria-hidden="true" />
            <span>Official PayPal Orders v2 Checkout Rail</span>
          </div>
        </div>

        {/* Action Link & Live Verification Notice */}
        <div className="space-y-3 mt-5">
          {transaction.approval_url && (
            <a
              href={transaction.approval_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-paypal-blue hover:bg-paypal-lightBlue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-paypal-blue/30"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span>Open in PayPal Sandbox Checkout</span>
            </a>
          )}

          <div className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 ${
            isPaid
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-950/70 border-slate-700 text-slate-200'
          }`}>
            {isPaid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Verified on PayPal &amp; recorded in authoritative ledger.</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-paypal-lightBlue shrink-0" aria-hidden="true" />
                <span>Awaiting authentic PayPal Sandbox buyer approval &amp; capture...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
};
