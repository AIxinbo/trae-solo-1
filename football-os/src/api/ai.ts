/**
 * AI 服务相关 API（走 Python AI 服务）
 */
import { http } from './client'
import type { ChatRequest, ChatResponse, TacticsAnalysisRequest, TacticsAnalysisResponse } from './types'

export const aiApi = {
  chat: (data: ChatRequest) => http.post<ChatResponse>('/chat', data, true),

  analyzeTactics: (data: TacticsAnalysisRequest) =>
    http.post<TacticsAnalysisResponse>('/tactics/analyze', data, true),
}
