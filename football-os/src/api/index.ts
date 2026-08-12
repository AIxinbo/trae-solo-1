/**
 * API 对接层统一出口
 */
export * from './types'
export { http, getToken, setToken, removeToken } from './client'
export { formationApi } from './formations'
export { playerApi } from './players'
export { tacticsApi } from './tactics'
export { authApi } from './auth'
export type { LoginDTO, LoginVO } from './auth'
export { aiApi } from './ai'
