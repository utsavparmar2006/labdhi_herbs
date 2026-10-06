import { Request, Response } from 'express';

const INDIC_ITC_MAP: Record<string, string> = {
  hi: 'hi-t-i0-und',
  mr: 'mr-t-i0-und',
  gu: 'gu-t-i0-und',
  bn: 'bn-t-i0-und',
  ta: 'ta-t-i0-und',
  te: 'te-t-i0-und',
  pa: 'pa-t-i0-und',
};

async function translateChunk(inputStr: string, targetLang: string): Promise<string> {
  const trimmed = inputStr?.trim();
  if (!trimmed || targetLang === 'en') return inputStr;

  // 1. Google Translate GTX GET request
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
    });

    if (res.ok) {
      const data: any = await res.json();
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
    console.warn('[TranslateController] Google GTX error:', err);
  }

  // 2. Indic phonetic transliteration fallback for test words, acronyms, brand names
  if (/[a-zA-Z]/.test(trimmed) && INDIC_ITC_MAP[targetLang]) {
    try {
      const itc = INDIC_ITC_MAP[targetLang];
      const translitUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(
        trimmed
      )}&itc=${itc}&num=1`;

      const tRes = await fetch(translitUrl, { method: 'GET' });
      if (tRes.ok) {
        const tData: any = await tRes.json();
        if (tData[0] === 'SUCCESS' && tData[1]?.[0]?.[1]?.[0]) {
          return tData[1][0][1][0];
        }
      }
    } catch (err) {
      console.warn('[TranslateController] Transliterate error:', err);
    }
  }

  return inputStr;
}

async function translateFullText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || targetLang === 'en') return text;

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

export const translateTextHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, texts, targetLang = 'hi' } = req.body;

    if (targetLang === 'en') {
      res.status(200).json({
        success: true,
        translatedText: text || '',
        translatedTexts: texts || [],
      });
      return;
    }

    if (Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map((t) => translateFullText(t, targetLang))
      );
      res.status(200).json({
        success: true,
        translatedTexts: results,
      });
      return;
    }

    const translatedText = await translateFullText(text || '', targetLang);
    res.status(200).json({
      success: true,
      translatedText,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Translation failed',
    });
  }
};
