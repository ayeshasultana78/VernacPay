import React from 'react';
import { ShieldCheck, Globe, Zap, ArrowRightLeft, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectSampleCommand: (key: string) => void;
  onOpenCompliance: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onSelectSampleCommand,
  onOpenCompliance,
  isLoading,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-paypal-blue via-paypal-lightBlue to-indic-saffron flex items-center justify-center font-black text-white text-xl shadow-lg shadow-paypal-blue/30">
            VP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                VernacPay-Global
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PAYPAL SANDBOX LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multilingual Voice-Native Agentic Commerce for Indian Artisans & Exporters
            </p>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* FX Ticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <ArrowRightLeft className="w-3.5 h-3.5 text-paypal-lightBlue" />
            <span className="font-medium">1 USD = ₹84.00 INR</span>
            <span className="text-[10px] text-slate-400 font-normal">(Illustrative Quote)</span>
          </div>

          {/* Compliance Badge */}
          <button
            onClick={onOpenCompliance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 transition-all hover:scale-102"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">RBI/IEC Compliance</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => onLanguageChange('te-IN')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                currentLanguage === 'te-IN'
                  ? 'bg-paypal-lightBlue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => onLanguageChange('hi-IN')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                currentLanguage === 'hi-IN'
                  ? 'bg-paypal-lightBlue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('en-IN')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                currentLanguage === 'en-IN'
                  ? 'bg-paypal-lightBlue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Sample Voice Command Simulator Ribbon */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge 1-Click Simulator:</span>
          </div>

          <button
            disabled={isLoading}
            onClick={() => onSelectSampleCommand('telugu_invoice_sarah')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-paypal-lightBlue text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🎤 <strong className="text-paypal-lightBlue">[Telugu]</strong> Invoice Sarah ₹12,000 (Pochampally Saree)</span>
          </button>

          <button
            disabled={isLoading}
            onClick={() => onSelectSampleCommand('hindi_tracking_emma')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-indic-saffron text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🎤 <strong className="text-amber-400">[Hindi]</strong> Add DHL tracking to Emma's paid order</span>
          </button>

          <button
            disabled={isLoading}
            onClick={() => onSelectSampleCommand('english_unpaid_remind')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🎤 <strong className="text-emerald-400">[English]</strong> Filter grid to unpaid & remind David</span>
          </button>
        </div>
      </div>
    </header>
  );
};
