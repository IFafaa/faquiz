import { Navigate, Route, Routes } from 'react-router-dom'
import { QuizDetailLayout } from '@/features/admin/components/layout/QuizDetailLayout'
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout'
import { ProtectedRoute } from '@/features/admin/components/layout/ProtectedRoute'
import { PublicLayout } from '@/features/quiz/components/layout/PublicLayout'
import { DashboardPage } from '@/features/admin/pages/DashboardPage'
import { LoginPage } from '@/features/admin/pages/LoginPage'
import { QuizBuilderPage } from '@/features/admin/pages/QuizBuilderPage'
import { QuizListPage } from '@/features/admin/pages/QuizListPage'
import { QuizInsightsPage } from '@/features/admin/pages/QuizInsightsPage'
import { QuizConfigPage } from '@/features/admin/pages/QuizConfigPage'
import { QuizSettingsPage } from '@/features/admin/pages/QuizSettingsPage'
import { ResponsesPage } from '@/features/admin/pages/ResponsesPage'
import { SessionDetailPage } from '@/features/admin/pages/SessionDetailPage'
import { HomePage } from '@/features/quiz/pages/HomePage'
import { QuizCompletePage } from '@/features/quiz/pages/QuizCompletePage'
import { QuizPlayPage } from '@/features/quiz/pages/QuizPlayPage'
import { QuizStartPage } from '@/features/quiz/pages/QuizStartPage'

export function AppRoutes() {
  return (
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
          <Route path="quizzes/:id" element={<QuizDetailLayout />}>
            <Route index element={<Navigate to="config" replace />} />
            <Route path="responses" element={<ResponsesPage />} />
            <Route path="config" element={<QuizConfigPage />} />
            <Route path="settings" element={<QuizSettingsPage />} />
            <Route path="build" element={<QuizBuilderPage />} />
            <Route path="insights" element={<QuizInsightsPage />} />
          </Route>
          <Route path="sessions/:id" element={<SessionDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
