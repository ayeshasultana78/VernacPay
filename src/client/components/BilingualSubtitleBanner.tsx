import React, { useEffect, useState } from 'react';
import { Languages, Loader2, Volume2 } from 'lucide-react';
import { LanguageCode } from '../../types';

interface BilingualSubtitleBannerProps {
  currentLanguage: LanguageCode;
  transcriptNative: string;
  transcriptEnglish: string;
  isLoading: boolean;
  isPlayingAudio?: boolean;
  onPlayAudio?: () => void;
  showPlayControl?: boolean;
  playLabel?: string;
}

const SAMPLE_NATIVE_BY_LANG: Record<LanguageCode, string> = {
  'te-IN': 'న్యూయార్క్ లో ఉన్న సారా కి 12,000 రూపాయల పేపాల్ ఆర్డర్ పంపండి',
  'hi-IN': 'न्यूयॉर्क में सारा को 12,000 रुपये का PayPal ऑर्डर भेजें',
  'ur-IN': 'نیویارک میں سارہ کو 12,000 روپے کا PayPal آرڈر بھیجیں',
  'en-IN': 'Send a ₹12,000 PayPal checkout order to Sarah in New York',
};

const SAMPLE_ENGLISH = 'Send a ₹12,000 ($142.86 USD) PayPal order to Sarah in New York';

/**
 * Stacked bilingual subtitle strip keeping native Indic script on top and
 * English translation below while retaining prior text during loads to avoid flicker.
 */
export const BilingualSubtitleBanner: React.FC<BilingualSubtitleBannerProps> = ({
  currentLanguage,
  transcriptNative,
  transcriptEnglish,
  isLoading,
  isPlayingAudio = false,
  onPlayAudio,
  showPlayControl = false,
  playLabel = 'Play Audio',
}) => {
  const [stableTranscript, setStableTranscript] = useState({ native: '', english: '' });

  useEffect(() => {
    const nextNative = transcriptNative.trim();
    const nextEnglish = transcriptEnglish.trim();
    if (nextNative || nextEnglish) {
      setStableTranscript((prev) => ({
        native: nextNative || prev.native,
        english: nextEnglish || prev.english,
      }));
    }
  }, [transcriptNative, transcriptEnglish]);

  const activeNative = transcriptNative.trim() || stableTranscript.native;
  const activeEnglish = transcriptEnglish.trim() || stableTranscript.english;
  const nativeScriptFont =
    currentLanguage === 'hi-IN'
      ? 'font-devanagari'
      : currentLanguage === 'te-IN'
      ? 'font-telugu'
      : '';

  return (
    <section
      aria-label="Bilingual Subtitle and Translation Banner"
      aria-live="polite"
      data-testid="bilingual-subtitle-banner"
      className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] overflow-hidden shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface-raised)] border-b border-[var(--border-medium)] text-xs font-semibold text-[var(--text-primary)]">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="uppercase tracking-wider">Bilingual Subtitle &amp; Translation Banner</span>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-200 bg-sky-950/90 border border-sky-400/50 px-2.5 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              <span>Translating...</span>
            </span>
          )}
          {showPlayControl && onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="text-sky-300 hover:text-white inline-flex items-center gap-1 font-medium text-xs transition-colors"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-emerald-300' : ''}`}
                aria-hidden="true"
              />
              <span>{isPlayingAudio ? 'Speaking...' : playLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Row: Native Language Script */}
      <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-medium)]">
        <div className="mb-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/50 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
            Native Script ({currentLanguage})
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-medium)] min-h-[3.5rem] flex items-center">
          <p
            className={`text-base font-semibold leading-relaxed ${nativeScriptFont} ${
              activeNative ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] italic font-normal text-sm'
            }`}
          >
            {activeNative ? `"${activeNative}"` : `Sample: "${SAMPLE_NATIVE_BY_LANG[currentLanguage]}"`}
          </p>
        </div>
      </div>

      {/* Bottom Row: English Translation */}
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="mb-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/50 text-[11px] font-semibold uppercase tracking-wider text-sky-200">
            English Translation
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-surface-sunken)] border border-[var(--border-medium)] min-h-[3.25rem] flex items-center">
          <p
            className={`text-sm font-medium leading-relaxed ${
              activeEnglish ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] italic font-normal'
            }`}
          >
            {activeEnglish ? `"${activeEnglish}"` : `Sample: "${SAMPLE_ENGLISH}"`}
          </p>
        </div>
      </div>
    </section>
  );
};
