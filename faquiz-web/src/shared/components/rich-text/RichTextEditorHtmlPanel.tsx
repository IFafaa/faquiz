interface Props {
  value: string
  placeholder: string
  minHeight: string
  onChange: (html: string) => void
}

export function RichTextEditorHtmlPanel({
  value,
  placeholder,
  minHeight,
  onChange,
}: Props) {
  return (
    <div className="p-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        aria-label="HTML da descrição"
        className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        style={{ minHeight }}
        rows={8}
      />
      <p className="mt-2 text-[11px] text-zinc-500">
        Tags permitidas (sanitizadas ao salvar): parágrafos, negrito, itálico, listas, citação,
        títulos h1–h3 e links. O servidor remove o que não for seguro.
      </p>
    </div>
  )
}
