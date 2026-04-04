import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startTransition, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getQuiz, updateQuiz } from '@/api/quiz'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

export function QuizConfigPage() {
  const { id = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuiz(id),
    enabled: !!id,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!quiz) return
    startTransition(() => {
      setTitle(quiz.title)
      setDescription(quiz.description ?? '')
    })
  }, [quiz])

  const saveMeta = useMutation({
    mutationFn: () => {
      if (!quiz) throw new Error('Quiz não carregado')
      return updateQuiz(id, {
        title: title.trim() || quiz.title,
        description,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quiz', id] })
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const togglePublish = useMutation({
    mutationFn: () =>
      updateQuiz(id, { isPublished: !quiz?.isPublished }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quiz', id] })
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!quiz) {
    return (
      <p className="text-sm text-zinc-500">Quiz não encontrado.</p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Configuração
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Título, descrição e visibilidade do questionário. Alterações ao título ou
          descrição refletem no cabeçalho desta página após guardar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição interna ou pública (conforme o uso no app)"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-zinc-400">Visibilidade</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => togglePublish.mutate()}
                disabled={togglePublish.isPending}
              >
                {quiz.isPublished ? 'Despublicar' : 'Publicar quiz'}
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => saveMeta.mutate()}
              disabled={
                saveMeta.isPending ||
                (title.trim() === quiz.title &&
                  (description || '') === (quiz.description ?? ''))
              }
            >
              {saveMeta.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
