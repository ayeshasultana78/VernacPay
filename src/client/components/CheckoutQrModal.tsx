import React, { useState } from 'react';
import { QrCode, ExternalLink, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react';
import { PayPalTransaction } from '../../types';

interface CheckoutQrModalProps {
  transaction: PayPalTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateCapture: (tx: PayPalTransaction) => Promise<void>;
}

export const CheckoutQrModal: React.FC<CheckoutQrModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSimulateCapture,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSimulate = async () => {
    setIsCapturing(true);
    try {
      await onSimulateCapture(transaction);
      setCaptured(true);
      setTimeout(() => {
        setIsCapturing(false);
      }, 1000);
    } catch (err) {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex p-3 bg-paypal-blue/20 border border-paypal-lightBlue/30 rounded-2xl text-paypal-lightBlue mb-2">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Live PayPal Sandbox QR & Checkout</h3>
          <p className="text-xs text-slate-400">
            Scan via smartphone or click link to complete Sandbox payment
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-xs mb-4 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Customer:</span>
            <span className="font-semibold text-white">{transaction.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Item:</span>
            <span className="font-semibold text-white truncate max-w-[200px]">{transaction.item_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount Due:</span>
            <span className="font-extrabold text-emerald-400">
              ${transaction.settlement_amount_usd.toFixed(2)} USD (₹{transaction.spoken_amount_inr.toLocaleString('en-IN')})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
              transaction.status === 'VERIFIED_PAID'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {transaction.status}
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
          <div className="mt-2 text-[10px] text-slate-600 font-mono flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-paypal-blue" />
            <span>Official PayPal Invoicing v2 QR Rail</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-5">
          {transaction.approval_url && (
            <a
              href={transaction.approval_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-paypal-blue hover:bg-paypal-lightBlue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-paypal-blue/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in PayPal Sandbox Checkout</span>
            </a>
          )}

          {/* Simulate Payment Capture Helper */}
          <button
            onClick={handleSimulate}
            disabled={isCapturing || transaction.status === 'VERIFIED_PAID'}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              {isCapturing ? 'Verifying Webhook...' : transaction.status === 'VERIFIED_PAID' ? 'Verified Paid ✓' : '[Simulate Buyer Sandbox Capture]'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
