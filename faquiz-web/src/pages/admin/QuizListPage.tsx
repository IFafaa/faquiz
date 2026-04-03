import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      void navigate(`/admin/quizzes/${quiz.id}/build`)
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
          Crie, edite, publique e abra o builder ou as respostas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            {createMut.isPending ? 'Criando…' : 'Criar e ir ao builder'}
          </Button>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-400">Título</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="hidden px-4 py-3 font-medium text-zinc-400 md:table-cell">
                Atualizado
              </th>
              <th className="px-4 py-3 font-medium text-zinc-400 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {(!quizzes || quizzes.length === 0) ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  Nenhum quiz cadastrado.
                </td>
              </tr>
            ) : (
              quizzes.map((q) => (
                <tr key={q.id} className="bg-zinc-950/40">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-zinc-200">{q.title}</p>
                    {q.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                        {q.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {q.isPublished ? (
                      <Badge tone="success">Publicado</Badge>
                    ) : (
                      <Badge tone="muted">Rascunho</Badge>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 align-top text-zinc-500 md:table-cell">
                    {formatUpdated(q.updatedAt)}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(q)}
                      >
                        Editar
                      </Button>
                      <Link to={`/admin/quizzes/${q.id}/build`}>
                        <Button type="button" variant="secondary" size="sm">
                          Builder
                        </Button>
                      </Link>
                      <Link to={`/admin/quizzes/${q.id}/settings`}>
                        <Button type="button" variant="ghost" size="sm">
                          Share
                        </Button>
                      </Link>
                      <Link to={`/admin/quizzes/${q.id}/responses`}>
                        <Button type="button" variant="ghost" size="sm">
                          Respostas
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => togglePublish(q)}
                        disabled={updateMut.isPending}
                      >
                        {q.isPublished ? 'Despublicar' : 'Publicar'}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
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
          <Card className="w-full max-w-md">
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
