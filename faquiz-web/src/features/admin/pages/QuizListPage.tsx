import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import type { QuizSummary } from '@/shared/types/api'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { RichTextEditor } from '@/shared/components/rich-text/RichTextEditor'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { richTextIsEmpty, richTextToPlainText } from '@/shared/utils/richText'

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function RowChevron() {
  return (
    <span
      className="ml-2 inline-flex shrink-0 text-zinc-600 transition-colors group-hover:text-brand-400"
      aria-hidden
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </span>
  )
}

export function QuizListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => faquizApi.listQuizzes(),
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collectName, setCollectName] = useState(false)
  const [collectEmail, setCollectEmail] = useState(false)
  const [collectPhone, setCollectPhone] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCollectName(false)
    setCollectEmail(false)
    setCollectPhone(false)
  }

  const createMut = useMutation({
    mutationFn: () =>
      faquizApi.createQuiz({
        title: title.trim() || 'Novo quiz',
        description: richTextIsEmpty(description) ? undefined : description,
        collectName,
        collectEmail,
        collectPhone,
      }),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      resetForm()
      setModalOpen(false)
      void navigate(`/admin/quizzes/${quiz.id}`)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => faquizApi.deleteQuiz(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const confirmDelete = (q: QuizSummary) => {
    if (
      !window.confirm(
        `Excluir o quiz "${q.title}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }
    deleteMut.mutate(q.id)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">Quizzes</h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            As linhas da tabela são clicáveis: use para abrir o quiz e gerir
            configuração, fluxo e publicação. A coluna{' '}
            <span className="text-zinc-300">Ações</span> não abre o detalhe — só
            excluir.
          </p>
        </div>
        <Button type="button" className="shrink-0" onClick={() => setModalOpen(true)}>
          Novo quiz
        </Button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title="Novo quiz"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Pesquisa de satisfação"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Descrição (opcional)
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Texto formatado: negrito, listas, parágrafos…"
              minHeight="5rem"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-zinc-300">
              Dados antes do quiz (opcional)
            </p>
            <p className="text-xs text-zinc-500">
              Marque o que o respondente deve informar ao iniciar. Não pode ser
              alterado depois de criado. Para pesquisa anônima, deixe tudo
              desmarcado.
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={collectName}
                  onChange={(e) => setCollectName(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                Nome
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={collectEmail}
                  onChange={(e) => setCollectEmail(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                E-mail
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={collectPhone}
                  onChange={(e) => setCollectPhone(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                Telefone
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending}
            >
              {createMut.isPending ? 'Criando…' : 'Criar quiz'}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/30 shadow-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Título
              </th>
              <th className="hidden w-[120px] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:table-cell">
                Status
              </th>
              <th className="hidden w-[150px] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 lg:table-cell">
                Atualizado
              </th>
              <th className="w-[100px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {!quizzes || quizzes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-zinc-500"
                >
                  Nenhum quiz cadastrado.
                </td>
              </tr>
            ) : (
              quizzes.map((q) => (
                <tr
                  key={q.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Abrir quiz: ${q.title}`}
                  className="group cursor-pointer border-l-2 border-l-transparent bg-zinc-950/20 transition-colors hover:border-l-brand-500 hover:bg-zinc-900/50"
                  onClick={() => void navigate(`/admin/quizzes/${q.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      void navigate(`/admin/quizzes/${q.id}`)
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-start font-medium leading-snug text-zinc-200">
                          <span className="min-w-0">{q.title}</span>
                          <RowChevron />
                        </p>
                        {q.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                            {richTextToPlainText(q.description)}
                          </p>
                        ) : null}
                        <div className="mt-2 sm:hidden">
                          {q.isPublished ? (
                            <Badge tone="success">Publicado</Badge>
                          ) : (
                            <Badge tone="muted">Rascunho</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 align-middle sm:table-cell">
                    {q.isPublished ? (
                      <Badge tone="success">Publicado</Badge>
                    ) : (
                      <Badge tone="muted">Rascunho</Badge>
                    )}
                  </td>
                  <td className="hidden align-middle text-zinc-500 lg:table-cell">
                    {formatUpdated(q.updatedAt)}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => confirmDelete(q)}
                        disabled={deleteMut.isPending}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
