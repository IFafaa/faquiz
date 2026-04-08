import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { paths, isPainelPath } from '@/app/routes/paths'
import { useAuthStore } from '@/app/store/authStore'
import { cn } from '@/shared/utils/cn'
import {
  getPasswordChecks,
  isStrongPassword,
  passwordStrengthScore,
} from '@/shared/utils/passwordStrength'

const STRENGTH_LABELS = ['', 'Fraca', 'Regular', 'Boa', 'Muito boa', 'Forte']

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((s) => s.setToken)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const rawFrom =
    (location.state as { from?: string } | null)?.from ?? paths.painel
  const from =
    isPainelPath(rawFrom) && !rawFrom.includes('//') ? rawFrom : paths.painel

  const checks = useMemo(() => getPasswordChecks(password), [password])
  const score = useMemo(() => passwordStrengthScore(password), [password])
  const passwordOk = useMemo(() => isStrongPassword(password), [password])

  const mutation = useMutation({
    mutationFn: () =>
      faquizApi.register({ email, password, name: name.trim() }),
    onSuccess: (data) => {
      setToken(data.accessToken)
      void navigate(from, { replace: true })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordOk) return
    mutation.mutate()
  }

  const checklist = [
    { ok: checks.minLength, text: 'Entre 8 e 128 caracteres' },
    { ok: checks.hasUpper, text: 'Uma letra maiúscula (A–Z)' },
    { ok: checks.hasLower, text: 'Uma letra minúscula (a–z)' },
    { ok: checks.hasDigit, text: 'Um número (0–9)' },
    {
      ok: checks.hasSpecial,
      text: 'Um símbolo (ex.: ! @ # $ % & * …)',
    },
  ] as const

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
          <CardTitle>Criar conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Nome"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Senha forte
                </label>
                <button
                  type="button"
                  className="text-xs text-brand-400 hover:underline"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(
                  'w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                  password.length > 0 && !passwordOk && 'border-amber-600/80',
                  passwordOk && 'border-emerald-600/60',
                )}
                aria-describedby="password-strength password-hint"
              />
              <div id="password-strength" className="space-y-1.5">
                <div
                  className="flex gap-1"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        'h-1.5 flex-1 rounded-full bg-zinc-800 transition-colors',
                        score >= step &&
                          (score <= 2
                            ? 'bg-red-500/90'
                            : score <= 3
                              ? 'bg-amber-500/90'
                              : score <= 4
                                ? 'bg-emerald-500/80'
                                : 'bg-emerald-400'),
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  {password.length === 0
                    ? 'Digite uma senha para ver a força.'
                    : STRENGTH_LABELS[score] ?? ''}
                </p>
              </div>
              <ul
                id="password-hint"
                className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs"
              >
                {checklist.map((item) => (
                  <li
                    key={item.text}
                    className={cn(
                      'flex items-center gap-2',
                      item.ok ? 'text-emerald-400' : 'text-zinc-500',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                        item.ok
                          ? 'border-emerald-500/50 bg-emerald-950/50'
                          : 'border-zinc-600',
                      )}
                      aria-hidden
                    >
                      {item.ok ? '✓' : ''}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            {mutation.isError ? (
              <p className="text-sm text-red-400">
                {isAxiosError(mutation.error) &&
                mutation.error.response?.status === 409
                  ? 'Este e-mail já está cadastrado.'
                  : isAxiosError(mutation.error) &&
                      mutation.error.response?.status === 400
                    ? 'Verifique os dados e tente novamente.'
                    : 'Não foi possível criar a conta. Tente novamente.'}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending || !passwordOk}
            >
              {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-zinc-400">
              Já tem conta?{' '}
              <Link to={paths.login} className="text-emerald-400 hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
