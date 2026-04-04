import clsx from 'clsx'
import { sanitizeRichTextHtml } from '@/lib/richText'

interface Props {
  html: string
  className?: string
}

export function RichTextHtml({ html, className }: Props) {
  const clean = sanitizeRichTextHtml(html)
  if (!clean) return null
  return (
    <div
      className={clsx(
        'rich-text-content [&_a]:text-brand-400 [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400 [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
