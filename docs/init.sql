-- ============================================================
-- AI 小说写作平台 - 数据库建表脚本
-- 适用数据库: PostgreSQL 16 + pgvector
-- 使用方式: psql -h localhost -U ai_novel -d ai_novel -f init.sql
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. 项目表
-- ============================================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) NOT NULL DEFAULT '玄幻',
    style VARCHAR(50) DEFAULT 'default',
    synopsis TEXT DEFAULT '',
    target_platform VARCHAR(50) DEFAULT '',
    world_setting TEXT DEFAULT '',
    word_count_target INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    ai_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_user ON books(user_id);

-- ============================================================
-- 3. 大纲表（树形结构：卷 → 章 → 节）
-- ============================================================
CREATE TABLE outlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL CHECK (level IN ('volume', 'chapter', 'section')),
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    plot_points JSONB DEFAULT '[]',
    word_count_target INTEGER DEFAULT 0,
    emotion_curve VARCHAR(20) DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    ai_summary TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'done')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outlines_book ON outlines(book_id);
CREATE INDEX idx_outlines_parent ON outlines(parent_id);
CREATE INDEX idx_outlines_sort ON outlines(book_id, sort_order);

-- ============================================================
-- 4. 角色表（含语音特征字段）
-- ============================================================
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20) DEFAULT '',
    gender VARCHAR(10) DEFAULT '',
    role_type VARCHAR(20) NOT NULL DEFAULT 'supporter'
        CHECK (role_type IN ('protagonist', 'supporter', 'antagonist', 'extra')),
    appearance TEXT DEFAULT '',
    personality TEXT DEFAULT '',
    background TEXT DEFAULT '',
    motivation TEXT DEFAULT '',
    growth_arc JSONB DEFAULT '[]',
    relationships JSONB DEFAULT '[]',

    -- 语音特征（合并到角色表中）
    speech_style VARCHAR(30) DEFAULT '普通',
    formality_level FLOAT DEFAULT 0.5,
    avg_sentence_len INTEGER DEFAULT 8,
    favorite_words TEXT[] DEFAULT '{}',
    forbidden_words TEXT[] DEFAULT '{}',
    tone_words TEXT[] DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_characters_book ON characters(book_id);

-- ============================================================
-- 5. 章节正文表
-- ============================================================
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    ai_summary VARCHAR(500) DEFAULT '',
    word_count INTEGER DEFAULT 0,
    word_count_target INTEGER DEFAULT 0,
    characters UUID[] DEFAULT '{}',
    key_events JSONB DEFAULT '[]',
    pleasure_points JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'done')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_chapters_outline ON chapters(outline_id);
CREATE INDEX idx_chapters_sort ON chapters(book_id, sort_order);

-- ============================================================
-- 6. 章回版本历史表
-- ============================================================
CREATE TABLE chapter_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(300) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_versions_chapter ON chapter_versions(chapter_id);

-- ============================================================
-- 7. 审查评分记录表
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('outline', 'chapter')),
    target_id UUID NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    rewrite_required BOOLEAN DEFAULT FALSE,
    dimension_scores JSONB NOT NULL DEFAULT '{}',
    priority_issues JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_book ON reviews(book_id);

-- ============================================================
-- 8. 时间线事件表
-- ============================================================
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    event_desc VARCHAR(500) NOT NULL,
    involved_chars UUID[] DEFAULT '{}',
    location VARCHAR(200) DEFAULT '',
    season VARCHAR(10) DEFAULT '',
    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_book_day ON timeline_events(book_id, day_number);
CREATE INDEX idx_timeline_chapter ON timeline_events(chapter_id);

-- ============================================================
-- 9. 角色状态变更日志表
-- ============================================================
CREATE TABLE char_state_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    state_snapshot JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_char_state_char ON char_state_log(character_id);
CREATE INDEX idx_char_state_chapter ON char_state_log(chapter_id);

-- ============================================================
-- 10. 拆书分析记录表
-- ============================================================
CREATE TABLE analysis_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    source_title VARCHAR(200) NOT NULL,
    source_author VARCHAR(100) DEFAULT '',
    source_type VARCHAR(20) DEFAULT 'manual',
    structure_analysis JSONB DEFAULT '{}',
    character_analysis JSONB DEFAULT '{}',
    rhythm_analysis JSONB DEFAULT '{}',
    techniques JSONB DEFAULT '{}',
    templates JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analysis_book ON analysis_records(book_id);

-- ============================================================
-- 全部建表完成
-- 共 10 张表
-- ============================================================