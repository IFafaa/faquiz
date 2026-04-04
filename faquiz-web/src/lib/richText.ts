import DOMPurify from 'dompurify'

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
}

export function sanitizeRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY)
}

export function richTextIsEmpty(html: string): boolean {
  if (!html || !html.trim()) return true
  const div = document.createElement('div')
  div.innerHTML = sanitizeRichTextHtml(html)
  const t = (div.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length === 0
}

export function richTextToPlainText(html: string): string {
  if (!html || !html.trim()) return ''
  const div = document.createElement('div')
  div.innerHTML = sanitizeRichTextHtml(html)
  return (div.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
}
