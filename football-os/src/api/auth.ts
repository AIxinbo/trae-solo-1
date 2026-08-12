/**
 * 认证相关 API
 */
import { http, setToken, removeToken } from './client'

export interface LoginDTO {
  username: string
  password: string
}

export interface LoginVO {
  token: string
  userId: string
  username: string
  realName: string
  role: string
  avatar: string
}

export const authApi = {
  login: async (data: LoginDTO) => {
    const result = await http.post<LoginVO>('/auth/login', data)
    if (result.token) setToken(result.token)
    return result
  },

  logout: () => {
    removeToken()
    return http.post<void>('/auth/logout')
  },

  me: () => http.post<unknown>('/auth/me'),
}
