import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, Landmark, AlertCircle, X } from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Indian Exporter Compliance Readiness</h2>
            <p className="text-xs text-slate-400">Regulatory checklist for cross-border PayPal receiving under RBI & DGFT guidelines</p>
          </div>
        </div>

        <div className="space-y-4 my-5 text-sm">
          <div className="flex items-start gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">PAN & KYC Verification (Active)</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Merchant PAN linked and verified with PayPal India to satisfy PMLA & RBI export compliance.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <Landmark className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Linked Indian Bank Account & Auto-Withdrawal (Active)</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Authorized scheduled auto-sweeps from PayPal USD/EUR/GBP balance into Indian Rupee (INR) bank account within 24-48 hours.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">RBI Export Purpose Code (P0102 - Handloom & Handicrafts)</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Every inward foreign remittance requires an RBI Purpose Code for automatic FIRC (Foreign Inward Remittance Certificate) generation.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">DGFT Import Export Code (IEC) (Required for Physical Goods)</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Physical export shipments (e.g. Pochampally sarees, Kalamkari textiles, brass crafts) must quote the 10-digit IEC on commercial invoices & postal declarations.
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>VernacPay-Global attaches mandatory Purpose Codes and IEC fields directly to all generated PayPal Sandbox invoices.</span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
