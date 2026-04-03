import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
