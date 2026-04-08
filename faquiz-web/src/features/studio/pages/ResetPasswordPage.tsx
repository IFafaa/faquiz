import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { paths } from '@/app/routes/paths'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/utils/cn'
import {
  getPasswordChecks,
  isStrongPassword,
  passwordStrengthScore,
} from '@/shared/utils/passwordStrength'

const STRENGTH_LABELS = ['', 'Fraca', 'Regular', 'Boa', 'Muito boa', 'Forte']

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const checks = useMemo(() => getPasswordChecks(password), [password])
  const score = useMemo(() => passwordStrengthScore(password), [password])
  const passwordOk = useMemo(() => isStrongPassword(password), [password])
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  const mutation = useMutation({
    mutationFn: () => faquizApi.resetPassword(token, password),
    onSuccess: () => {
      void navigate(paths.login, { replace: true })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token.trim() || !passwordOk || !passwordsMatch) return
    mutation.mutate()
  }

  const checklist = [
    { ok: checks.minLength, text: 'Entre 8 e 128 caracteres' },
    { ok: checks.hasUpper, text: 'Uma letra maiúscula (A–Z)' },
    { ok: checks.hasLower, text: 'Uma letra minúscula (a–z)' },
    { ok: checks.hasDigit, text: 'Um número (0–9)' },
    { ok: checks.hasSpecial, text: 'Um símbolo (ex.: ! @ # $ % & * …)' },
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
          <CardTitle>Nova senha</CardTitle>
        </CardHeader>
        <CardContent>
          {!token.trim() ? (
            <p className="text-sm text-amber-400">
              Link inválido. Peça uma nova redefinição de senha.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <label
                    htmlFor="reset-password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Nova senha
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
                  id="reset-password"
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
                />
                <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={5}>
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
                <ul className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs">
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
              <Input
                label="Confirmar nova senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword.length > 0 && !passwordsMatch ? (
                <p className="text-sm text-amber-400" role="alert">
                  As senhas não coincidem.
                </p>
              ) : null}
              {mutation.isError ? (
                <p className="text-sm text-red-400">
                  {isAxiosError(mutation.error) && mutation.error.response?.status === 400
                    ? 'Verifique a senha ou peça um novo link.'
                    : 'Não foi possível redefinir. Tente novamente.'}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || !passwordOk || !passwordsMatch}
              >
                {mutation.isPending ? 'Salvando…' : 'Definir senha'}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-zinc-400">
            <Link to={paths.login} className="text-emerald-400 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
