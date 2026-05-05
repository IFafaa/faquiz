import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { paths } from '@/app/routes/paths'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export function RegisterPendingPage() {
  const location = useLocation()
  const emailFromState = (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(emailFromState)

  const resend = useMutation({
    mutationFn: () => faquizApi.resendVerification(email.trim().toLowerCase()),
  })

  function onResend(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    resend.mutate()
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
          <CardTitle>Confirme seu e-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-300">
            Enviamos um link para{' '}
            <strong className="text-zinc-100">{emailFromState || email || 'seu e-mail'}</strong>.
            Abra a mensagem e toque em <strong className="text-zinc-100">Confirmar e-mail</strong> para
            ativar sua conta.
          </p>
          <p className="text-sm text-zinc-500">
            Não encontrou? Verifique o spam ou peça um novo link abaixo.
          </p>
          <form onSubmit={onResend} className="space-y-3 border-t border-zinc-800 pt-4">
            <Input
              label="E-mail da conta"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
              required
            />
            {resend.isError ? (
              <p className="text-sm text-red-400">
                {isAxiosError(resend.error) && resend.error.response?.status === 400
                  ? 'E-mail inválido.'
                  : 'Não foi possível reenviar. Tente novamente.'}
              </p>
            ) : null}
            {resend.isSuccess ? (
              <p className="text-sm text-emerald-400">{resend.data.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={resend.isPending}>
              {resend.isPending ? 'Enviando…' : 'Reenviar link'}
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-400">
            <Link to={paths.login} className="text-emerald-400 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
