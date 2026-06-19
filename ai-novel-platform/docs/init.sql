-- AI 小说写作平台 - 数据库初始化脚本
-- PostgreSQL 16

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL UNIQUE,
    hashed_password VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 作品表
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) DEFAULT '玄幻',
    style VARCHAR(50) DEFAULT '',
    synopsis TEXT DEFAULT '',
    world_setting TEXT DEFAULT '',
    target_platform VARCHAR(50) DEFAULT '',
    word_count_target INTEGER DEFAULT 100000,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 大纲表
CREATE TABLE IF NOT EXISTS outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    level VARCHAR(20) DEFAULT 'chapter',
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    emotion_curve VARCHAR(100) DEFAULT '',
    word_count_target INTEGER DEFAULT 2000,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 细纲表
CREATE TABLE IF NOT EXISTS detailed_outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    scene_index INTEGER DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    function VARCHAR(50) DEFAULT '',
    emotion VARCHAR(20) DEFAULT '平',
    word_count_target INTEGER DEFAULT 500,
    characters JSONB DEFAULT '[]',
    location VARCHAR(100) DEFAULT '',
    day_number INTEGER DEFAULT 1,
    description TEXT DEFAULT '',
    key_dialogues TEXT DEFAULT '',
    pleasure_types JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20) DEFAULT '',
    gender VARCHAR(10) DEFAULT '男',
    role_type VARCHAR(20) DEFAULT '配角',
    appearance TEXT DEFAULT '',
    personality TEXT DEFAULT '',
    background TEXT DEFAULT '',
    motivation TEXT DEFAULT '',
    speech_style TEXT DEFAULT '',
    formality_level FLOAT DEFAULT 0.5,
    avg_sentence_len INTEGER DEFAULT 15,
    favorite_words JSONB DEFAULT '[]',
    forbidden_words JSONB DEFAULT '[]',
    tone_words JSONB DEFAULT '[]',
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
    word_count INTEGER DEFAULT 0,
    word_count_target INTEGER DEFAULT 2000,
    characters JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    ai_summary TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 章节版本表
CREATE TABLE IF NOT EXISTS chapter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER DEFAULT 1,
    content TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审查记录表
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    target_type VARCHAR(20) DEFAULT 'chapter',
    target_id UUID NOT NULL,
    overall_score INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    rewrite_required BOOLEAN DEFAULT FALSE,
    dimension_scores JSONB DEFAULT '{}',
    priority_issues JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 时间线事件表
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    day_number INTEGER DEFAULT 1,
    event_desc TEXT DEFAULT '',
    involved_chars JSONB DEFAULT '[]',
    location VARCHAR(100) DEFAULT '',
    season VARCHAR(20) DEFAULT '',
    importance INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 角色状态日志表
CREATE TABLE IF NOT EXISTS char_state_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    chapter_number INTEGER DEFAULT 1,
    state_snapshot JSONB DEFAULT '{}',
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户模型配置表
CREATE TABLE IF NOT EXISTS user_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
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
    action VARCHAR(50) DEFAULT '',
    description TEXT DEFAULT '',
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