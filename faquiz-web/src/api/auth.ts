import type { LoginResponse } from '@/types/api'
import { api } from './client'

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  })
  return data
}
