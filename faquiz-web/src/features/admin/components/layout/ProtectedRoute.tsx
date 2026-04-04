import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/authStore'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
