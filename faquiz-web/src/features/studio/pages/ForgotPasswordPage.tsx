import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { paths } from '@/app/routes/paths'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: () => faquizApi.forgotPassword(email.trim().toLowerCase()),
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
          <CardTitle>Recuperar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-zinc-400">
              Informe o e-mail da sua conta. Se existir cadastro, enviaremos um link para redefinir a senha.
            </p>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {mutation.isError ? (
              <p className="text-sm text-red-400">
                {isAxiosError(mutation.error) && mutation.error.response?.status === 400
                  ? 'E-mail inválido.'
                  : 'Não foi possível enviar. Tente novamente.'}
              </p>
            ) : null}
            {mutation.isSuccess ? (
              <p className="text-sm text-emerald-400">{mutation.data.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando…' : 'Enviar link'}
            </Button>
            <p className="text-center text-sm text-zinc-400">
              <Link to={paths.login} className="text-emerald-400 hover:underline">
                Voltar ao login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
