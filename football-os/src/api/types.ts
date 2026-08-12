/**
 * API 类型定义
 */

// ============================================================
// 通用响应
// ============================================================
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// ============================================================
// 球员
// ============================================================
export interface Player {
  id: string
  no: string
  name: string
  posLabel: string
  pos: string
  rating: number
  ratingAttack: number
  ratingPass: number
  ratingSetpiece: number
  ratingDefense: number
  ratingSpeed: number
  ratingPhysical: number
  health: string
  healthNote: string | null
  age: number
  height: number
  weight: number
  contract: string
  value: string
  ratingDelta: string
}

export interface PlayerSaveDTO {
  id?: string
  no: string
  name: string
  posLabel: string
  pos: string
  ratingAttack?: number
  ratingPass?: number
  ratingSetpiece?: number
  ratingDefense?: number
  ratingSpeed?: number
  ratingPhysical?: number
  health?: string
  healthNote?: string
  age?: number
  height?: number
  weight?: number
  contract?: string
  value?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// ============================================================
// 阵型
// ============================================================
export interface Formation {
  id: string
  name: string
  label: string
  summary: string
  isPreset: number
  positions: string
}

export interface FormationDetail {
  id: string
  name: string
  label: string
  summary: string
  isPreset: number
  positions: FormationPosition[]
  totalScore: number
}

export interface FormationPosition {
  no: string
  left: string
  top: string
  role: 'gk' | 'def' | 'mid' | 'fwd'
  pos: string
  playerId?: string
  playerName?: string
  playerRating?: number
}

export interface FormationSaveDTO {
  id?: string
  name: string
  label?: string
  summary?: string
  positions: string
}

// ============================================================
// 战术库
// ============================================================
export interface TacticsLibrary {
  id: string
  name: string
  coach: string
  formationId: string
  description: string
  playbook: string
  isPreset: number
}

export interface TacticsSaveDTO {
  id?: string
  name: string
  coach?: string
  formationId?: string
  description?: string
  playbook?: string
}

// ============================================================
// AI 对话
// ============================================================
export interface ChatRequest {
  sessionId?: string
  message: string
  context?: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponse {
  sessionId: string
  reply: string
  suggestions: string[]
  tokens: number
}

// ============================================================
// 战术分析
// ============================================================
export interface TacticsAnalysisRequest {
  formation: string
  opponent?: string
  matchData?: Record<string, unknown>
}

export interface TacticsSuggestion {
  category: 'attack' | 'defense' | 'midfield'
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  reason: string
}

export interface TacticsAnalysisResponse {
  formation: string
  overallScore: number
  suggestions: TacticsSuggestion[]
  keyPlayers: { no: string; name: string; pos: string; rating: number; reason: string }[]
}
