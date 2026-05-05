import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Link, useSearchParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { paths } from '@/app/routes/paths'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => faquizApi.verifyEmail(token),
    enabled: !!token.trim(),
    retry: false,
  })

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <Link
        to="/"
        className="mb-8 text-center font-display text-2xl font-semibold text-zinc-50"
      >
        FAQuiz
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Confirmação de e-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token.trim() ? (
            <p className="text-sm text-amber-400">
              Link inválido: falta o token. Use o link enviado por e-mail ou solicite um novo na página de
              cadastro.
            </p>
          ) : isPending ? (
            <p className="text-sm text-zinc-400">Confirmando…</p>
          ) : data ? (
            <p className="text-sm text-emerald-400">{data.message}</p>
          ) : isError ? (
            <p className="text-sm text-red-400">
              {isAxiosError(error) &&
              error.response?.data &&
              typeof error.response.data === 'object' &&
              'message' in error.response.data
                ? String((error.response.data as { message?: string }).message)
                : 'Não foi possível confirmar. O link pode ter expirado.'}
            </p>
          ) : null}
          <p className="text-center text-sm text-zinc-400">
            <Link to={paths.login} className="text-emerald-400 hover:underline">
              Ir para o login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
