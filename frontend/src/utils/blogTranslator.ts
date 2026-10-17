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
 * Helper to translate all fields of an article (Title, Excerpt, Content) in parallel
 * Used by Admin 1-Click Auto-Translate and Reader Fallback
 */
export async function translateArticleBundle(
  title: string,
  excerpt: string,
  content: string,
  targetLang: string
): Promise<{ title: string; excerpt: string; content: string }> {
  if (targetLang === 'en') {
    return { title, excerpt, content };
  }

  const [trTitle, trExcerpt, trContent] = await Promise.all([
    translateText(title, targetLang),
    translateText(excerpt, targetLang),
    content ? translateText(content, targetLang) : Promise.resolve(''),
  ]);

  return {
    title: trTitle || title,
    excerpt: trExcerpt || excerpt,
    content: trContent || content,
  };
}

/**
 * Translates an entire array of blog articles for the grid list
 * Strictly scoped to article titles & excerpts only
 */
export async function translateBlogList(
  articles: BlogPost[],
  targetLang: string
): Promise<BlogPost[]> {
  if (targetLang === 'en' || !articles || articles.length === 0) return articles;

  // Use pre-stored translations from DB if available
  const resultArticles = articles.map((a) => {
    const stored = a.translations?.[targetLang];
    if (stored && (stored.title || stored.excerpt)) {
      return {
        ...a,
        title: stored.title || a.title,
        excerpt: stored.excerpt || a.excerpt,
      };
    }
    return {
      ...a,
      title: cache[`${targetLang}:::${a.title}`] || a.title,
      excerpt: cache[`${targetLang}:::${a.excerpt}`] || a.excerpt,
    };
  });

  // Check if any articles still need dynamic fetching
  const unmigratedArticles = resultArticles.filter(
    (a) =>
      !a.translations?.[targetLang]?.title &&
      (!cache[`${targetLang}:::${a.title}`] || !cache[`${targetLang}:::${a.excerpt}`])
  );

  if (unmigratedArticles.length > 0) {
    const textsToTranslate: string[] = [];
    unmigratedArticles.forEach((a) => {
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
          unmigratedArticles.forEach((a) => {
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

    return resultArticles.map((a) => ({
      ...a,
      title: a.translations?.[targetLang]?.title || cache[`${targetLang}:::${a.title}`] || a.title,
      excerpt: a.translations?.[targetLang]?.excerpt || cache[`${targetLang}:::${a.excerpt}`] || a.excerpt,
    }));
  }

  return resultArticles;
}

/**
 * Translates a full single blog article (including body content) for the reader modal
 * Prioritizes pre-stored database translations for 0ms instant display!
 */
export async function translateSingleArticle(
  article: BlogPost,
  targetLang: string
): Promise<BlogPost> {
  if (targetLang === 'en' || !article) return article;

  // 1. Instant 0ms load: Check if pre-stored translation exists in MongoDB
  const stored = article.translations?.[targetLang];
  if (stored && (stored.title || stored.excerpt || stored.content)) {
    return {
      ...article,
      title: stored.title || article.title,
      excerpt: stored.excerpt || article.excerpt,
      content: stored.content || article.content,
    };
  }

  // 2. Fallback: On-demand dynamic translation via /api/translate
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
