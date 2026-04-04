import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createQuiz, deleteQuiz, listQuizzes } from '@/api/quiz'
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
  const [collectName, setCollectName] = useState(false)
  const [collectEmail, setCollectEmail] = useState(false)
  const [collectPhone, setCollectPhone] = useState(false)

  const createMut = useMutation({
    mutationFn: () =>
      createQuiz({
        title: title.trim() || 'Novo quiz',
        description: description.trim() || undefined,
        collectName,
        collectEmail,
        collectPhone,
      }),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      setTitle('')
      setDescription('')
      setCollectName(false)
      setCollectEmail(false)
      setCollectPhone(false)
      void navigate(`/admin/quizzes/${quiz.id}`)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
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
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Quizzes
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Clique numa linha para abrir o quiz. Edição e publicação ficam na aba
          Configuração.
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
              <th className="w-[100px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Excluir
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
                  onClick={() => void navigate(`/admin/quizzes/${q.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      void navigate(`/admin/quizzes/${q.id}`)
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
