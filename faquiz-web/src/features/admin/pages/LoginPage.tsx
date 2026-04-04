import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { useAuthStore } from '@/app/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((s) => s.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const rawFrom =
    (location.state as { from?: string } | null)?.from ?? '/admin'
  const from =
    rawFrom.startsWith('/admin') && !rawFrom.includes('//') ? rawFrom : '/admin'

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
                {isAxiosError(mutation.error) &&
                mutation.error.response?.status === 401
                  ? 'Credenciais inválidas'
                  : 'Não foi possível entrar. Tente novamente.'}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
