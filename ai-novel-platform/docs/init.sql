-- AI 小说写作平台 - 数据库初始化脚本
-- PostgreSQL 16
-- 注意：实际建表由 SQLAlchemy Base.metadata.create_all() 自动完成
-- 此文件为 Docker 初始化备份，仅用于首次启动时创建基础表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 作品表
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) NOT NULL DEFAULT '玄幻',
    style VARCHAR(50) DEFAULT 'default',
    synopsis TEXT DEFAULT '',
    world_setting TEXT DEFAULT '',
    target_platform VARCHAR(50) DEFAULT '',
    word_count_target INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    ai_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 大纲表
CREATE TABLE IF NOT EXISTS outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    plot_points JSONB DEFAULT '[]',
    word_count_target INTEGER DEFAULT 0,
    emotion_curve VARCHAR(20) DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    ai_summary TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 细纲表
CREATE TABLE IF NOT EXISTS detailed_outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    scene_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(200) NOT NULL,
    function VARCHAR(30) DEFAULT '',
    emotion VARCHAR(20) DEFAULT '',
    word_count_target INTEGER DEFAULT 0,
    characters UUID[],
    location VARCHAR(200) DEFAULT '',
    day_number INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    key_dialogues TEXT DEFAULT '',
    pleasure_types VARCHAR[],
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20) DEFAULT '',
    gender VARCHAR(10) DEFAULT '',
    role_type VARCHAR(20) NOT NULL DEFAULT 'supporter',
    appearance TEXT DEFAULT '',
    personality TEXT DEFAULT '',
    background TEXT DEFAULT '',
    motivation TEXT DEFAULT '',
    growth_arc JSONB DEFAULT '[]',
    relationships JSONB DEFAULT '[]',
    speech_style VARCHAR(30) DEFAULT '普通',
    formality_level FLOAT DEFAULT 0.5,
    avg_sentence_len INTEGER DEFAULT 8,
    favorite_words VARCHAR[],
    forbidden_words VARCHAR[],
    tone_words VARCHAR[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    ai_summary VARCHAR(500) DEFAULT '',
    word_count INTEGER DEFAULT 0,
    word_count_target INTEGER DEFAULT 0,
    characters UUID[],
    key_events JSONB DEFAULT '[]',
    pleasure_points JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 章节版本表
CREATE TABLE IF NOT EXISTS chapter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(300) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审查记录表
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    target_type VARCHAR(10) NOT NULL,
    target_id UUID NOT NULL,
    overall_score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    rewrite_required BOOLEAN DEFAULT FALSE,
    dimension_scores JSONB NOT NULL,
    priority_issues JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 时间线事件表
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    event_desc VARCHAR(500) NOT NULL,
    involved_chars UUID[],
    location VARCHAR(200) DEFAULT '',
    season VARCHAR(10) DEFAULT '',
    importance INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 角色状态日志表
CREATE TABLE IF NOT EXISTS char_state_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    state_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 拆书分析记录表
CREATE TABLE IF NOT EXISTS analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source_title VARCHAR(200) NOT NULL,
    source_author VARCHAR(100) DEFAULT '',
    source_type VARCHAR(20) DEFAULT 'manual',
    source_content TEXT DEFAULT '',
    structure_analysis JSONB DEFAULT '{}',
    character_analysis JSONB DEFAULT '{}',
    rhythm_analysis JSONB DEFAULT '{}',
    techniques JSONB DEFAULT '{}',
    templates JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户模型配置表
CREATE TABLE IF NOT EXISTS user_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'openai-compatible',
    base_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(500) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    scenes JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 写作日志表
CREATE TABLE IF NOT EXISTS writing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(300) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_outlines_book_id ON outlines(book_id);
CREATE INDEX IF NOT EXISTS idx_detailed_outlines_book_id ON detailed_outlines(book_id);
CREATE INDEX IF NOT EXISTS idx_characters_book_id ON characters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_chapter_id ON reviews(chapter_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_book_id ON timeline_events(book_id);
CREATE INDEX IF NOT EXISTS idx_writing_logs_book_id ON writing_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_writing_logs_created_at ON writing_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_model_configs_user_id ON user_model_configs(user_id);