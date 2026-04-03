import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getQuiz, getShare, updateQuiz } from '@/api/quiz'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

export function QuizSettingsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: quiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuiz(id),
    enabled: !!id,
  })

  const { data: share, isLoading: loadingShare } = useQuery({
    queryKey: ['share', id],
    queryFn: () => getShare(id),
    enabled: !!id,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title)
      setDescription(quiz.description ?? '')
    }
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

  const loading = loadingQuiz || loadingShare

  const copyUrl = async () => {
    if (!share?.publicUrl) return
    try {
      await navigator.clipboard.writeText(share.publicUrl)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Compartilhamento e configuração
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Edite o quiz, publique e compartilhe o link ou o QR com os respondentes.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
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
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">Visibilidade</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => togglePublish.mutate()}
                    disabled={togglePublish.isPending || !quiz}
                  >
                    {quiz?.isPublished ? 'Despublicar' : 'Publicar quiz'}
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => saveMeta.mutate()}
                  disabled={
                    saveMeta.isPending ||
                    !quiz ||
                    (title.trim() === quiz.title &&
                      (description || '') === (quiz.description ?? ''))
                  }
                >
                  {saveMeta.isPending ? 'Salvando…' : 'Salvar alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>URL pública</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-400">
                  Compartilhe este link para que respondentes iniciem o quiz.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                    {share?.publicUrl ?? '—'}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => void copyUrl()}
                  >
                    Copiar
                  </Button>
                </div>
                {quiz && !quiz.isPublished ? (
                  <p className="text-xs text-amber-400/90">
                    Publique o quiz acima para tornar o link acessível publicamente
                    (quando a API exigir publicação).
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-400">
                  Imagem para cartazes e apresentações.
                </p>
                {share?.qrCodePngBase64 ? (
                  <div className="flex justify-center rounded-xl border border-zinc-800 bg-white p-4">
                    <img
                      src={`data:image/png;base64,${share.qrCodePngBase64}`}
                      alt="QR code do quiz"
                      className="max-h-56 w-auto"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">QR indisponível.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
