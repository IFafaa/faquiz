import { Link, Outlet, useNavigate } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { useAuthStore } from '@/app/store/authStore'
import { cn } from '@/shared/utils/cn'

const btnGhost =
  'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-brand-900/30 transition-colors hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'
const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-zinc-600 bg-transparent px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

export function PublicLayout() {
  const token = useAuthStore((s) => s.token)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to={paths.home}
            className="font-display text-xl font-semibold tracking-tight text-zinc-50"
          >
            FAQuiz
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {token ? (
              <>
                <Link to={paths.painel} className={cn(btnGhost)}>
                  Meus quizzes
                </Link>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={() => {
                    clearAuth()
                    void navigate(paths.home, { replace: true })
                  }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to={paths.login} className={btnGhost}>
                  Entrar
                </Link>
                <Link to={paths.register} className={btnPrimary}>
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
