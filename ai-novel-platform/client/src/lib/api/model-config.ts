import { api } from './client';
import type { ModelConfig } from '@/types';

export interface ModelConfigCreate {
  name: string;
  base_url: string;
  api_key: string;
  model_name: string;
  scenes?: string[];
}

export const modelConfigApi = {
  list: () => api.get<ModelConfig[]>('/user/model-configs'),
  create: (data: ModelConfigCreate) => api.post<ModelConfig>('/user/model-configs', data),
  update: (id: string, data: Partial<ModelConfig>) => api.put<ModelConfig>(`/user/model-configs/${id}`, data),
  delete: (id: string) => api.delete<void>(`/user/model-configs/${id}`),
};