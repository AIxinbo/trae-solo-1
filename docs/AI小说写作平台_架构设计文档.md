# AI小说写作平台 - 架构设计文档

## 一、精简化技术栈

### 1.1 最终技术选型

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 前端框架 | Next.js 16 + Tailwind CSS | shadcn/ui 组件库 |
| 富文本编辑器 | TipTap (React) | 轻量、可扩展 |
| 树形组件 | react-arborist | 大纲拖拽 |
| 状态管理 | Zustand | 极简状态管理 |
| 后端框架 | Python FastAPI | 异步高性能 |
| ORM | SQLAlchemy 2.0 | Python 最成熟 ORM |
| **数据库** | **PostgreSQL 16 + pgvector** | **唯一外部依赖** |
| AI 调用 | **直接 HTTP 请求** (替代 LangChain) | 减少依赖，更可控 |
| 缓存 | **内存缓存** (替代 Redis) | 后端进程内完成 |
| 认证 | JWT | 无状态，无需额外服务 |
| 部署 | **Docker Compose** | **仅 3 个容器** |

### 1.2 精简前后对比

```
精简前（5个服务）                    精简后（3个服务）
┌──────────┐                       ┌──────────┐
│  Frontend │                       │  Frontend │
├──────────┤                       ├──────────┤
│  Backend  │                       │  Backend  │
├──────────┤                       ├──────────┤
│PostgreSQL│         ──────►       │PostgreSQL│
├──────────┤                       └──────────┘
│  Redis    │  (已移除)
├──────────┤
│ LangChain │  (已移除，改用直连API)
└──────────┘
```

**精简结果**：
- 外部服务从 4 个减到 **1 个**（仅 PostgreSQL）
- 额外中间件从 2 个减到 **0 个**（Redis 去掉，LangChain 去掉）
- Docker Compose 仅需管理 **3 个容器**
- 所有 AI API 调用通过 Backend 直连，无需额外代理

### 1.3 为什么可以去掉这些

| 移除项 | 替代方案 | 理由 |
|-------|---------|------|
| Redis | 后端内存缓存 + PostgreSQL | 写作平台对缓存时效性要求不高，用 Python dict 或 PostgreSQL 表即可 |
| LangChain | 直接 HTTP 调用 AI API | 项目只调用 2-3 个模型，LangChain 带来的抽象层反而增加了复杂度 |
| Alembic | SQLAlchemy `create_all()` | 初期开发不用复杂迁移工具，用 ORM 自动建表更快捷 |

---

## 二、系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   Frontend (:3000)│    │   Backend (:8000) │               │
│  │   Next.js 16      │◄──►│   FastAPI         │               │
│  │   + Tailwind CSS  │    │   + SQLAlchemy    │               │
│  └──────────────────┘    └───────┬──────────┘               │
│                                  │                           │
│  ┌──────────────────┐            │                           │
│  │ PostgreSQL 16    │◄───────────┘                           │
│  │ + pgvector       │                                        │
│  └──────────────────┘                                        │
│                                                             │
│  外部服务（不占用容器，通过 HTTP 调用）：                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ DeepSeek │  │   Kimi   │  │ 通义千问  │                   │
│  │   API    │  │   API    │  │   API    │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 启动集群只需一条命令

```bash
docker compose up -d
# 启动后：
# - 前端: http://localhost:3000
# - 后端: http://localhost:8000
# - API 文档: http://localhost:8000/docs
```

---

## 三、数据模型设计

### 3.1 核心表

#### books (项目表)

```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    style VARCHAR(50) DEFAULT 'default',
    synopsis TEXT,
    target_platform VARCHAR(50),
    world_setting TEXT,
    word_count_target INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    ai_config JSONB DEFAULT '{}',
    -- {"model": "deepseek", "temperature": 0.8}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### outlines (大纲表)

```sql
CREATE TABLE outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL CHECK (level IN ('volume', 'chapter', 'section')),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    plot_points JSONB DEFAULT '[]',
    -- [{"type": "conflict", "desc": "..."}]
    word_count_target INTEGER DEFAULT 0,
    emotion_curve VARCHAR(20),
    sort_order INTEGER NOT NULL DEFAULT 0,
    ai_summary TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outlines_book ON outlines(book_id);
CREATE INDEX idx_outlines_parent ON outlines(parent_id);
CREATE INDEX idx_outlines_sort ON outlines(book_id, sort_order);
```

#### characters (角色表 + 语音特征 合并)

```sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20),
    gender VARCHAR(10),
    role_type VARCHAR(20) NOT NULL CHECK (
        role_type IN ('protagonist', 'supporter', 'antagonist', 'extra')
    ),
    appearance TEXT,
    personality TEXT,
    background TEXT,
    motivation TEXT,
    growth_arc JSONB DEFAULT '[]',
    -- [{"stage": "前期", "personality": "...", "ability": "..."}]
    relationships JSONB DEFAULT '[]',
    -- [{"target_char_id": "uuid", "type": "师徒", "intimacy": 80}]
    -- ===== 语音特征（合并到角色表中，无需单独建表）=====
    speech_style VARCHAR(30) DEFAULT '普通',     -- 参考预设类型
    formality_level FLOAT DEFAULT 0.5,           -- 0-1 正式度
    avg_sentence_len INTEGER DEFAULT 8,          -- 平均句长
    favorite_words TEXT[] DEFAULT '{}',
    forbidden_words TEXT[] DEFAULT '{}',
    tone_words TEXT[] DEFAULT '{}',
    -- ============================================
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_characters_book ON characters(book_id);
```

#### chapters (章节表)

```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    ai_summary VARCHAR(500),
    word_count INTEGER DEFAULT 0,
    word_count_target INTEGER DEFAULT 0,
    characters UUID[] DEFAULT '{}',
    key_events JSONB DEFAULT '[]',
    pleasure_points JSONB DEFAULT '[]',
    -- [{"type": "打脸", "position": 200, "intensity": 8}]
    status VARCHAR(20) DEFAULT 'draft' CHECK (
        status IN ('draft', 'review', 'done')
    ),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_chapters_sort ON chapters(book_id, sort_order);
```

#### chapter_versions (版本历史)

```sql
CREATE TABLE chapter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_versions_chapter ON chapter_versions(chapter_id);
```

#### reviews (审查评分记录)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('outline', 'chapter')),
    target_id UUID NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    passed BOOLEAN NOT NULL,
    rewrite_required BOOLEAN DEFAULT FALSE,
    dimension_scores JSONB NOT NULL,
    -- {
    --   "剧情连贯性": {"score": 85, "issues": [...], "suggestions": "..."},
    --   "人设一致性": {"score": 78, "issues": [...], "suggestions": "..."},
    --   ...
    -- }
    priority_issues JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
```

#### timeline_events (时间线)

```sql
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    event_desc VARCHAR(500) NOT NULL,
    involved_chars UUID[] DEFAULT '{}',
    season VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_book_day ON timeline_events(book_id, day_number);
```

#### char_state_log (角色状态日志)

```sql
CREATE TABLE char_state_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    state_snapshot JSONB NOT NULL,
    -- {
    --   "age": 18, "cultivation": "筑基后期", "location": "青云宗",
    --   "items": ["铁剑"], "hp": 100, "mp": 80
    -- }
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_char_state_char ON char_state_log(character_id);
```

#### analysis_records (拆书记录)

```sql
CREATE TABLE analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    source_title VARCHAR(200) NOT NULL,
    source_author VARCHAR(100),
    structure_analysis JSONB,
    character_analysis JSONB,
    rhythm_analysis JSONB,
    techniques JSONB,
    templates JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 语音特征预设类型（系统常量，不建表）

```python
SPEECH_TEMPLATES = {
    "豪爽大侠": {"formality": 0.3, "avg_len": 6,
                 "tone_words": ["哈", "痛快", "兄弟"],
                 "favorite": ["老子", "干", "走"]},
    "文雅书生": {"formality": 0.8, "avg_len": 14,
                 "tone_words": ["矣", "乎", "哉"],
                 "favorite": ["确实", "不过", "依我之见"]},
    "冷面高手": {"formality": 0.5, "avg_len": 4,
                 "tone_words": [],
                 "favorite": ["嗯", "走吧", "不必"]},
    "活泼少女": {"formality": 0.2, "avg_len": 7,
                 "tone_words": ["哎呀", "啦", "耶", "嘛"],
                 "favorite": ["真的吗", "好好玩", "好耶"]},
    "阴险反派": {"formality": 0.6, "avg_len": 10,
                 "tone_words": ["呵呵", "有意思"],
                 "favorite": ["走着瞧", "有趣", "慢慢来"]},
    "市井小民": {"formality": 0.2, "avg_len": 6,
                 "tone_words": ["得嘞", "您嘞"],
                 "favorite": ["整啥", "可劲儿", "妥妥的"]},
    "普通":     {"formality": 0.5, "avg_len": 8,
                 "tone_words": ["啊", "呢", "吧"],
                 "favorite": [], "forbidden": []}
}
```

### 3.3 评分维度权重（系统常量）

```python
REVIEW_WEIGHTS = {
    "剧情连贯性": 0.25,
    "人设一致性": 0.20,
    "爽点密度":   0.15,
    "节奏控制":   0.15,
    "对话质量":   0.10,
    "去AI味语感": 0.10,
    "时间线一致性": 0.05
}
# 总分 ≥ 85 自动通过
# 总分 70-84 基本通过（附带建议）
# 总分 60-69 不通过（建议重写）
# 总分 < 60 强制重写
```

---

## 四、API 接口设计

### 4.1 API 路由总览

```
API 前缀: /api/v1

认证:
  POST /auth/register
  POST /auth/login
  POST /auth/refresh

项目管理:
  GET    /books
  POST   /books
  GET    /books/{id}
  PUT    /books/{id}
  DELETE /books/{id}

大纲管理:
  GET    /books/{id}/outlines          # 获取大纲树
  POST   /books/{id}/outlines          # 创建节点
  PUT    /outlines/{id}                # 更新节点
  DELETE /outlines/{id}                # 删除节点
  PUT    /outlines/reorder             # 排序
  POST   /outlines/ai-generate         # AI 生成大纲
  POST   /outlines/ai-extract          # AI 提取大纲
  POST   /outlines/ai-review           # AI 审查大纲

角色管理:
  GET    /books/{id}/characters        # 角色列表
  POST   /books/{id}/characters        # 创建角色
  PUT    /characters/{id}              # 更新角色
  DELETE /characters/{id}              # 删除角色
  POST   /characters/ai-generate       # AI 生成角色
  GET    /speech-templates             # 语音特征模板列表

章节管理:
  GET    /books/{id}/chapters          # 章节列表
  POST   /books/{id}/chapters          # 创建章节
  GET    /chapters/{id}                # 获取内容
  PUT    /chapters/{id}                # 更新内容
  DELETE /chapters/{id}                # 删除章节
  POST   /chapters/{id}/generate       # AI 生成正文 (SSE)
  POST   /chapters/{id}/expand         # AI 扩写
  POST   /chapters/{id}/compress       # AI 压缩
  POST   /chapters/{id}/de-ai          # AI 去AI味
  POST   /chapters/{id}/optimize-dialogue  # AI 对话优化

审查评分:
  POST   /review/chapter               # 审查章节评分
  POST   /review/outline               # 审查大纲
  POST   /review/check-consistency     # 一致性检查
  GET    /books/{id}/reviews           # 审查记录

时间线:
  GET    /books/{id}/timeline          # 时间线
  GET    /books/{id}/char-states       # 角色状态

版本管理:
  GET    /chapters/{id}/versions       # 版本列表
  POST   /chapters/{id}/versions       # 创建版本
  POST   /versions/{id}/restore        # 回滚

拆书分析:
  POST   /analysis/upload              # 上传拆书
  POST   /analysis/paste               # 粘贴拆书
  GET    /analysis/{id}                # 获取报告
  POST   /analysis/{id}/gen-template   # 生成模板
```

---

## 五、核心服务代码架构

### 5.1 后端目录结构

```
server/
├── app/
│   ├── main.py                  # FastAPI 入口，注册路由
│   ├── config.py                # 配置（读取环境变量）
│   ├── database.py              # PostgreSQL 连接 + pgvector
│   ├── models/                  # SQLAlchemy 模型
│   │   ├── user.py
│   │   ├── book.py
│   │   ├── outline.py
│   │   ├── character.py
│   │   ├── chapter.py
│   │   ├── review.py
│   │   └── timeline.py
│   ├── schemas/                 # Pydantic 校验
│   │   ├── book.py
│   │   ├── outline.py
│   │   ├── character.py
│   │   ├── chapter.py
│   │   └── review.py
│   ├── api/                     # 路由
│   │   ├── auth.py
│   │   ├── books.py
│   │   ├── outlines.py
│   │   ├── characters.py
│   │   ├── chapters.py
│   │   ├── review.py
│   │   ├── analysis.py
│   │   └── timeline.py
│   ├── services/
│   │   ├── ai/                  # AI 调用（直连 API，无 LangChain）
│   │   │   ├── client.py        # HTTP 客户端封装
│   │   │   ├── deepseek.py      # DeepSeek API 适配
│   │   │   ├── kimi.py          # Kimi API 适配
│   │   │   └── router.py        # 按场景选模型
│   │   ├── context/
│   │   │   └── assembler.py     # 上下文组装（三重注入）
│   │   ├── generator/
│   │   │   ├── chapter.py       # 章节生成
│   │   │   ├── outline.py       # 大纲生成
│   │   │   └── character.py     # 角色生成
│   │   ├── control/             # 生成控制
│   │   │   ├── word_count.py    # 字数控制
│   │   │   ├── de_ai.py         # 去AI味
│   │   │   └── dialogue.py      # 对话优化
│   │   ├── review/
│   │   │   ├── chapter_review.py    # 章节评分
│   │   │   └── outline_review.py    # 大纲审查
│   │   ├── analysis/
│   │   │   ├── preprocessor.py
│   │   │   └── structure.py
│   │   └── timeline/
│   │       ├── manager.py       # 时间线管理
│   │       └── state_tracker.py # 角色状态追踪
│   └── middleware/
│       └── auth.py
├── requirements.txt
├── Dockerfile
└── tests/
```

### 5.2 前端目录结构

```
client/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx             # 首页
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx   # 控制台
│   │   └── book/[id]/
│   │       ├── page.tsx         # 项目概览
│   │       ├── outlines/page.tsx
│   │       ├── characters/page.tsx
│   │       ├── chapters/page.tsx
│   │       ├── chapter/[chapterId]/page.tsx  # 写作页面
│   │       └── analysis/page.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   ├── editor/              # 章节编辑器
│   │   ├── outline-tree/        # 大纲树
│   │   ├── character-card/      # 角色卡片
│   │   ├── review-score/        # 审查评分组件（可视化雷达图）
│   │   └── timeline/            # 时间线
│   ├── lib/
│   │   ├── api/                 # API 客户端
│   │   ├── stores/              # Zustand
│   │   └── utils/
│   └── types/                   # TypeScript 类型
├── package.json
├── next.config.js
├── tailwind.config.js
├── dockerfile
└── tsconfig.json
```

---

## 六、核心功能实现

### 6.1 AI 调用 — 直连 API（替代 LangChain）

```python
# server/app/services/ai/client.py
import httpx
import json
from typing import AsyncGenerator

class AIClient:
    """AI 模型 HTTP 客户端 — 直连 API，无中间件"""

    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def chat(self, messages: list[dict], temperature: float = 0.7,
                   max_tokens: int = 4096) -> str:
        """非流式调用"""
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            return resp.json()["choices"][0]["message"]["content"]

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7,
                          max_tokens: int = 4096) -> AsyncGenerator[str, None]:
        """流式调用（SSE）"""
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST", f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data != "[DONE]":
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                yield delta["content"]

# DeepSeek 适配（兼容 OpenAI 协议）
class DeepSeekClient(AIClient):
    def __init__(self, api_key: str):
        super().__init__(api_key, "https://api.deepseek.com", "deepseek-chat")

# Kimi 适配
class KimiClient(AIClient):
    def __init__(self, api_key: str):
        super().__init__(api_key, "https://api.moonshot.cn", "moonshot-v1-8k")

# 模型路由
class ModelRouter:
    """按场景选择模型"""
    RULES = {
        "chapter_generate": "deepseek",     # 正文写作 → DeepSeek
        "chapter_review": "kimi",           # 审查评分 → Kimi（长文）
        "outline_generate": "deepseek",     # 大纲生成 → DeepSeek
        "analysis": "kimi",                 # 拆书分析 → Kimi（长文）
        "de_ai": "deepseek",               # 去AI味 → DeepSeek
        "dialogue_optimize": "deepseek",    # 对话优化 → DeepSeek
    }

    def __init__(self, config):
        self.clients = {
            "deepseek": DeepSeekClient(config.DEEPSEEK_API_KEY),
            "kimi": KimiClient(config.KIMI_API_KEY),
        }

    def get_client(self, scene: str) -> AIClient:
        model = self.RULES.get(scene, "deepseek")
        return self.clients[model]
```

### 6.2 字数控制

```python
# server/app/services/control/word_count.py

class WordBudgetAllocator:
    """字数预算分配"""

    def allocate(self, scenes: list[str], total_target: int) -> list[dict]:
        importance_map = {
            "战斗": 1.5, "冲突": 1.5, "对决": 1.5,
            "对话": 1.0, "谈判": 1.0, "商议": 1.0,
            "描写": 0.6, "过渡": 0.5, "回忆": 0.5
        }
        weights = []
        for scene in scenes:
            w = 1.0
            for kw, weight in importance_map.items():
                if kw in scene:
                    w = weight
                    break
            weights.append(w)

        total_w = sum(weights)
        budgets = []
        remaining = total_target
        for i, scene in enumerate(scenes):
            if i == len(scenes) - 1:
                budgets.append({"scene": scene, "target": remaining})
            else:
                target = int(total_target * weights[i] / total_w)
                remaining -= target
                budgets.append({"scene": scene, "target": target})
        return budgets


class WordCountController:
    """流式字数控制"""

    def __init__(self, target: int, tolerance: float = 0.1):
        self.target = target
        self.min_words = int(target * (1 - tolerance))
        self.max_words = int(target * (1 + tolerance))
        self.current = 0

    def update(self, text_chunk: str) -> dict:
        self.current += len(text_chunk)

        if self.current >= self.max_words:
            return {"action": "stop", "reason": "超出上限"}

        if self.current >= self.target * 0.9:
            return {"action": "inject",
                    "prompt": "本章即将结束，请自然收尾，不要开启新线索。"}

        return {"action": "continue"}
```

### 6.3 去AI味

```python
# server/app/services/control/de_ai.py

AI_FLAVOR_WORDS = [
    "然而", "但是", "不过", "值得一提的是",
    "显而易见", "毫无疑问", "事实上", "换句话说",
    "简而言之", "不可否认", "值得注意的是"
]

PSYCH_PATTERNS = [
    "他感到", "她感到", "他心里想", "她心里想",
    "他意识到", "她意识到"
]


def score_flavor(text: str) -> dict:
    """语感评分 0-100"""
    score = 100

    # AI词检测（每500字超过2个扣分）
    word_count = 0
    for word in AI_FLAVOR_WORDS:
        n = text.count(word)
        if n > 0:
            word_count += n
    expected_max = max(len(text) / 500 * 2, 1)
    if word_count > expected_max:
        score -= int((word_count - expected_max) * 10)

    # 心理描写检测
    psych_count = sum(text.count(p) for p in PSYCH_PATTERNS)
    if psych_count > 5:
        score -= min(psych_count * 5, 25)

    # 短句比例检测
    sentences = [s.strip() for s in text.replace("！", "。")
                 .replace("？", "。").replace("\n", "").split("。") if s.strip()]
    if sentences:
        short_ratio = sum(1 for s in sentences if len(s) <= 10) / len(sentences)
        if short_ratio < 0.25:
            score -= 15
        elif short_ratio > 0.6:
            score -= 5

    # 对话占比检测
    in_dialogue = False
    dialogue_chars = 0
    for ch in text:
        if ch in "「『""':
            in_dialogue = True
        elif ch in "」』""":
            in_dialogue = False
        elif in_dialogue:
            dialogue_chars += 1
    dialogue_ratio = dialogue_chars / max(len(text), 1)
    if dialogue_ratio < 0.35:
        score -= 15
    elif dialogue_ratio > 0.7:
        score -= 5

    return {
        "score": max(score, 0),
        "ai_word_count": word_count,
        "psych_count": psych_count,
        "dialog_ratio": round(dialogue_ratio, 2)
    }
```

### 6.4 审查评分

```python
# server/app/services/review/chapter_review.py

WEIGHTS = {
    "剧情连贯性": 0.25,
    "人设一致性": 0.20,
    "爽点密度": 0.15,
    "节奏控制": 0.15,
    "对话质量": 0.10,
    "去AI味语感": 0.10,
    "时间线一致性": 0.05
}

REVIEW_THRESHOLDS = {
    "auto_pass": 85,
    "pass_with_suggestions": 70,
    "suggest_rewrite": 60,
    "force_rewrite": 0
}


async def review_chapter(chapter_id: str, db) -> dict:
    """执行7维度审查评分"""
    chapter = await db.get_chapter(chapter_id)
    book = await db.get_book(chapter.book_id)

    # 组装审查上下文
    context = {
        "chapter": chapter.content,
        "chapter_title": chapter.title,
        "outline": await db.get_outline(chapter.outline_id),
        "previous_summaries": await db.get_chapter_summaries(
            book.id, chapter.sort_order - 1, limit=3
        ),
        "characters": await db.get_characters_by_ids(chapter.characters),
        "timeline_events": await db.get_timeline(book.id, limit=10)
    }

    # 调用 AI 逐项评分
    prompt = _build_review_prompt(context)
    result = await ai_client.chat([{"role": "user", "content": prompt}])
    scores = parse_review_result(result)

    # 计算总分
    overall = sum(scores[d]["score"] * WEIGHTS[d] for d in WEIGHTS)

    # 判定
    if overall >= 85:
        passed, rewrite = True, False
    elif overall >= 70:
        passed, rewrite = True, False
    elif overall >= 60:
        passed, rewrite = False, True
    else:
        passed, rewrite = False, True

    # 提取优先级问题
    priority = []
    for dim, data in scores.items():
        for issue in data.get("issues", []):
            if issue.get("severity") in ("high", "medium"):
                priority.append({
                    "dimension": dim,
                    "content": issue["content"],
                    "severity": issue["severity"]
                })

    # 保存审查记录
    review_id = await db.save_review({
        "book_id": book.id,
        "target_type": "chapter",
        "target_id": chapter_id,
        "overall_score": int(overall),
        "passed": passed,
        "rewrite_required": rewrite,
        "dimension_scores": scores,
        "priority_issues": priority
    })

    return {
        "review_id": review_id,
        "overall_score": int(overall),
        "passed": passed,
        "rewrite_required": rewrite,
        "dimensions": scores,
        "priority_issues": priority
    }
```

---

## 七、Docker 部署

### 7.1 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: ai-novel-db
    environment:
      POSTGRES_DB: ai_novel
      POSTGRES_USER: ai_novel
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ai_novel"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./server
    container_name: ai-novel-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://ai_novel:${DB_PASSWORD:-changeme}@postgres:5432/ai_novel
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      KIMI_API_KEY: ${KIMI_API_KEY}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8000:8000"
    restart: unless-stopped

  frontend:
    build: ./client
    container_name: ai-novel-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    depends_on:
      - backend
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 7.2 启动命令

```bash
# 1. 克隆项目
git clone <repo> && cd ai-novel-platform

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 DEEPSEEK_API_KEY、KIMI_API_KEY

# 3. 一键启动（3个容器）
docker compose up -d

# 4. 查看运行状态
docker compose ps

# 5. 访问
# 前端: http://localhost:3000
# 后端: http://localhost:8000
# API 文档: http://localhost:8000/docs

# 6. 停止
docker compose down

# 7. 查看日志
docker compose logs -f
```

### 7.3 Dockerfile 文件

```dockerfile
# server/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# FastAPI 自动建表 + 启动
CMD ["sh", "-c", "python -c 'from app.database import init_db; import asyncio; asyncio.run(init_db())' && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

```dockerfile
# client/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
RUN npm ci --only=production
CMD ["npm", "run", "start"]
```

---

## 八、项目依赖清单

### 8.1 后端依赖 (requirements.txt)

```
fastapi==0.115.*
uvicorn[standard]==0.30.*
sqlalchemy[asyncio]==2.0.*
asyncpg==0.29.*
httpx==0.27.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
python-dotenv==1.0.*
pydantic==2.*
```

**仅 8 个依赖**，相比 LangChain 方案减少约 50+ 个间接依赖。

### 8.2 前端依赖 (package.json)

```json
{
  "dependencies": {
    "next": "^16",
    "react": "^19",
    "react-dom": "^19",
    "@tiptap/react": "^2",
    "@tiptap/starter-kit": "^2",
    "@tiptap/extension-placeholder": "^2",
    "react-arborist": "^3",
    "zustand": "^5",
    "lucide-react": "^0",
    "tailwindcss": "^4",
    "class-variance-authority": "^0"
  }
}
```

### 8.3 网络依赖（作者需自行申请 API Key）

| API | 用途 | 是否需要 |
|-----|------|---------|
| DeepSeek API Key | 正文写作/大纲生成/对话优化/去AI味 | **必需** |
| Kimi API Key | 章节审查/拆书分析（长文） | 可选，缺省用 DeepSeek |

---

## 九、开发计划

### 第1步：项目骨架
- `docker-compose.yml` + 后端 Dockerfile + 前端 Dockerfile
- `server/app/main.py` + `server/app/database.py` + `server/app/models/*.py`
- `client/` Next.js 项目初始化

### 第2步：后端核心
- AI 客户端 (`services/ai/client.py`)
- 用户认证 (`api/auth.py`)
- 项目管理 CRUD (`api/books.py`)
- 大纲管理 CRUD (`api/outlines.py`)
- 角色管理 CRUD (`api/characters.py`)

### 第3步：前端基础
- 布局 + 认证页面
- 控制台 / 项目管理
- 大纲树组件
- 角色卡片组件
- 章节编辑器

### 第4步：AI 生成功能
- 章节正文生成 (SSE 流式)
- 字数控制
- 上下文注入
- 大纲 AI 生成
- 角色 AI 生成

### 第5步：质量优化
- 去AI味 + 语感评分
- 对话优化
- 审查评分系统
- 时间线 / 角色状态

### 第6步：拆书分析
- 上传/粘贴作品
- 结构/角色/节奏分析
- 模板生成