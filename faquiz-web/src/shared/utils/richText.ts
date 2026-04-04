import DOMPurify from 'dompurify'

const SAFE_URI = /^(?:https?|mailto):/i

const PURIFY: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
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
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: SAFE_URI,
}

export function sanitizeRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY)
}

const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null

function extractText(html: string): string {
  const sanitized = sanitizeRichTextHtml(html)
  if (parser) {
    const doc = parser.parseFromString(sanitized, 'text/html')
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
  }
  const div = document.createElement('div')
  div.textContent = sanitized
  return (div.textContent || '').replace(/\s+/g, ' ').trim()
}

export function richTextIsEmpty(html: string): boolean {
  if (!html || !html.trim()) return true
  return extractText(html).length === 0
}

export function richTextToPlainText(html: string): string {
  if (!html || !html.trim()) return ''
  return extractText(html)
}
