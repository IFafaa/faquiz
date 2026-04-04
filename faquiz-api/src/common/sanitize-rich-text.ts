import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'strike',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'a',
] as const;

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href,
        rel: 'noopener noreferrer',
        ...(attribs.href?.startsWith('http') ? { target: '_blank' } : {}),
      },
    }),
  },
};

function isEffectivelyEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0;
}

export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') return '';
  const out = sanitizeHtml(input, RICH_TEXT_OPTIONS).trim();
  if (isEffectivelyEmpty(out)) return '';
  return out;
}
