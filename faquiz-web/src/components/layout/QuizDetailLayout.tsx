import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { getQuiz } from '@/api/quiz'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex shrink-0 items-center border-b-2 px-3 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'border-brand-500 text-zinc-50'
      : 'border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
  )

export function QuizDetailLayout() {
  const { id = '' } = useParams<{ id: string }>()

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuiz(id),
    enabled: !!id,
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-0 z-30 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 pb-0 pt-0 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 pb-4 pt-1">
          <Link
            to="/admin/quizzes"
            className="inline-flex w-fit text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Todos os quizzes
          </Link>
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">
                  {quiz?.title ?? (isLoading ? 'Carregando…' : 'Quiz')}
                </h1>
                {quiz ? (
                  quiz.isPublished ? (
                    <Badge tone="success">Publicado</Badge>
                  ) : (
                    <Badge tone="muted">Rascunho</Badge>
                  )
                ) : null}
              </div>
              {quiz?.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {quiz.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <nav
          className="-mb-px flex gap-1 overflow-x-auto border-t border-zinc-800/80"
          aria-label="Seções do quiz"
        >
          <NavLink to={`/admin/quizzes/${id}/config`} className={tabClass} end>
            Configuração
          </NavLink>
          <NavLink to={`/admin/quizzes/${id}/build`} className={tabClass}>
            Builder
          </NavLink>
          <NavLink to={`/admin/quizzes/${id}/settings`} className={tabClass}>
            Compartilhamento
          </NavLink>
          <NavLink to={`/admin/quizzes/${id}/responses`} className={tabClass}>
            Respostas
          </NavLink>
          <NavLink to={`/admin/quizzes/${id}/insights`} className={tabClass}>
            Insights
          </NavLink>
        </nav>
      </div>

      <div className="mt-6 min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
