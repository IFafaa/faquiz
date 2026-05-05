import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { paths, isPainelPath } from '@/app/routes/paths'
import { useAuthStore } from '@/app/store/authStore'

function loginErrorMessage(err: unknown): string {
  if (!isAxiosError(err) || err.response == null) {
    return 'Não foi possível entrar. Tente novamente.'
  }
  const { status, data } = err.response
  const apiMsg =
    data && typeof data === 'object' && 'message' in data
      ? String((data as { message: string }).message)
      : null
  if (status === 401) return 'Credenciais inválidas'
  if (status === 403) {
    return (
      apiMsg ??
      'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada ou reenvie o link na página de confirmação.'
    )
  }
  return apiMsg ?? 'Não foi possível entrar. Tente novamente.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((s) => s.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const rawFrom =
    (location.state as { from?: string } | null)?.from ?? paths.painel
  const from =
    isPainelPath(rawFrom) && !rawFrom.includes('//') ? rawFrom : paths.painel

  const mutation = useMutation({
    mutationFn: () => faquizApi.login(email, password),
    onSuccess: (data) => {
      setToken(data.accessToken)
      void navigate(from, { replace: true })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

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
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mutation.isError ? (
              <p className="text-sm text-red-400">
                {loginErrorMessage(mutation.error)}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-zinc-400">
              <Link
                to={paths.forgotPassword}
                className="text-zinc-400 underline-offset-2 hover:text-emerald-400 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </p>
            <p className="text-center text-sm text-zinc-400">
              Não tem conta?{' '}
              <Link
                to={paths.register}
                className="text-emerald-400 hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
