/**
 * 训练计划相关 API
 */
import { http } from './client'
import type { TrainingItem, TrainingSaveDTO, PageResult } from './types'

export const trainingApi = {
  page: (params: { current?: number; size?: number; type?: string; start?: string; end?: string }) =>
    http.get<PageResult<TrainingItem>>('/trainings', params),

  today: () => http.get<TrainingItem[]>('/trainings/today'),

  week: () => http.get<TrainingItem[]>('/trainings/week'),

  get: (id: string) => http.get<TrainingItem>(`/trainings/${id}`),

  create: (data: TrainingSaveDTO) => http.post<TrainingItem>('/trainings', data),

  update: (id: string, data: TrainingSaveDTO) => http.put<TrainingItem>(`/trainings/${id}`, data),

  remove: (id: string) => http.delete<void>(`/trainings/${id}`),
}
