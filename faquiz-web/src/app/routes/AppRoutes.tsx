import { Navigate, Route, Routes } from 'react-router-dom'
import { QuizDetailLayout } from '@/features/studio/components/layout/QuizDetailLayout'
import { ProtectedRoute } from '@/features/studio/components/layout/ProtectedRoute'
import { StudioLayout } from '@/features/studio/components/layout/StudioLayout'
import { PublicLayout } from '@/features/quiz/components/layout/PublicLayout'
import { DashboardPage } from '@/features/studio/pages/DashboardPage'
import { LoginPage } from '@/features/studio/pages/LoginPage'
import { RegisterPage } from '@/features/studio/pages/RegisterPage'
import { QuizBuilderPage } from '@/features/studio/pages/QuizBuilderPage'
import { QuizListPage } from '@/features/studio/pages/QuizListPage'
import { QuizInsightsPage } from '@/features/studio/pages/QuizInsightsPage'
import { QuizConfigPage } from '@/features/studio/pages/QuizConfigPage'
import { QuizSettingsPage } from '@/features/studio/pages/QuizSettingsPage'
import { ResponsesPage } from '@/features/studio/pages/ResponsesPage'
import { SessionDetailPage } from '@/features/studio/pages/SessionDetailPage'
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

      <Route path="entrar" element={<LoginPage />} />
      <Route path="cadastro" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="painel" element={<StudioLayout />}>
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
          <Route path="sessoes/:id" element={<SessionDetailPage />} />
        </Route>
      </Route>

      {/* Compat: rotas legadas → entrar, cadastro, painel */}
      <Route path="legacy/login" element={<Navigate to="/entrar" replace />} />
      <Route path="legacy/register" element={<Navigate to="/cadastro" replace />} />
      <Route path="legacy" element={<Navigate to="/painel" replace />} />
      <Route path="legacy/*" element={<Navigate to="/painel" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
