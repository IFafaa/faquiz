import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import type { QuizSummary } from '@/shared/types/api'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { richTextIsEmpty } from '@/shared/utils/richText'
import {
  CreateQuizModal,
  type CreateQuizData,
} from '@/features/admin/components/quiz-list/CreateQuizModal'
import { QuizTable } from '@/features/admin/components/quiz-list/QuizTable'

export function QuizListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => faquizApi.listQuizzes(),
  })

  const createMut = useMutation({
    mutationFn: (data: CreateQuizData) =>
      faquizApi.createQuiz({
        title: data.title.trim() || 'Novo quiz',
        description: richTextIsEmpty(data.description)
          ? undefined
          : data.description,
        collectName: data.collectName,
        collectEmail: data.collectEmail,
        collectPhone: data.collectPhone,
      }),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      setModalOpen(false)
      void navigate(`/admin/quizzes/${quiz.id}`)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => faquizApi.deleteQuiz(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const confirmDelete = (q: QuizSummary) => {
    const safeTitle = q.title.slice(0, 80).replace(/[\n\r]/g, ' ')
    if (
      !window.confirm(
        `Excluir o quiz "${safeTitle}"? Esta ação não pode ser desfeita.`,
      )
    )
      return
    deleteMut.mutate(q.id)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">
            Quizzes
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            As linhas da tabela são clicáveis: use para abrir o quiz e gerir
            configuração, fluxo e publicação. A coluna{' '}
            <span className="text-zinc-300">Ações</span> não abre o detalhe —
            só excluir.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => setModalOpen(true)}
        >
          Novo quiz
        </Button>
      </div>

      <CreateQuizModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => createMut.mutate(data)}
        isPending={createMut.isPending}
      />

      <QuizTable
        quizzes={quizzes ?? []}
        onDelete={confirmDelete}
        deletePending={deleteMut.isPending}
      />
    </div>
  )
}
