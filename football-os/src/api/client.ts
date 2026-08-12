/**
 * HTTP 客户端封装
 */
import type { ApiResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || '/api/v1/ai'

// Token 管理
const TOKEN_KEY = 'football_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | undefined>
  /** 是否走 AI 服务路由 */
  ai?: boolean
}

/**
 * 通用请求方法
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, ai = false } = options

  const baseURL = ai ? AI_API_BASE_URL : API_BASE_URL
  let url = `${baseURL}${path}`

  if (params) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) search.append(k, String(v))
    })
    const qs = search.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const resp = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (resp.status === 401) {
    removeToken()
    throw new Error('登录已过期，请重新登录')
  }

  if (!resp.ok) {
    let msg = `请求失败 (${resp.status})`
    try {
      const err = (await resp.json()) as ApiResponse
      msg = err.message || msg
    } catch {
      // 非 JSON 错误
    }
    throw new Error(msg)
  }

  const json = (await resp.json()) as ApiResponse<T>
  if (json.code !== 200) {
    throw new Error(json.message || '请求失败')
  }
  return json.data
}

export const http = {
  get<T>(path: string, params?: Record<string, string | number | undefined>, ai?: boolean) {
    return request<T>(path, { method: 'GET', params, ai })
  },
  post<T>(path: string, body?: unknown, ai?: boolean) {
    return request<T>(path, { method: 'POST', body, ai })
  },
  put<T>(path: string, body?: unknown, ai?: boolean) {
    return request<T>(path, { method: 'PUT', body, ai })
  },
  delete<T>(path: string, ai?: boolean) {
    return request<T>(path, { method: 'DELETE', ai })
  },
}
