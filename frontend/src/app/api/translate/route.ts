import { NextRequest, NextResponse } from 'next/server';

/**
 * Indic language code mapping for Google Input Tools phonetic transliteration
 */
const INDIC_ITC_MAP: Record<string, string> = {
  hi: 'hi-t-i0-und',
  mr: 'mr-t-i0-und',
  gu: 'gu-t-i0-und',
  bn: 'bn-t-i0-und',
  ta: 'ta-t-i0-und',
  te: 'te-t-i0-und',
  pa: 'pa-t-i0-und',
};

/**
 * Translates a single text chunk via Google Translate GET API with fallback to Input Tools
 */
async function translateChunk(inputStr: string, targetLang: string): Promise<string> {
  const trimmed = inputStr?.trim();
  if (!trimmed || targetLang === 'en') return inputStr;

  // 1. Google Translate GTX via GET (fastest, supports markdown, punctuation, formatting)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: any) => (Array.isArray(item) ? item[0] : ''))
          .filter(Boolean)
          .join('');

        if (translated && translated.trim() !== trimmed) {
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Google GTX error:', err);
  }

  // 2. Fallback: If word contains English letters and target is Indic, transliterate (ideal for testing text, acronyms, Hinglish)
  if (/[a-zA-Z]/.test(trimmed) && INDIC_ITC_MAP[targetLang]) {
    try {
      const itc = INDIC_ITC_MAP[targetLang];
      const translitUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(
        trimmed
      )}&itc=${itc}&num=1`;

      const tRes = await fetch(translitUrl, { method: 'GET' });
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData[0] === 'SUCCESS' && tData[1]?.[0]?.[1]?.[0]) {
          return tData[1][0][1][0];
        }
      }
    } catch (err) {
      console.warn('Transliterate fallback error:', err);
    }
  }

  return inputStr;
}

/**
 * Handles multi-line or long article paragraphs
 */
async function translateFullText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || targetLang === 'en') return text;

  // If text contains paragraphs, translate each paragraph to preserve newlines and avoid length limits
  if (text.includes('\n')) {
    const paragraphs = text.split('\n');
    const translatedParagraphs = await Promise.all(
      paragraphs.map(async (para) => {
        if (!para.trim()) return para;
        return await translateChunk(para, targetLang);
      })
    );
    return translatedParagraphs.join('\n');
  }

  return await translateChunk(text, targetLang);
}

export async function POST(req: NextRequest) {
  try {
    const { text, texts, targetLang = 'hi' } = await req.json();

    if (targetLang === 'en') {
      return NextResponse.json({
        success: true,
        translatedText: text || '',
        translatedTexts: texts || [],
      });
    }

    if (Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map((t) => translateFullText(t, targetLang))
      );
      return NextResponse.json({
        success: true,
        translatedTexts: results,
      });
    }

    const translatedText = await translateFullText(text || '', targetLang);
    return NextResponse.json({
      success: true,
      translatedText,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
