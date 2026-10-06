import { BlogPost } from '../types';

const cache: Record<string, string> = {};

/**
 * Translates a single text string via internal /api/translate endpoint
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) return text;
    const data = await res.json();
    const result = data.translatedText || text;
    if (result && result.trim() !== text.trim()) {
      cache[cacheKey] = result;
    }
    return result;
  } catch (err) {
    console.warn('Translation error for text:', err);
    return text;
  }
}

/**
 * Translates an entire array of blog articles for the grid list
 */
export async function translateBlogList(
  articles: BlogPost[],
  targetLang: string
): Promise<BlogPost[]> {
  if (targetLang === 'en' || !articles || articles.length === 0) return articles;

  // Check if all are already in cache
  const needsFetch = articles.some(
    (a) => !cache[`${targetLang}:::${a.title}`] || !cache[`${targetLang}:::${a.excerpt}`]
  );

  if (needsFetch) {
    const textsToTranslate: string[] = [];
    articles.forEach((a) => {
      textsToTranslate.push(a.title);
      textsToTranslate.push(a.excerpt);
    });

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, targetLang }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.translatedTexts)) {
          let idx = 0;
          articles.forEach((a) => {
            const trTitle = data.translatedTexts[idx++] || a.title;
            const trExcerpt = data.translatedTexts[idx++] || a.excerpt;
            cache[`${targetLang}:::${a.title}`] = trTitle;
            cache[`${targetLang}:::${a.excerpt}`] = trExcerpt;
          });
        }
      }
    } catch (e) {
      console.warn('Batch translation error:', e);
    }
  }

  return articles.map((a) => ({
    ...a,
    title: cache[`${targetLang}:::${a.title}`] || a.title,
    excerpt: cache[`${targetLang}:::${a.excerpt}`] || a.excerpt,
  }));
}

/**
 * Translates a full single blog article (including body content) for the reader modal
 */
export async function translateSingleArticle(
  article: BlogPost,
  targetLang: string
): Promise<BlogPost> {
  if (targetLang === 'en' || !article) return article;

  const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
    translateText(article.title, targetLang),
    translateText(article.excerpt, targetLang),
    article.content ? translateText(article.content, targetLang) : Promise.resolve(''),
  ]);

  return {
    ...article,
    title: translatedTitle,
    excerpt: translatedExcerpt,
    content: translatedContent || article.content,
  };
}
