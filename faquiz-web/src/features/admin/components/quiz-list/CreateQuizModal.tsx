import { useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { RichTextEditor } from '@/shared/components/rich-text/RichTextEditor'

export interface CreateQuizData {
  title: string
  description: string
  collectName: boolean
  collectEmail: boolean
  collectPhone: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateQuizData) => void
  isPending: boolean
}

const initial: CreateQuizData = {
  title: '',
  description: '',
  collectName: false,
  collectEmail: false,
  collectPhone: false,
}

export function CreateQuizModal({ open, onClose, onSubmit, isPending }: Props) {
  const [form, setForm] = useState<CreateQuizData>(initial)

  const handleClose = () => {
    setForm(initial)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo quiz">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(form)
        }}
        className="space-y-5"
      >
        <Input
          label="Título"
          placeholder="Ex.: Pesquisa de satisfação"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">
            Descrição
          </label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setForm({ ...form, description: html })}
            placeholder="Descrição do quiz (opcional)"
            minHeight="5rem"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-300">
            Dados do respondente
          </legend>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.collectName}
              onChange={(e) =>
                setForm({ ...form, collectName: e.target.checked })
              }
              className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
            />
            Coletar nome
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.collectEmail}
              onChange={(e) =>
                setForm({ ...form, collectEmail: e.target.checked })
              }
              className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
            />
            Coletar e-mail
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.collectPhone}
              onChange={(e) =>
                setForm({ ...form, collectPhone: e.target.checked })
              }
              className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
            />
            Coletar telefone
          </label>
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !form.title.trim()}>
            {isPending ? 'Criando…' : 'Criar quiz'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
