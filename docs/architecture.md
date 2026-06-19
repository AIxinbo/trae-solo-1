# AI小说写作平台 - 架构设计文档

## 一、系统架构总览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          前端 (Next.js 16)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ 拆书页面  │  │ 大纲页面  │  │ 角色页面  │  │  章节编辑器       │  │
│  │ BookAnalysis│ OutlineMgmt│ CharacterMgmt│ ChapterEditor      │  │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └────────┬──────────┘  │
│        └──────────────┴──────────────┴────────────────┘             │
│                              │                                      │
│                        API 客户端层 (fetch/axios)                   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP/SSE
┌──────────────────────────────┼──────────────────────────────────────┐
│                    后端 (Python FastAPI)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ 拆书服务  │  │ 大纲服务  │  │ 角色服务  │  │  章节生成服务     │  │
│  │ BookAnalysis│ OutlineSvc │ CharacterSvc│ ChapterGenSvc      │  │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └────────┬──────────┘  │
│        └──────────────┴──────────────┴────────────────┘             │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   AI 服务层 (AI Service Layer)               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │DeepSeek  │  │  Kimi    │  │  通义千问 │  │ 模型路由 │   │   │
│  │  │ 适配器   │  │  适配器  │  │  适配器   │  │  调度器  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               上下文引擎 (Context Engine)                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │章节摘要  │  │ 大纲注入  │  │ 角色注入  │  │ RAG检索  │   │   │
│  │  │ Summarizer│ OutlineInj│ CharacterInj│ Retriever    │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              审查引擎 (Review Engine)                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │大纲审查  │  │ 爽点分析  │  │ 逻辑审查  │  │ 人设审查 │   │   │
│  │  │ OutlineRv│ PaceAnalyze│ LogicCheck│ CharCheck │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                         数据库 (PostgreSQL + pgvector)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  books   │  │ outlines │  │characters│  │    chapters       │  │
│  │ 项目表   │  │ 大纲表   │  │ 角色表   │  │   章节表          │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │analysis  │  │ reviews  │  │versions  │  │   embeddings      │  │
│  │拆书记录  │  │审查记录  │  │版本表    │  │  向量索引         │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

| 层级 | 技术选型 | 版本 | 选型理由 |
|-----|---------|------|---------|
| 前端框架 | Next.js | 16 | React 全栈框架，SSR/SSG 支持好，国内社区活跃 |
| UI 组件 | Tailwind CSS + shadcn/ui | latest | 快速构建美观 UI，组件库丰富 |
| 富文本编辑器 | TipTap / Novel Editor | latest | 基于 ProseMirror，适合长文编辑 |
| 树形组件 | react-arborist / dnd-kit | latest | 拖拽排序树形大纲 |
| 状态管理 | Zustand | latest | 轻量级状态管理，适合中大型应用 |
| 后端框架 | Python FastAPI | latest | 异步高性能，AI 生态丰富 |
| ORM | SQLAlchemy 2.0 + Alembic | latest | Python 最成熟的 ORM，支持异步 |
| 数据库 | PostgreSQL | 16 | 最成熟的关系型数据库，支持向量检索 |
| 向量检索 | pgvector | latest | PostgreSQL 原生插件，无需额外组件 |
| AI SDK | LangChain / LiteLLM | latest | 统一多模型调用接口，支持模型路由 |
| 缓存 | Redis | 7 | 缓存 AI 响应，加速重复请求 |
| 认证 | JWT + OAuth2 | - | 无状态认证，前后端分离 |
| 部署 | Docker + Docker Compose | - | 一键部署，环境一致性 |

---

## 二、详细数据模型设计

### 2.1 ER 图

```
┌────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     books      │       │    outlines       │       │   characters     │
│────────────────│       │──────────────────│       │──────────────────│
│ id (PK)        │──1:N──│ id (PK)           │       │ id (PK)          │
│ user_id (FK)   │       │ book_id (FK)      │       │ book_id (FK)     │
│ title          │       │ parent_id (FK)    │──1:N──│ name             │
│ genre          │       │ level (卷/章/节)   │       │ age              │
│ style          │       │ title             │       │ gender           │
│ synopsis       │       │ content           │       │ appearance       │
│ target_platform│       │ plot_points (JSON)│       │ personality      │
│ is_published   │       │ emotion_curve     │       │ background       │
│ created_at     │       │ sort_order        │       │ motivation       │
│ updated_at     │       │ ai_summary        │       │ growth_arc (JSON)│
└────────────────┘       │ created_at        │       │ relationships    │
       │                  │ updated_at        │       │ (JSON)           │
       │                  └──────────────────┘       │ knowledge        │
       │                                             │ role_type        │
       │                  ┌──────────────────┐       │ created_at       │
       │                  │   chapters        │       └──────────────────┘
       │                  │──────────────────│
       │──1:N─────────────│ id (PK)           │
       │                  │ book_id (FK)      │
       │                  │ outline_id (FK)   │
       │                  │ title             │
       │                  │ content (TEXT)    │
       │                  │ ai_summary        │
       │                  │ word_count        │
       │                  │ characters (JSON) │
       │                  │ key_events (JSON) │
       │                  │ status (draft/    │
       │                  │   review/done)     │
       │                  │ sort_order        │
       │                  │ created_at        │
       │                  │ updated_at        │
       │                  └──────────────────┘
       │                         │
       │                  ┌──────────────────┐
       │                  │ chapter_versions  │
       │                  │──────────────────│
       │                  │ id (PK)          │
       │                  │ chapter_id (FK)  │──1:N
       │                  │ version_number   │
       │                  │ content (TEXT)   │
       │                  │ summary          │
       │                  │ created_at       │
       │                  └──────────────────┘
       │
       │                  ┌──────────────────┐
       │                  │  analysis_records │
       │                  │──────────────────│
       │──1:N─────────────│ id (PK)          │
       │                  │ book_id (FK)     │
       │                  │ source_title     │
       │                  │ source_author    │
       │                  │ structure_analysis│
       │                  │  (JSON)          │
       │                  │ character_analysis│
       │                  │  (JSON)          │
       │                  │ rhythm_analysis  │
       │                  │  (JSON)          │
       │                  │ techniques (JSON)│
       │                  │ templates (JSON) │
       │                  │ created_at       │
       │                  └──────────────────┘
```

### 2.2 核心表详细设计

#### books (项目表)

```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) NOT NULL,           -- 玄幻/都市/仙侠/悬疑/历史/科幻
    style VARCHAR(50) DEFAULT 'default',   -- 风格模板：爽文/压抑/轻松
    synopsis TEXT,                         -- 故事简介
    target_platform VARCHAR(50),           -- 目标平台：番茄/起点/七猫
    world_setting TEXT,                    -- 世界观设定
    word_count_target INTEGER DEFAULT 0,   -- 目标字数
    status VARCHAR(20) DEFAULT 'draft',    -- draft/active/completed
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### outlines (大纲节点表) — 树形结构

```sql
CREATE TABLE outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL,           -- 'volume'(卷) / 'chapter'(章) / 'section'(节)
    title VARCHAR(200) NOT NULL,
    content TEXT,                          -- 节点描述
    plot_points JSONB DEFAULT '[]',       -- [{"type": "conflict", "desc": "..."}]
    emotion_curve VARCHAR(20),            -- 情绪基调：平静/紧张/压抑/高潮
    word_count_target INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    ai_summary TEXT,                       -- AI生成的摘要
    status VARCHAR(20) DEFAULT 'draft',   -- draft/review/done
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_outlines_book ON outlines(book_id);
CREATE INDEX idx_outlines_parent ON outlines(parent_id);
CREATE INDEX idx_outlines_sort ON outlines(book_id, sort_order);
```

#### characters (角色表)

```sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20),
    gender VARCHAR(10),
    role_type VARCHAR(20) NOT NULL,      -- protagonist(主角)/supporter(配角)/antagonist(反派)/extra(龙套)
    appearance TEXT,                      -- 外貌描述
    personality TEXT,                     -- 性格特点
    background TEXT,                      -- 背景故事
    motivation TEXT,                      -- 核心动机
    growth_arc JSONB DEFAULT '[]',        -- [{"stage": "前期", "personality": "...", "ability": "..."}]
    relationships JSONB DEFAULT '[]',     -- [{"target_id": "uuid", "type": "师徒", "intimacy": 80}]
    knowledge TEXT,                       -- 角色知道什么
    tags TEXT[] DEFAULT '{}',             -- 关键词标签，用于检索
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_characters_book ON characters(book_id);
CREATE INDEX idx_characters_role ON characters(book_id, role_type);
```

#### chapters (章节正文表)

```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',               -- 正文内容
    ai_summary VARCHAR(500),              -- AI生成的章节摘要
    word_count INTEGER DEFAULT 0,
    characters JSONB DEFAULT '[]',        -- 出场角色ID列表
    key_events JSONB DEFAULT '[]',        -- [{"event": "打脸反派", "type": "爽点"}]
    pleasure_points JSONB DEFAULT '[]',   -- 爽点标记 [{"type": "打脸", "position": 1200, "intensity": 8}]
    emotion_curve INTEGER[],              -- 情绪值数组，每200字采样一次
    status VARCHAR(20) DEFAULT 'draft',   -- draft/review/done
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,      -- 锁定防止编辑
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_chapters_outline ON chapters(outline_id);
CREATE INDEX idx_chapters_sort ON chapters(book_id, sort_order);
```

#### chapter_versions (章节版本历史)

```sql
CREATE TABLE chapter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(300),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_versions_chapter ON chapter_versions(chapter_id);
```

#### analysis_records (拆书记录)

```sql
CREATE TABLE analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,  -- 关联到分析结果创建的项目
    source_title VARCHAR(200) NOT NULL,    -- 被分析的作品名称
    source_author VARCHAR(100),
    source_type VARCHAR(20) DEFAULT 'manual', -- manual/paste/upload
    structure_analysis JSONB,              -- 结构分析
    character_analysis JSONB,              -- 角色分析
    rhythm_analysis JSONB,                 -- 节奏/爽点分析
    techniques JSONB,                      -- 写作技巧
    templates JSONB,                       -- 可复用模板
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### reviews (审查记录)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,      -- outline(大纲审查)/chapter(正文审查)
    target_id UUID NOT NULL,               -- 对应的outline_id或chapter_id
    review_type VARCHAR(30) NOT NULL,       -- logic/consistency/rhythm/character/pleasure
    score INTEGER CHECK (score >= 0 AND score <= 100),
    issues JSONB DEFAULT '[]',             -- [{"severity": "high", "content": "..."}]
    suggestions TEXT,                       -- 修改建议
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
```

#### prompt_templates (提示词模板表)

```sql
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,          -- outline/character/chapter/review/style
    genre VARCHAR(50),                      -- 适用题材
    content TEXT NOT NULL,                   -- 模板内容
    description VARCHAR(300),
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 三、API 接口设计

### 3.1 API 路由总览

```
API 前缀: /api/v1

认证相关:
  POST   /auth/register          # 注册
  POST   /auth/login             # 登录
  POST   /auth/refresh           # 刷新 Token

项目管理:
  GET    /books                  # 获取项目列表
  POST   /books                  # 创建项目
  GET    /books/{id}             # 获取项目详情
  PUT    /books/{id}             # 更新项目
  DELETE /books/{id}             # 删除项目

大纲管理:
  GET    /books/{id}/outlines    # 获取大纲树
  POST   /books/{id}/outlines    # 创建大纲节点
  PUT    /outlines/{id}          # 更新大纲节点
  DELETE /outlines/{id}          # 删除大纲节点
  PUT    /outlines/reorder       # 大纲节点排序
  POST   /outlines/ai-generate   # AI生成大纲
  POST   /outlines/ai-extract    # AI提取大纲（从已有作品）
  POST   /outlines/ai-review     # AI审查大纲

角色管理:
  GET    /books/{id}/characters  # 获取角色列表
  POST   /books/{id}/characters  # 创建角色
  PUT    /characters/{id}        # 更新角色
  DELETE /characters/{id}        # 删除角色
  POST   /characters/ai-generate # AI生成角色
  GET    /books/{id}/characters/relations  # 角色关系图

章节管理:
  GET    /books/{id}/chapters    # 获取章节列表
  POST   /books/{id}/chapters    # 创建章节
  GET    /chapters/{id}          # 获取章节内容
  PUT    /chapters/{id}          # 更新章节内容
  DELETE /chapters/{id}          # 删除章节
  POST   /chapters/{id}/generate # AI生成章节正文（SSE流式）
  POST   /chapters/{id}/rewrite  # AI重写选中段落
  POST   /chapters/{id}/expand   # AI扩写
  POST   /chapters/{id}/polish   # AI润色

版本管理:
  GET    /chapters/{id}/versions # 获取版本列表
  GET    /versions/{id}          # 获取版本内容
  POST   /chapters/{id}/versions # 创建新版本
  POST   /versions/{id}/restore  # 回滚到指定版本

拆书分析:
  POST   /analysis/upload        # 上传作品进行拆书
  POST   /analysis/paste         # 粘贴内容拆书
  GET    /analysis/{id}          # 获取拆书报告
  POST   /analysis/{id}/generate-template  # 基于拆书结果生成大纲模板

审查:
  POST   /review/outline         # 审查大纲
  POST   /review/chapter         # 审查正文
  GET    /books/{id}/reviews     # 获取审查记录

提示词模板:
  GET    /prompts                # 获取模板列表
  POST   /prompts                # 创建模板
  GET    /prompts/{id}           # 获取模板详情
  GET    /prompts/public         # 获取公开模板
```

### 3.2 关键 API 详细设计

#### POST /api/v1/outlines/ai-generate — AI 生成大纲

```
请求:
{
    "book_id": "uuid",
    "genre": "玄幻",
    "style": "爽文",
    "core_idea": "废柴少年获得上古传承，逆天改命",
    "chapter_count": 20,
    "reference_analysis_id": "uuid (可选，参考拆书结果)"
}

响应 (SSE 流式):
event: node
data: {"id": "uuid", "level": "volume", "title": "卷一：觉醒", "content": "..."}

event: node
data: {"id": "uuid", "level": "chapter", "title": "第1章：退婚羞辱", "content": "..."}

event: complete
data: {"outline_ids": ["uuid1", "uuid2", ...]}
```

#### POST /api/v1/chapters/{id}/generate — AI 生成章节正文 (SSE)

```
请求:
{
    "model": "deepseek",          // 模型选择
    "temperature": 0.8,
    "max_length": 3000,
    "style_hints": ["节奏紧凑", "对话生动"]
}

响应 (SSE 流式):
event: context
data: {"summary": "...", "characters": [...], "outline": "..."}

event: token
data: {"text": "深夜，江滨市刑警大队的灯光依然亮着..."}

event: token
data: {"text": "国强推开会议室的门，..."

event: complete
data: {"chapter_id": "uuid", "word_count": 2850, "summary": "..."}
```

#### POST /api/v1/analysis/upload — 上传拆书分析

```
请求 (multipart/form-data):
    file: 小说文件 (txt/md)
    title: "作品名称"
    author: "作者名"

响应:
{
    "analysis_id": "uuid",
    "status": "processing",
    "estimated_time": 30
}

GET /api/v1/analysis/{id} 响应:
{
    "id": "uuid",
    "source_title": "作品名称",
    "structure_analysis": {
        "total_chapters": 100,
        "arcs": [
            {"name": "卷一", "chapters": "1-20", "type": "觉醒篇"},
            {"name": "卷二", "chapters": "21-45", "type": "成长篇"}
        ],
        "rhythm_pattern": "起-承-转-合",
        "pleasure_density": "每3-4章1个小爽点",
        "opening_analysis": "黄金三章分析..."
    },
    "character_analysis": {
        "main_characters": [
            {"name": "张三", "role": "主角", "traits": ["勇敢", "正直"]}
        ],
        "relationships": [...]
    },
    "techniques": {
        "narrative_style": "...",
        "dialogue_features": "...",
        "description_highlights": "..."
    },
    "templates": {
        "outline_template": "...",
        "character_template": "..."
    }
}
```

#### POST /api/v1/review/outline — AI 审查大纲

```
请求:
{
    "book_id": "uuid",
    "outline_ids": ["uuid1", "uuid2", ...]
}

响应:
{
    "score": 78,
    "dimensions": [
        {
            "name": "节奏合理性",
            "score": 82,
            "issues": [
                {"severity": "warning", "content": "第5-8章连续铺垫无爽点，建议插入小型冲突"}
            ]
        },
        {
            "name": "逻辑连贯性",
            "score": 90,
            "issues": []
        },
        {
            "name": "角色动机",
            "score": 75,
            "issues": [
                {"severity": "warning", "content": "反派的作恶动机不够充分，建议增加背景交代"}
            ]
        },
        {
            "name": "爽点密度",
            "score": 65,
            "issues": [
                {"severity": "high", "content": "前10章仅2个爽点，建议增加到3-4个"}
            ]
        }
    ],
    "suggestions": "整体大纲结构完整，建议在中期增加情绪起伏..."
}
```

---

## 四、上下文引擎设计

### 4.1 三重上下文注入流程

```
用户请求生成第 N 章
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  上下文组装器 (Context Assembler)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  第1层：近5章摘要 (来自 chapters.ai_summary)                   │
│  ───────────────────────────────────────────────────────────  │
│  从第 N-5 章到第 N-1 章，每章取 100 字摘要                    │
│  如果 N < 5 则取所有已有章节摘要                              │
│                                                             │
│  第2层：当前大纲节点 (来自 outlines)                           │
│  ───────────────────────────────────────────────────────────  │
│  获取当前章节的 outline 节点                                  │
│  向上获取所属卷的大纲节点                                    │
│  格式：卷目标 → 章目标                                       │
│                                                             │
│  第3层：角色设定 (来自 characters)                             │
│  ───────────────────────────────────────────────────────────  │
│  从 chapters.characters 获取出场角色 ID                      │
│  根据角色 ID 获取完整角色卡片                                 │
│  如果没有标注出场角色，根据大纲内容 AI 预测出场角色           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  提示词组装器 (Prompt Builder)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  System Prompt =                                              │
│    "你是一位专业的网文作者，擅长写【题材】类小说。"             │
│    + "当前作品：《书名》，风格：【风格】"                      │
│    + "=== 近期剧情摘要 ==="                                   │
│    + 第1层内容                                                │
│    + "=== 本章目标 ==="                                       │
│    + 第2层内容                                                │
│    + "=== 出场角色 ==="                                       │
│    + 第3层内容                                                │
│    + "=== 写作要求 ==="                                       │
│    + 风格指令 + 节奏指令                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
    调用大模型生成正文
```

### 4.2 RAG 检索增强

```
当写第 N 章时需要检索历史信息时：
                                   ┌──────────────────────┐
                                   │ 向量数据库 (pgvector)  │
                                   │                      │
用户输入:                           │ chapters.summary →   │
"主角李明的身世之谜"                  │ 向量化 → 存储         │
        │                          │ key_events → 向量化   │
        ▼                          │ characters → 向量化   │
┌────────────────────┐             └──────────┬───────────┘
│  query 编码器       │                        │
│ (调用大模型做嵌入)   │────────────────────────┤
└────────────────────┘                        │
        │                                     ▼
        │                            ┌────────────────────┐
        │                            │   相似度检索        │
        └────────────────────────────│ (余弦相似度, top_k=5)│
                                     └────────────────────┘
                                              │
                                              ▼
                                     ┌────────────────────┐
                                     │  注入到 Prompt 中   │
                                     │  作为参考信息        │
                                     └────────────────────┘
```

---

## 五、拆书引擎设计

### 5.1 拆书分析流水线

```
用户上传/粘贴小说内容
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  文本预处理                                                    │
│  ├── 自动分章（根据"第X章"、空行、数字编号）                   │
│  ├── 每章生成 100 字摘要                                      │
│  └── 提取章节标题和基本信息                                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  结构分析 (调用大模型)                                         │
│  ├── 整体故事弧线识别（起承转合/三幕剧）                      │
│  ├── 章节节奏标注（铺垫/冲突/高潮/过渡）                      │
│  ├── 爽点类型和位置识别                                      │
│  └── 开篇分析（黄金三章）                                    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  角色分析 (调用大模型)                                         │
│  ├── 提取所有有名字的角色                                    │
│  ├── 标注角色类型（主角/配角/反派/龙套）                     │
│  ├── 分析性格特点/动机/成长弧                               │
│  └── 建立角色关系网                                          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  写作技巧提取 (调用大模型)                                     │
│  ├── 叙事手法识别（视角/时间线/伏笔）                        │
│  ├── 对话风格分析                                            │
│  ├── 描写特点提取                                            │
│  └── 节奏控制技巧总结                                        │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  模板生成                                                     │
│  ├── 生成可复用的大纲模板（占位替换）                        │
│  ├── 生成角色模板                                            │
│  └── 生成节奏模板                                            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
    输出结构化拆书报告
```

### 5.2 拆书 Prompt 模板

```
System Prompt (拆书模式):
"""
你是一位资深的网文编辑，擅长分析小说作品的结构和写作技巧。
请对以下小说进行系统性拆解分析。

分析维度：
1. 结构维度：整体故事弧线、章节节奏
2. 角色维度：主角/配角/反派设定，人物弧光
3. 爽点维度：爽点类型、分布位置、密度
4. 技巧维度：叙事手法、对话风格、描写特点

输出格式：严格按照 JSON 格式输出。
"""
```

---

## 六、审查引擎设计

### 6.1 审查维度

```
大纲审查:
  ├── ✅ 节奏合理性     → 铺垫/冲突/高潮比例是否合理
  ├── ✅ 逻辑连贯性     → 事件因果关系是否成立
  ├── ✅ 角色动机       → 角色行为动机是否充分
  ├── ✅ 爽点密度       → 爽点分布是否达标
  └── ✅ 结构完整性     → 起承转合是否完整

正文审查:
  ├── ✅ 人设一致性     → 角色行为是否符合设定
  ├── ✅ 情节一致性     → 与前文是否有矛盾
  ├── ✅ 节奏评价       → 本章节奏是否合适
  ├── ✅ 对话质量       → 对话是否自然
  └── ✅ 语感评价       → 是否有AI腔
```

### 6.2 审查流程

```
POST /api/v1/review/chapter
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  审查上下文组装                                               │
│  ├── 当前章节完整内容                                        │
│  ├── 前3章摘要                                              │
│  ├── 出场角色设定卡片                                        │
│  └── 当前大纲节点                                            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  调用大模型逐项审查                                           │
│  ├── 人设审查 Prompt                                         │
│  ├── 情节一致性审查 Prompt                                   │
│  ├── 节奏审查 Prompt                                         │
│  └── 语感审查 Prompt                                         │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  结果聚合与评分                                               │
│  ├── 各维度分别打分 0-100                                   │
│  ├── 加权总分                                              │
│  ├── 问题列表（按严重程度排序）                               │
│  └── 修改建议                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、AI 服务层设计

### 7.1 多模型适配

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Model Router (模型路由器)               │   │
│  │  功能：根据场景/价格/可用性选择最优模型               │   │
│  │  规则：                                               │   │
│  │  - 拆书分析 → Kimi（长上下文优势）                    │   │
│  │  - 正文写作 → DeepSeek（中文网文语感好）              │   │
│  │  - 大纲生成 → 通义千问（结构化输出稳定）              │   │
│  │  - 正文润色 → DeepSeek（质量高）                     │   │
│  │  - 审查分析 → Kimi（长文理解强）                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │DeepSeek   │  │ Kimi     │  │ 通义千问  │  │ Claude   │   │
│  │ 适配器    │  │ 适配器   │  │ 适配器   │  │ 适配器   │   │
│  │(兼容     │  │(Moonshot │  │(DashScope│  │(Anthropic│   │
│  │ OpenAI   │  │ API)     │  │ API)     │  │ API)     │   │
│  │ 协议)    │  │          │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Stream Manager (流式管理器)             │   │
│  │  功能：统一管理 SSE 流式输出                          │   │
│  │  - 所有模型返回统一格式的流式事件                      │   │
│  │  - 支持中断/重试                                      │   │
│  │  - Token 用量统计                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 八、项目目录结构

```
ai-novel-platform/
├── client/                          # 前端 (Next.js 16)
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── layout.tsx           # 根布局
│   │   │   ├── page.tsx             # 首页
│   │   │   ├── login/               # 登录页
│   │   │   ├── register/            # 注册页
│   │   │   ├── dashboard/           # 控制台
│   │   │   ├── books/               # 项目列表
│   │   │   ├── book/                # 单个项目
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx          # 项目概览
│   │   │   │   │   ├── outlines/         # 大纲管理
│   │   │   │   │   ├── characters/       # 角色管理
│   │   │   │   │   ├── chapters/         # 章节列表
│   │   │   │   │   ├── chapter/          # 章节写作
│   │   │   │   │   └── analysis/         # 拆书分析
│   │   │   └── analysis/            # 拆书工具
│   │   ├── components/              # 共享组件
│   │   │   ├── ui/                  # 基础 UI 组件
│   │   │   ├── layout/              # 布局组件
│   │   │   ├── editor/              # 编辑器组件
│   │   │   ├── outline-tree/        # 大纲树组件
│   │   │   ├── character-card/      # 角色卡片组件
│   │   │   ├── analysis-report/     # 拆书报告组件
│   │   │   └── ai-chat/             # AI 对话组件
│   │   ├── lib/                     # 工具函数
│   │   │   ├── api/                 # API 客户端
│   │   │   ├── stores/              # Zustand 状态管理
│   │   │   └── utils/               # 通用工具
│   │   └── types/                   # TypeScript 类型
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                          # 后端 (Python FastAPI)
│   ├── app/
│   │   ├── main.py                  # 应用入口
│   │   ├── config.py                # 配置
│   │   ├── database.py              # 数据库连接
│   │   ├── models/                  # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── book.py
│   │   │   ├── outline.py
│   │   │   ├── character.py
│   │   │   ├── chapter.py
│   │   │   ├── analysis.py
│   │   │   └── review.py
│   │   ├── schemas/                 # Pydantic 校验模型
│   │   │   ├── book.py
│   │   │   ├── outline.py
│   │   │   ├── character.py
│   │   │   ├── chapter.py
│   │   │   └── analysis.py
│   │   ├── api/                     # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── books.py
│   │   │   ├── outlines.py
│   │   │   ├── characters.py
│   │   │   ├── chapters.py
│   │   │   ├── analysis.py
│   │   │   └── review.py
│   │   ├── services/                # 业务逻辑
│   │   │   ├── ai/                  # AI 服务层
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py          # 基础适配器
│   │   │   │   ├── deepseek.py
│   │   │   │   ├── kimi.py
│   │   │   │   ├── tongyi.py
│   │   │   │   ├── router.py        # 模型路由
│   │   │   │   └── stream.py        # 流式管理
│   │   │   ├── context/             # 上下文引擎
│   │   │   │   ├── __init__.py
│   │   │   │   ├── assembler.py     # 上下文组装
│   │   │   │   ├── summarizer.py    # 章节摘要
│   │   │   │   └── rag.py           # RAG 检索
│   │   │   ├── analysis/            # 拆书引擎
│   │   │   │   ├── __init__.py
│   │   │   │   ├── preprocessor.py  # 文本预处理
│   │   │   │   ├── structure.py     # 结构分析
│   │   │   │   ├── character_extractor.py  # 角色提取
│   │   │   │   └── template_gen.py  # 模板生成
│   │   │   ├── review/              # 审查引擎
│   │   │   │   ├── __init__.py
│   │   │   │   ├── outline_review.py
│   │   │   │   └── chapter_review.py
│   │   │   └── generator/           # 生成引擎
│   │   │       ├── __init__.py
│   │   │       ├── chapter_gen.py   # 章节生成
│   │   │       ├── outline_gen.py   # 大纲生成
│   │   │       └── character_gen.py # 角色生成
│   │   └── middleware/              # 中间件
│   │       ├── auth.py
│   │       └── cors.py
│   ├── tests/                       # 测试
│   │   ├── test_api/
│   │   └── test_services/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic/                     # 数据库迁移
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 九、技术实现要点

### 9.1 SSE 流式输出

```python
# 服务器端 (FastAPI)
@router.post("/chapters/{id}/generate")
async def generate_chapter(id: UUID, request: GenerateRequest):
    async def event_generator():
        # 1. 组装上下文
        context = await context_assembler.assemble(id)
        yield f"event: context\ndata: {json.dumps(context)}\n\n"

        # 2. 调用 AI 模型流式生成
        async for chunk in ai_service.generate_stream(
            model=request.model,
            prompt=build_prompt(context),
            temperature=request.temperature
        ):
            yield f"event: token\ndata: {json.dumps({'text': chunk})}\n\n"

        # 3. 完成后保存并返回结果
        chapter = await save_chapter(id, full_text)
        yield f"event: complete\ndata: {json.dumps(chapter)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

```typescript
// 客户端 (Next.js)
async function* generateChapterStream(chapterId: string, params: GenerateParams) {
  const response = await fetch(`/api/v1/chapters/${chapterId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        yield JSON.parse(line.slice(6));
      }
    }
    buffer = lines[lines.length - 1] || '';
  }
}
```

### 9.2 大纲树形结构管理

```python
# 树形节点操作
class OutlineService:
    async def get_tree(self, book_id: UUID) -> list[OutlineNode]:
        """获取完整大纲树"""
        nodes = await Outline.find(
            Outline.book_id == book_id,
            sort=[Outline.sort_order]
        ).to_list()
        return self._build_tree(nodes)

    async def move_node(self, node_id: UUID, new_parent_id: UUID, new_order: int):
        """移动节点（拖拽排序）"""
        node = await Outline.get(node_id)
        node.parent_id = new_parent_id
        node.sort_order = new_order
        await node.save()
        # 重新排序同层节点
        await self._reorder_siblings(new_parent_id)

    def _build_tree(self, nodes: list[Outline]) -> list[OutlineNode]:
        """构建树形结构"""
        tree = []
        children_map = defaultdict(list)
        for node in nodes:
            if node.level == 'volume':
                tree.append(node)
            else:
                children_map[node.parent_id].append(node)
        return self._attach_children(tree, children_map)
```

### 9.3 角色注入优化

```python
class CharacterInjector:
    async def get_relevant_characters(
        self, book_id: UUID, chapter_outline: str
    ) -> list[Character]:
        """获取当前章节相关的角色"""
        # 1. 如果章节已标注出场角色，直接使用
        # 2. 否则根据大纲内容 AI 预测出场角色
        # 3. 只注入与当前剧情最相关的 3-5 个角色
        # 4. 每个角色卡片压缩到 200 字以内

        characters = await self._get_marked_characters(book_id, chapter_id)
        if not characters:
            characters = await self._predict_characters(book_id, chapter_outline)

        # 压缩角色信息
        return [self._compress_card(c) for c in characters[:5]]

    def _compress_card(self, character: Character) -> dict:
        """压缩角色卡片为精简版本"""
        return {
            "name": character.name,
            "personality": character.personality[:100],
            "motivation": character.motivation[:100],
            "relations": self._get_key_relations(character),
        }
```

---

## 十、环境变量与配置

```env
# 应用配置
APP_NAME=AI Novel Platform
APP_VERSION=1.0.0
DEBUG=true
SECRET_KEY=your-secret-key-here

# 数据库
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_novel
REDIS_URL=redis://localhost:6379/0

# AI 模型 API Keys
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com

KIMI_API_KEY=sk-your-kimi-key
KIMI_BASE_URL=https://api.moonshot.cn

TONGYI_API_KEY=sk-your-tongyi-key
TONGYI_BASE_URL=https://dashscope.aliyuncs.com

# JWT 配置
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# 向量检索
VECTOR_DIMENSION=1536
```

---

## 十一、部署方案

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ai_novel
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql+asyncpg://user:password@postgres:5432/ai_novel
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  frontend:
    build: ./client
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000/api/v1
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```