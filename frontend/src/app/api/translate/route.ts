import { NextRequest, NextResponse } from 'next/server';

// In-memory cache to prevent redundant API calls
const translationCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

function getCached(key: string): string | undefined {
  return translationCache.get(key);
}

function setCached(key: string, value: string): void {
  if (translationCache.size >= MAX_CACHE_SIZE) {
    const oldestKeys = Array.from(translationCache.keys()).slice(0, 200);
    oldestKeys.forEach((k) => translationCache.delete(k));
  }
  translationCache.set(key, value);
}

const ITC_MAP: Record<string, string> = {
  gu: 'gu-t-i0-und',
  hi: 'hi-t-i0-und',
  mr: 'mr-t-i0-und',
  bn: 'bn-t-i0-und',
  ta: 'ta-t-i0-und',
  te: 'te-t-i0-und',
  pa: 'pa-t-i0-und',
};

async function transliterateChunk(inputStr: string, targetLang: string): Promise<string> {
  const itc = ITC_MAP[targetLang];
  if (!itc) return inputStr;

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
      inputStr
    )}&itc=${itc}&num=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
        const words = data[1].map((item: any) => item[1]?.[0] || item[0]).join(' ');
        if (words && words.trim()) {
          return words;
        }
      }
    }
  } catch (err) {
    // Ignore transliterate error
  }
  return inputStr;
}

/**
 * Robust Translation of a text chunk (meaning-based primary, phonetic transliteration fallback)
 */
async function translateChunk(inputStr: string, targetLang: string): Promise<string> {
  const trimmed = inputStr?.trim();
  if (!trimmed || targetLang === 'en') return inputStr;

  const cacheKey = `${targetLang}:::${trimmed}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 1. Google Translate GTX via POST (Primary - handles large paragraphs, formatting, newlines)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      body: 'q=' + encodeURIComponent(trimmed),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: any) => (Array.isArray(item) ? item[0] : ''))
          .filter(Boolean)
          .join('');

        if (translated && translated.trim() && translated.trim().toLowerCase() !== trimmed.toLowerCase()) {
          setCached(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('[Translate API] Google GTX POST error:', err);
  }

  // 2. Google Translate GTX via GET (Secondary fallback)
  try {
    const getUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(trimmed.slice(0, 1800))}`;

    const res = await fetch(getUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((item: any) => (Array.isArray(item) ? item[0] : ''))
          .filter(Boolean)
          .join('');

        if (translated && translated.trim() && translated.trim().toLowerCase() !== trimmed.toLowerCase()) {
          setCached(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('[Translate API] Google GTX GET error:', err);
  }

  // 3. MyMemory Free API (Tertiary fallback for meaning translation)
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed.slice(0, 500)
    )}&langpair=en|${encodeURIComponent(targetLang)}`;

    const res = await fetch(mmUrl);
    if (res.ok) {
      const data: any = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        if (translated && translated.trim().toLowerCase() !== trimmed.toLowerCase()) {
          setCached(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('[Translate API] MyMemory error:', err);
  }

  // 4. Phonetic Transliteration Fallback:
  // If Google Translate returned unchanged text (e.g. for proper nouns, names, or keyboard test inputs like 'dzfgvzd'),
  // transliterate it phonetically into the target script (Gujarati, Hindi, etc.) so it always converts cleanly!
  try {
    const transliterated = await transliterateChunk(trimmed, targetLang);
    if (transliterated && transliterated.trim().toLowerCase() !== trimmed.toLowerCase()) {
      setCached(cacheKey, transliterated);
      return transliterated;
    }
  } catch (err) {
    // ignore
  }

  return inputStr;
}

/**
 * Splits large article text by paragraphs if necessary to respect length limits
 */
function chunkText(text: string, maxChunkSize = 2500): string[] {
  if (text.length <= maxChunkSize) return [text];

  const paragraphs = text.split('\n\n');
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxChunkSize && current.length > 0) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * Translates an entire article text, preserving markdown headers, lists, and line breaks
 */
async function translateFullText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || targetLang === 'en') return text;

  const chunks = chunkText(text, 2800);
  if (chunks.length === 1) {
    return await translateChunk(text, targetLang);
  }

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    const tr = await translateChunk(chunk, targetLang);
    translatedChunks.push(tr);
  }
  return translatedChunks.join('\n\n');
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
      const results: string[] = [];
      for (const t of texts) {
        const translated = await translateFullText(t, targetLang);
        results.push(translated);
      }
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
