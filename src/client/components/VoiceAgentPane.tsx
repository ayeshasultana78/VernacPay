import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, CheckCircle, XCircle, Clock, Send, Sparkles } from 'lucide-react';
import { LanguageCode, StagedConfirmation } from '../../types';

interface VoiceAgentPaneProps {
  currentLanguage: LanguageCode;
  isRecording: boolean;
  onToggleRecord: () => void;
  isLoading: boolean;
  transcriptNative: string;
  transcriptEnglish: string;
  stagedConfirmation: StagedConfirmation | null;
  onConfirmStaged: (authCode: string) => void;
  onCancelStaged: (authCode: string) => void;
  ttsAudioBase64?: string;
}

export const VoiceAgentPane: React.FC<VoiceAgentPaneProps> = ({
  currentLanguage,
  isRecording,
  onToggleRecord,
  isLoading,
  transcriptNative,
  transcriptEnglish,
  stagedConfirmation,
  onConfirmStaged,
  onCancelStaged,
  ttsAudioBase64,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play synthesized audio when new TTS audio is received
  useEffect(() => {
    if (ttsAudioBase64) {
      playAudio(ttsAudioBase64);
    }
  }, [ttsAudioBase64]);

  const playAudio = (base64: string) => {
    try {
      if (!base64) {
        // Fallback to browser Web Speech API
        if ('speechSynthesis' in window && transcriptNative) {
          const utterance = new SpeechSynthesisUtterance(transcriptNative);
          utterance.lang = currentLanguage;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
      const audioUrl = `data:audio/wav;base64,${base64}`;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col gap-5 h-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indic-saffron animate-ping" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Conversational Voice & Trust Agent
          </h2>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          Sarvam AI (Saaras + Bulbul)
        </span>
      </div>

      {/* Voice Orb & Mic Control */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/50 rounded-2xl border border-slate-800/80 relative overflow-hidden">
        {/* Animated Glow Rings when recording or processing */}
        {isRecording && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-indic-saffron/20 animate-ping" />
            <div className="absolute w-48 h-48 rounded-full bg-indic-saffron/10 animate-pulse" />
          </>
        )}
        {isLoading && (
          <div className="absolute w-40 h-40 rounded-full bg-paypal-lightBlue/20 animate-spin" />
        )}

        {/* The Voice Orb */}
        <button
          onClick={onToggleRecord}
          disabled={isLoading}
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 ${
            isRecording
              ? 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-500/40 scale-105'
              : isLoading
              ? 'bg-slate-800 border-2 border-paypal-lightBlue shadow-paypal-blue/30'
              : 'bg-gradient-to-tr from-paypal-blue via-paypal-lightBlue to-indic-navy shadow-paypal-blue/40 hover:scale-105'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-9 h-9 text-white animate-pulse" />
          ) : (
            <Mic className="w-9 h-9 text-white" />
          )}
          <span className="text-[10px] font-semibold text-white/90 mt-1">
            {isRecording ? 'Listening...' : isLoading ? 'Validating...' : 'Tap to Speak'}
          </span>
        </button>

        <p className="text-xs text-slate-400 mt-4 text-center">
          {isRecording
            ? `Listening in ${currentLanguage === 'te-IN' ? 'Telugu (తెలుగు)' : currentLanguage === 'hi-IN' ? 'Hindi (हिंदी)' : 'English'}... Speak naturally.`
            : 'Speak export invoice, tracking, or reminder commands in your language.'}
        </p>
      </div>

      {/* Bilingual Subtitle Strip */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Bilingual Subtitle & Translation Strip</span>
          {transcriptNative && (
            <button
              onClick={() => playAudio(ttsAudioBase64 || '')}
              className="text-paypal-lightBlue hover:text-white flex items-center gap-1 normal-case font-normal text-xs transition-colors"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>{isPlayingAudio ? 'Speaking...' : 'Play Audio'}</span>
            </button>
          )}
        </div>

        {/* Native Language Script Subtitle */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-amber-400/90 font-medium mb-1">
            Native Indic Transcript ({currentLanguage}):
          </div>
          <div className="text-sm font-medium text-slate-100 min-h-[22px]">
            {transcriptNative || <span className="text-slate-500 italic">"సారా కి 12,000 రూపాయల ఇన్వాయిస్ పంపండి..."</span>}
          </div>
        </div>

        {/* English Translation Subtitle */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-paypal-lightBlue font-medium mb-1">
            English Translation (For International PayPal Judges):
          </div>
          <div className="text-xs font-normal text-slate-300 min-h-[20px]">
            {transcriptEnglish || <span className="text-slate-500 italic">"Send a PayPal invoice to Sarah for ₹12,000..."</span>}
          </div>
        </div>
      </div>

      {/* Dual-Mode Staged Confirmation Card (Gate 3) */}
      {stagedConfirmation && stagedConfirmation.status === 'PENDING_APPROVAL' && (
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border-2 border-emerald-500/50 p-5 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">
                Merchant Authorization Required
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {stagedConfirmation.auth_code}
            </span>
          </div>

          {/* Staged Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Buyer Name:</span>
              <span className="font-semibold text-white text-sm">{stagedConfirmation.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Product / Action:</span>
              <span className="font-semibold text-white truncate block">{stagedConfirmation.item_name}</span>
            </div>

            {stagedConfirmation.spoken_amount_inr && (
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-amber-300 block font-medium">Spoken Domestic Base:</span>
                <span className="text-base font-extrabold text-amber-400">
                  ₹{stagedConfirmation.spoken_amount_inr.toLocaleString('en-IN')} INR
                </span>
              </div>
            )}

            {stagedConfirmation.settlement_amount_usd && (
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-emerald-300 block font-medium">PayPal Invoice Amount:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ${stagedConfirmation.settlement_amount_usd.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-slate-400 block">Illustrative FX @ ₹84.00</span>
              </div>
            )}
          </div>

          {/* Notice on Shipping if tracking */}
          {stagedConfirmation.tool_name === 'stage_shipment_tracking' && (
            <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              ℹ️ Submitting tracking supports PayPal Seller Protection and can help accelerate access to held funds.
            </div>
          )}

          {/* Dual Authorization Controls */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Confirm: Speak <strong>"Avunu / Haan / Yes"</strong> OR click below:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onConfirmStaged(stagedConfirmation.auth_code)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-101 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>[Approve & Send via PayPal Sandbox]</span>
              </button>

              <button
                onClick={() => onCancelStaged(stagedConfirmation.auth_code)}
                disabled={isLoading}
                className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold text-xs flex items-center justify-center transition-colors"
                title="Cancel staged action"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
