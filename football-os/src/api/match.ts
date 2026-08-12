/**
 * 赛事相关 API
 */
import { http } from './client'
import type { MatchItem, MatchSaveDTO, PageResult } from './types'

export const matchApi = {
  page: (params: { current?: number; size?: number; status?: string; keyword?: string }) =>
    http.get<PageResult<MatchItem>>('/matches', params),

  upcoming: (limit = 5) => http.get<MatchItem[]>('/matches/upcoming', { limit }),

  recent: (limit = 5) => http.get<MatchItem[]>('/matches/recent', { limit }),

  get: (id: string) => http.get<MatchItem>(`/matches/${id}`),

  create: (data: MatchSaveDTO) => http.post<MatchItem>('/matches', data),

  update: (id: string, data: MatchSaveDTO) => http.put<MatchItem>(`/matches/${id}`, data),

  updateScore: (id: string, scoreHome: number, scoreAway: number) =>
    http.put<void>(`/matches/${id}/score?scoreHome=${scoreHome}&scoreAway=${scoreAway}`),

  remove: (id: string) => http.delete<void>(`/matches/${id}`),
}
