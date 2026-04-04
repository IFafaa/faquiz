import type { Editor } from '@tiptap/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx(
        'rounded-lg px-2 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-brand-600/30 text-brand-200'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
      )}
    >
      {children}
    </button>
  )
}

interface Props {
  editor: Editor
}

export function RichTextEditorToolbar({ editor }: Props) {
  return (
    <div
      className="flex flex-wrap gap-0.5 border-b border-zinc-800 bg-zinc-950/50 px-2 py-1.5"
      role="toolbar"
      aria-label="Formatação"
    >
      <ToolbarButton
        title="Negrito"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong className="font-bold">B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="Itálico"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em className="italic">I</em>
      </ToolbarButton>
      <ToolbarButton
        title="Riscado"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        title="Lista com marcadores"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Lista
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Lista
      </ToolbarButton>
      <ToolbarButton
        title="Citação"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “ ”
      </ToolbarButton>
    </div>
  )
}
