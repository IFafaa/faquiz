import { QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { createQueryClient } from '@/lib/query-client'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { LoginPage } from '@/pages/admin/LoginPage'
import { QuizBuilderPage } from '@/pages/admin/QuizBuilderPage'
import { QuizListPage } from '@/pages/admin/QuizListPage'
import { QuizSettingsPage } from '@/pages/admin/QuizSettingsPage'
import { ResponsesPage } from '@/pages/admin/ResponsesPage'
import { SessionDetailPage } from '@/pages/admin/SessionDetailPage'
import { HomePage } from '@/pages/public/HomePage'
import { QuizCompletePage } from '@/pages/public/QuizCompletePage'
import { QuizPlayPage } from '@/pages/public/QuizPlayPage'
import { QuizStartPage } from '@/pages/public/QuizStartPage'

const queryClient = createQueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="quiz/:id" element={<QuizStartPage />} />
          <Route path="quiz/:id/play" element={<QuizPlayPage />} />
          <Route path="quiz/:id/complete" element={<QuizCompletePage />} />
        </Route>

        <Route path="admin/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="quizzes" element={<QuizListPage />} />
            <Route path="quizzes/:id/build" element={<QuizBuilderPage />} />
            <Route path="quizzes/:id/settings" element={<QuizSettingsPage />} />
            <Route path="quizzes/:id/responses" element={<ResponsesPage />} />
            <Route path="sessions/:id" element={<SessionDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}
