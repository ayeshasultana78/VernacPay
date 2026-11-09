import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Bot,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { LanguageCode, StagedConfirmation } from '../../../types';
import { useAppStore } from '../../store/useAppStore';

interface VoiceStudioViewProps {
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
  onSendPreset: (presetKey: string) => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
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
  onSendPreset,
}) => {
  const { language, setLanguage } = useAppStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Expiration countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);

  useEffect(() => {
    if (!stagedConfirmation) return;
    const expiry = new Date(stagedConfirmation.expires_at).getTime();
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [stagedConfirmation]);

  const playAudio = (base64: string) => {
    try {
      if (!base64) {
        if ('speechSynthesis' in window && transcriptNative) {
          const utterance = new SpeechSynthesisUtterance(transcriptNative);
          utterance.lang = currentLanguage;
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
      const audioUrl = `data:audio/wav;base64,${base64}`;
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Title & Language Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              VernacPay Indic Voice Studio
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Powered by Sarvam AI Saaras STT & Bulbul TTS + Claude 3.7 Sonnet Function Calling
          </p>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
          {[
            { id: 'te-IN', label: 'తెలుగు' },
            { id: 'hi-IN', label: 'हिंदी' },
            { id: 'ur-IN', label: 'اردو' },
            { id: 'en-IN', label: 'English' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id as LanguageCode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                language === l.id
                  ? 'bg-[var(--accent-emerald)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-highlight)]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Central Voice Recording Stage */}
      <div className="p-8 md:p-12 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center relative overflow-hidden text-center shadow-xl">
        {/* Subtle Waveform Animation */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-emerald-500/10 animate-ping" />
            <div className="w-80 h-80 rounded-full bg-teal-500/5 animate-pulse" />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-blue-500/20 animate-spin" />
          </div>
        )}

        {/* Voice Orb Button */}
        <button
          onClick={onToggleRecord}
          disabled={isLoading}
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 ${
            isRecording
              ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/40 scale-105 ring-4 ring-rose-500/30'
              : isLoading
              ? 'bg-slate-800 text-blue-300 ring-2 ring-blue-500/30'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 hover:scale-105 shadow-emerald-500/30'
          }`}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording Voice'}
        >
          {isRecording ? (
            <>
              <MicOff className="w-9 h-9 animate-bounce" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Listening</span>
            </>
          ) : isLoading ? (
            <>
              <RotateCw className="w-9 h-9 animate-spin" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Parsing</span>
            </>
          ) : (
            <>
              <Mic className="w-9 h-9" />
              <span className="text-[10px] font-black mt-1 uppercase tracking-wider">Speak</span>
            </>
          )}
        </button>

        <p className="relative z-10 text-xs md:text-sm text-[var(--text-secondary)] mt-5 max-w-md">
          {isRecording
            ? 'Listening to speech... Speak your cross-border invoice, shipment, or reminder.'
            : isLoading
            ? 'Transcribing Indic audio & validating schema boundaries...'
            : 'Tap the microphone or choose a verified test utterance below.'}
        </p>

        {/* Demo Preset Pills */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase mr-1">
            Presets:
          </span>
          <button
            onClick={() => onSendPreset('telugu_invoice_sarah')}
            className="px-3 py-1.5 rounded-full bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-all font-telugu"
          >
            🇮🇳 Telugu Saree (₹12,000)
          </button>
          <button
            onClick={() => onSendPreset('hindi_tracking_emma')}
            className="px-3 py-1.5 rounded-full bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-all font-devanagari"
          >
            🇮🇳 Hindi DHL Tracking
          </button>
          <button
            onClick={() => onSendPreset('english_unpaid_remind')}
            className="px-3 py-1.5 rounded-full bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-all"
          >
            🇬🇧 Unpaid Invoices & Remind
          </button>
        </div>
      </div>

      {/* Bilingual Subtitle & Translation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Native Indic Transcript Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Native Indic Transcript ({language})</span>
            </span>
            {ttsAudioBase64 && (
              <button
                onClick={() => playAudio(ttsAudioBase64)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play TTS</span>
              </button>
            )}
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] min-h-[80px]">
            {transcriptNative ? (
              <p className="text-sm md:text-base font-telugu font-medium text-[var(--text-primary)] leading-relaxed">
                "{transcriptNative}"
              </p>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Awaiting voice input in Telugu, Hindi, Urdu, or English...
              </p>
            )}
          </div>
        </div>

        {/* English Translation Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              English Translation (PayPal LLM Tool Ingestion)
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] min-h-[80px]">
            {transcriptEnglish ? (
              <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                "{transcriptEnglish}"
              </p>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Speech will be translated in real time for Claude 3.7 Sonnet tool dispatch...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Staged Confirmation Card (Human-in-the-Loop Approval Required) */}
      {stagedConfirmation && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border-2 border-amber-500/40 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                  Stage 3: Merchant Authorization Required
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">
                  AI proposed action. Zero financial mutations occur until you explicitly approve.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] text-amber-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Expires in {formatSeconds(secondsRemaining)}</span>
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30">
                {stagedConfirmation.auth_code}
              </span>
            </div>
          </div>

          {/* Staged Payload Review */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-subtle)] text-xs">
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">Customer</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{stagedConfirmation.customer_name || 'Sarah'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">Item / Goods</span>
              <span className="font-bold text-[var(--text-primary)] truncate block">{stagedConfirmation.item_name || 'Handicrafts'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">Spoken Base</span>
              <span className="font-mono font-bold text-amber-400 text-sm">₹{stagedConfirmation.spoken_amount_inr?.toLocaleString('en-IN') || '12,000'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">Settled PayPal USD</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">${stagedConfirmation.settlement_amount_usd?.toFixed(2) || '142.86'}</span>
            </div>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onCancelStaged(stagedConfirmation.auth_code)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--bg-surface-raised)] hover:bg-red-500/10 hover:text-red-400 border border-[var(--border-subtle)] hover:border-red-500/30 text-xs font-semibold text-[var(--text-secondary)] transition-all"
            >
              Cancel & Discard
            </button>
            <button
              onClick={() => onConfirmStaged(stagedConfirmation.auth_code)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Authorize & Execute on PayPal Sandbox</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
