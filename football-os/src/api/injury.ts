/**
 * 伤病记录相关 API
 */
import { http } from './client'
import type { InjuryItem } from './types'

export const injuryApi = {
  active: () => http.get<InjuryItem[]>('/injuries'),

  listByPlayer: (playerId: string) => http.get<InjuryItem[]>(`/injuries/player/${playerId}`),

  get: (id: string) => http.get<InjuryItem>(`/injuries/${id}`),

  create: (data: Partial<InjuryItem>) => http.post<InjuryItem>('/injuries', data),

  recover: (id: string) => http.put<void>(`/injuries/${id}/recover`),
}
