import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface FormattedDescriptionProps {
  content?: string;
  className?: string;
}

/**
 * Intelligent Description Formatter for Ayurvedic Products
 * Supports:
 * 1. Rich HTML content (from WYSIWYG / RichEditor)
 * 2. Plain text with intelligent parsing for:
 *    - Bullet points (`- ` or `• `) with bold labels (e.g. "- Key: Value")
 *    - Numbered headings (e.g. "1. Fat to Fit Abhyang Oil")
 *    - Section titles (e.g. "Key Benefits:", "Why Choose Fat to Fit?")
 *    - Paragraph breaks (`\n\n`)
 */
export default function FormattedDescription({
  content,
  className = '',
}: FormattedDescriptionProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const raw = content.trim();

  // If content contains rich HTML tags, render with styled typography
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (hasHtml) {
    return (
      <div
        className={`prose prose-sm max-w-none text-slate-600 font-light leading-relaxed 
          [&>p]:mb-3 [&>p:last-child]:mb-0
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:my-3
          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:my-3
          [&>li]:text-slate-600 [&>li]:leading-relaxed
          [&>h1]:font-serif [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-[#1A201C] [&>h1]:mt-6 [&>h1]:mb-3
          [&>h2]:font-serif [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-[#1A201C] [&>h2]:mt-5 [&>h2]:mb-2.5
          [&>h3]:font-serif [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-[#1F3A2E] [&>h3]:mt-4 [&>h3]:mb-2
          [&>h4]:font-serif [&>h4]:text-sm [&>h4]:font-bold [&>h4]:text-[#1F3A2E] [&>h4]:mt-3 [&>h4]:mb-1.5
          [&>strong]:text-[#1F3A2E] [&>strong]:font-semibold
          ${className}`}
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }

  // Parse plain text with intelligent sectioning and bullet point conversion
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  type Block =
    | { type: 'header'; text: string; level: number }
    | { type: 'bullets'; items: { title?: string; body: string }[] }
    | { type: 'paragraph'; text: string };

  const blocks: Block[] = [];
  let currentBullets: { title?: string; body: string }[] = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: 'bullets', items: [...currentBullets] });
      currentBullets = [];
    }
  };

  const isBulletLine = (line: string) => {
    return /^[-*•]\s+/.test(line);
  };

  const isNumberedHeader = (line: string) => {
    return /^\d+\.\s+[A-Z]/.test(line);
  };

  const isNamedHeader = (line: string) => {
    // Matches "Key Benefits:", "Suggested Use:", "Why Choose X?", etc.
    if (/^(Key Benefits|Benefits|Suggested Use|Directions for Use|Why Choose [^?:]+|Care for Your [^?:]+|How to Use|Ingredients|Highlights|Product Highlights):?$/i.test(line)) {
      return true;
    }
    if (line.endsWith(':') && line.length < 50 && !line.includes('.')) {
      return true;
    }
    if (line.endsWith('?') && line.length < 60) {
      return true;
    }
    return false;
  };

  for (const line of lines) {
    if (isBulletLine(line)) {
      const stripped = line.replace(/^[-*•]\s+/, '').trim();
      // Check if bullet has a label before colon: "- Title: Description"
      const colonIdx = stripped.indexOf(':');
      if (colonIdx > 0 && colonIdx < 50) {
        currentBullets.push({
          title: stripped.slice(0, colonIdx + 1),
          body: stripped.slice(colonIdx + 1).trim(),
        });
      } else {
        currentBullets.push({
          body: stripped,
        });
      }
    } else {
      flushBullets();

      if (isNumberedHeader(line)) {
        blocks.push({ type: 'header', text: line, level: 1 });
      } else if (isNamedHeader(line)) {
        blocks.push({ type: 'header', text: line, level: 2 });
      } else {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  }

  flushBullets();

  return (
    <div className={`space-y-4 text-slate-600 text-sm font-light leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'header') {
          if (block.level === 1) {
            return (
              <div key={idx} className="pt-3 pb-1 border-b border-[#EFE9DD]/60">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F3A2E] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B58A5A] shrink-0" />
                  <span>{block.text}</span>
                </h3>
              </div>
            );
          }
          return (
            <h4
              key={idx}
              className="font-serif text-sm sm:text-base font-bold text-[#1A201C] pt-2 flex items-center gap-2 text-[#1F3A2E]"
            >
              <span>{block.text}</span>
            </h4>
          );
        }

        if (block.type === 'bullets') {
          return (
            <ul key={idx} className="space-y-2.5 my-2.5 pl-1 sm:pl-2">
              {block.items.map((item, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F3A2E] mt-2 shrink-0" />
                  <div>
                    {item.title && (
                      <span className="font-semibold text-[#1F3A2E] mr-1.5">
                        {item.title}
                      </span>
                    )}
                    <span className="font-light text-slate-600">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
