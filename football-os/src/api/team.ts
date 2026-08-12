/**
 * 球队相关 API
 */
import { http } from './client'
import type { Team } from './types'

export const teamApi = {
  list: () => http.get<Team[]>('/teams'),

  get: (id: string) => http.get<Team>(`/teams/${id}`),

  create: (data: Partial<Team>) => http.post<Team>('/teams', data),

  update: (id: string, data: Partial<Team>) => http.put<Team>(`/teams/${id}`, data),

  remove: (id: string) => http.delete<void>(`/teams/${id}`),
}
