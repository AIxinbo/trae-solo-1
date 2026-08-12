/**
 * 阵型相关 API
 */
import { http } from './client'
import type { Formation, FormationDetail, FormationSaveDTO } from './types'

export const formationApi = {
  list: () => http.get<Formation[]>('/formations'),

  detail: (id: string) => http.get<FormationDetail>(`/formations/${id}`),

  create: (data: FormationSaveDTO) => http.post<Formation>('/formations', data),

  update: (id: string, data: FormationSaveDTO) => http.put<Formation>(`/formations/${id}`, data),

  remove: (id: string) => http.delete<void>(`/formations/${id}`),
}
