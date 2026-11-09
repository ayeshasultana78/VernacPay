import { describe, it, expect } from 'vitest';
import dotenv from 'dotenv';
import { sarvamService } from '../../src/server/services/sarvamService.js';

dotenv.config();

describe('[LIVE INTEGRATION] Real Sarvam AI Indic Speech Suite', () => {
  let synthesizedAudioBase64 = '';
  let rawTeluguTranscript = '';

  it('synthesizes real Telugu speech audio via Bulbul:v3', async () => {
    const text = 'సారా కి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఆర్డర్ పంపండి';
    const result = await sarvamService.synthesizeSpeech({
      text,
      languageCode: 'te-IN',
    });

    expect(result.audio_base64).toBeDefined();
    expect(result.audio_base64.length).toBeGreaterThan(1000);
    synthesizedAudioBase64 = result.audio_base64;
    console.log('[LIVE TEST] Synthesized Telugu audio bytes:', Buffer.from(synthesizedAudioBase64, 'base64').length);
  });

  it('transcribes real Telugu audio via Saaras:v3 and translates to English', async () => {
    expect(synthesizedAudioBase64.length).toBeGreaterThan(0);
    const audioBuffer = Buffer.from(synthesizedAudioBase64, 'base64');

    const result = await sarvamService.transcribeAudio({
      audioBuffer,
      mimeType: 'audio/wav',
      languageCode: 'te-IN',
    });

    expect(result.transcript_native).toBeDefined();
    expect(result.transcript_native.length).toBeGreaterThan(5);
    rawTeluguTranscript = result.transcript_native;
    console.log('[LIVE TEST] Raw Telugu Transcript:', rawTeluguTranscript);

    expect(result.transcript_english_translation).toBeDefined();
    expect(result.transcript_english_translation.toLowerCase()).toContain('saree');
    console.log('[LIVE TEST] Translated English:', result.transcript_english_translation);
  });

  it('translates Telugu directly to English via Sarvam Translate API', async () => {
    const translation = await sarvamService.translateToEnglish(
      'సారా కి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఆర్డర్ పంపండి',
      'te-IN'
    );
    expect(translation).toBeDefined();
    expect(translation.toLowerCase()).toContain('saree');
    console.log('[LIVE TEST] Direct Sarvam Translate:', translation);
  });
});
