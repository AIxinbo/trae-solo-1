import { api } from './client';
import type { TokenResponse, UserLogin, UserRegister } from '@/types';

export const authApi = {
  login: (data: UserLogin) => api.post<TokenResponse>('/auth/login', data),
  register: (data: UserRegister) => api.post<TokenResponse>('/auth/register', data),
};