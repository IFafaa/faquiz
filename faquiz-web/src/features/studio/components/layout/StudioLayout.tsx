import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/app/store/authStore'
import { Button } from '@/shared/ui/Button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
  )

export function StudioLayout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const logout = () => {
    clearAuth()
    void navigate(paths.login, { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 md:flex md:flex-col">
        <div className="border-b border-zinc-800 px-4 py-4">
          <Link
            to={paths.painel}
            className="font-display text-lg font-semibold text-zinc-50"
          >
            FAQuiz
          </Link>
          <p className="text-xs text-zinc-500 mt-1">Seus questionários</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <NavLink to={paths.painel} end className={navLinkClass}>
            Início
          </NavLink>
          <NavLink to={paths.painelQuizzes} className={navLinkClass}>
            Quizzes
          </NavLink>
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-400"
            onClick={logout}
          >
            Sair
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 md:hidden">
          <Link to={paths.painel} className="font-display font-semibold">
            FAQuiz
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
