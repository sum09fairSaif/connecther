import { Router } from 'express';

const router = Router();

type TtsRequestBody = {
  text?: string;
  language?: string;
  voiceId?: string;
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  hi: 'Hindi',
  ar: 'Arabic',
  ur: 'Urdu',
  bn: 'Bengali',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
  tr: 'Turkish',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  el: 'Greek',
  he: 'Hebrew',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  ro: 'Romanian',
  cs: 'Czech',
  hu: 'Hungarian',
  uk: 'Ukrainian',
};

function normalizeLanguageCode(language?: string): string {
  if (!language || typeof language !== 'string') return 'en';
  return language.trim().toLowerCase().split('-')[0] || 'en';
}

function getLanguageName(languageCode: string): string {
  return LANGUAGE_NAMES[languageCode] || languageCode;
}

function extractOpenAiText(payload: any): string {
  const direct = typeof payload?.output_text === 'string' ? payload.output_text.trim() : '';
  if (direct) return direct;

  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (typeof block?.text === 'string' && block.text.trim()) {
        return block.text.trim();
      }
    }
  }

  return '';
}

async function translateTextIfNeeded(inputText: string, targetLanguageCode: string): Promise<string> {
  if (targetLanguageCode === 'en') {
    return inputText;
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for non-English audio. Add it to backend/.env or use English audio.'
    );
  }

  const targetLanguageName = getLanguageName(targetLanguageCode);
  const requestBody = {
    model: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content:
          'You are a translation engine. Return only translated text, with no notes, labels, or quotes.',
      },
      {
        role: 'user',
        content: `Translate this text to ${targetLanguageName} (${targetLanguageCode}):\n\n${inputText}`,
      },
    ],
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(
      details || `OpenAI translation request failed with status ${response.status}.`
    );
  }

  const payload = (await response.json()) as any;
  const translated = extractOpenAiText(payload);
  if (!translated) {
    throw new Error(
      `Translation failed for language "${targetLanguageCode}". Empty translated text.`
    );
  }
  return translated;
}

// POST /api/tts
router.post('/', async (req, res) => {
  try {
    const { text, language, voiceId } = (req.body || {}) as TtsRequestBody;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Text-to-speech is not configured on the server.',
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text is required.',
      });
    }

    const selectedVoiceId =
      voiceId || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
    const normalizedLanguage = normalizeLanguageCode(language);
    let textForSpeech = text.trim();
    if (normalizedLanguage !== 'en') {
      try {
        textForSpeech = await translateTextIfNeeded(text.trim(), normalizedLanguage);
      } catch (translationError) {
        // Keep audio available even when translation provider fails or quota is exhausted.
        console.warn('Translation failed, falling back to English text:', translationError);
      }
    }
    const payload = {
      text: textForSpeech,
      model_id: modelId,
      language_code: normalizedLanguage,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
      },
    };

    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!upstream.ok) {
      const details = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({
        success: false,
        error:
          details ||
          `ElevenLabs request failed with status ${upstream.status}. Check ELEVENLABS_API_KEY and voice/model settings.`,
      });
    }

    const audioBuffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.send(audioBuffer);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate speech.',
    });
  }
});

export default router;
