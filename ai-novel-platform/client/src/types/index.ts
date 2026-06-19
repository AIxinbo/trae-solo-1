export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  nickname?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface BookCreate {
  title: string;
  genre?: string;
  style?: string;
  synopsis?: string;
  target_platform?: string;
  world_setting?: string;
  word_count_target?: number;
  ai_config?: Record<string, unknown>;
}

export interface BookUpdate {
  title?: string;
  genre?: string;
  style?: string;
  synopsis?: string;
  target_platform?: string;
  world_setting?: string;
  word_count_target?: number;
  status?: string;
  ai_config?: Record<string, unknown>;
}

export interface BookResponse {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  style: string;
  synopsis: string;
  target_platform: string;
  world_setting: string;
  word_count_target: number;
  status: string;
  ai_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OutlineNode {
  id: string;
  book_id: string;
  parent_id: string | null;
  level: string;
  title: string;
  content: string;
  plot_points: unknown[];
  word_count_target: number;
  emotion_curve: string;
  sort_order: number;
  status: string;
  created_at: string;
  children?: OutlineNode[];
}

export interface Character {
  id: string;
  book_id: string;
  name: string;
  age: string;
  gender: string;
  role_type: string;
  appearance: string;
  personality: string;
  background: string;
  motivation: string;
  speech_style: string;
  formality_level: number;
  avg_sentence_len: number;
  favorite_words: string[];
  forbidden_words: string[];
  tone_words: string[];
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  outline_id: string | null;
  title: string;
  content: string;
  word_count: number;
  word_count_target: number;
  characters: string[];
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewResult {
  review_id: string;
  overall_score: number;
  passed: boolean;
  rewrite_required: boolean;
  dimensions: Record<string, { score: number; issues: unknown[]; suggestions: string }>;
  priority_issues: unknown[];
}

export interface DetailedOutline {
  id: string;
  book_id: string;
  chapter_id: string;
  scene_index: number;
  title: string;
  function: string;
  emotion: string;
  word_count_target: number;
  characters: string[];
  location: string;
  day_number: number;
  description: string;
  key_dialogues: string;
  pleasure_types: string[];
  status: string;
  created_at: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  base_url: string;
  model_name: string;
  scenes: string[];
  is_active: boolean;
  sort_order: number;
}

export interface WritingLog {
  id: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}