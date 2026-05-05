import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { useAuthStore } from '@/app/store/authStore'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
