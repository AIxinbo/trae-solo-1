/**
 * 战术库相关 API
 */
import { http } from './client'
import type { TacticsLibrary, TacticsSaveDTO } from './types'

export const tacticsApi = {
  list: () => http.get<TacticsLibrary[]>('/tactics'),

  get: (id: string) => http.get<TacticsLibrary>(`/tactics/${id}`),

  create: (data: TacticsSaveDTO) => http.post<TacticsLibrary>('/tactics', data),

  update: (id: string, data: TacticsSaveDTO) => http.put<TacticsLibrary>(`/tactics/${id}`, data),

  remove: (id: string) => http.delete<void>(`/tactics/${id}`),
}
