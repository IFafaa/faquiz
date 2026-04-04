import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { RICH_TEXT_EDITOR_PROSE_CLASS, RICH_TEXT_EDITOR_ROOT } from './rich-text-editor.constants'
import { RichTextEditorHtmlPanel } from './RichTextEditorHtmlPanel'
import { RichTextEditorModeTabs } from './RichTextEditorModeTabs'
import { RichTextEditorToolbar } from './RichTextEditorToolbar'
import type { RichTextEditMode } from './types'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva aqui…',
  className,
  minHeight = '7rem',
}: Props) {
  const [mode, setMode] = useState<RichTextEditMode>('visual')
  const lastEmittedFromEditor = useRef<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: false,
        code: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: RICH_TEXT_EDITOR_PROSE_CLASS,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      lastEmittedFromEditor.current = html
      onChange(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    if (mode === 'html') return
    const v = value || ''
    if (lastEmittedFromEditor.current === v) return
    const cur = editor.getHTML()
    if (cur === v) {
      lastEmittedFromEditor.current = v
      return
    }
    editor.commands.setContent(v, { emitUpdate: false })
    lastEmittedFromEditor.current = v
  }, [value, editor, mode])

  const switchToHtml = useCallback(() => {
    if (!editor) return
    const html = editor.getHTML()
    lastEmittedFromEditor.current = html
    onChange(html)
    setMode('html')
  }, [editor, onChange])

  const switchToVisual = useCallback(() => {
    if (!editor) return
    const raw = value || ''
    editor.commands.setContent(raw, { emitUpdate: false })
    const normalized = editor.getHTML()
    lastEmittedFromEditor.current = normalized
    if (normalized !== raw) {
      onChange(normalized)
    }
    setMode('visual')
  }, [editor, onChange, value])

  if (!editor) return null

  return (
    <div className={clsx(RICH_TEXT_EDITOR_ROOT, className)}>
      <RichTextEditorModeTabs
        mode={mode}
        onVisual={switchToVisual}
        onHtml={switchToHtml}
      />
      {mode === 'visual' ? (
        <>
          <RichTextEditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </>
      ) : (
        <RichTextEditorHtmlPanel
          value={value}
          placeholder={placeholder}
          minHeight={minHeight}
          onChange={(html) => {
            lastEmittedFromEditor.current = html
            onChange(html)
          }}
        />
      )}
    </div>
  )
}
