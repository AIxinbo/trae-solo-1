/**
 * 球员相关 API
 */
import { http } from './client'
import type { Player, PlayerSaveDTO, PageResult } from './types'

export const playerApi = {
  page: (params: { current?: number; size?: number; keyword?: string; pos?: string }) =>
    http.get<PageResult<Player>>('/players', params),

  all: () => http.get<Player[]>('/players/all'),

  get: (id: string) => http.get<Player>(`/players/${id}`),

  create: (data: PlayerSaveDTO) => http.post<Player>('/players', data),

  update: (id: string, data: PlayerSaveDTO) => http.put<Player>(`/players/${id}`, data),

  remove: (id: string) => http.delete<void>(`/players/${id}`),
}
