import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createQuiz,
  deleteQuiz,
  listQuizzes,
  updateQuiz,
} from '@/api/quiz'
import type { QuizSummary } from '@/types/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

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

export function QuizListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: listQuizzes,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [editing, setEditing] = useState<QuizSummary | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const createMut = useMutation({
    mutationFn: () =>
      createQuiz({
        title: title.trim() || 'Novo quiz',
        description: description.trim() || undefined,
      }),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      setTitle('')
      setDescription('')
      void navigate(`/admin/quizzes/${quiz.id}`)
    },
  })

  const updateMut = useMutation({
    mutationFn: (args: {
      id: string
      body: { title?: string; description?: string; isPublished?: boolean }
    }) => updateQuiz(args.id, args.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      setEditing(null)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const openEdit = (q: QuizSummary) => {
    setEditing(q)
    setEditTitle(q.title)
    setEditDescription(q.description ?? '')
  }

  const saveEdit = () => {
    if (!editing) return
    updateMut.mutate({
      id: editing.id,
      body: {
        title: editTitle.trim() || editing.title,
        description: editDescription,
      },
    })
  }

  const togglePublish = (q: QuizSummary) => {
    updateMut.mutate({
      id: q.id,
      body: { isPublished: !q.isPublished },
    })
  }

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
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Quizzes
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Clique numa linha para abrir respostas, compartilhamento, builder e
          insights.
        </p>
      </div>

      <Card className="border-zinc-800/80">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-base">Novo quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Breve descrição interna"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
          >
            {createMut.isPending ? 'Criando…' : 'Criar quiz'}
          </Button>
        </CardContent>
      </Card>

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
              <th className="w-[200px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {(!quizzes || quizzes.length === 0) ? (
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
                  className="cursor-pointer bg-zinc-950/20 transition-colors hover:bg-zinc-900/40"
                  onClick={() => void navigate(`/admin/quizzes/${q.id}/responses`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      void navigate(`/admin/quizzes/${q.id}/responses`)
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <p className="font-medium leading-snug text-zinc-200">
                      {q.title}
                    </p>
                    {q.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {q.description}
                      </p>
                    ) : null}
                    <div className="mt-2 sm:hidden">
                      {q.isPublished ? (
                        <Badge tone="success">Publicado</Badge>
                      ) : (
                        <Badge tone="muted">Rascunho</Badge>
                      )}
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
                      className="inline-flex flex-wrap items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => openEdit(q)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => togglePublish(q)}
                        disabled={updateMut.isPending}
                      >
                        {q.isPublished ? 'Despublicar' : 'Publicar'}
                      </Button>
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

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-quiz-title"
        >
          <Card className="w-full max-w-md border-zinc-800">
            <CardHeader>
              <CardTitle id="edit-quiz-title">Editar quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Título"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300">
                  Descrição
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={saveEdit}
                  disabled={updateMut.isPending}
                >
                  {updateMut.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
