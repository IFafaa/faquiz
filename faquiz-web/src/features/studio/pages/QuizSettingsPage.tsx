import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

export function QuizSettingsPage() {
  const { id = '' } = useParams<{ id: string }>()

  const { data: quiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => faquizApi.getQuiz(id),
    enabled: !!id,
  })

  const { data: share, isLoading: loadingShare } = useQuery({
    queryKey: ['share', id],
    queryFn: () => faquizApi.getShare(id),
    enabled: !!id,
  })

  const loading = loadingQuiz || loadingShare

  const copyUrl = async () => {
    if (!share?.publicUrl) return
    try {
      await navigator.clipboard.writeText(share.publicUrl)
    } catch {
      void 0
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Compartilhamento
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Link público e QR para divulgar o quiz. Para editar texto ou publicar,
          use a aba <span className="text-zinc-400">Configuração</span>.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
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
                  O quiz está como rascunho. Publique-o na aba Configuração para
                  tornar o acesso público disponível (quando a API exigir).
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
      )}
    </div>
  )
}
