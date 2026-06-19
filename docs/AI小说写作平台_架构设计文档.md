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
│                        API 客户端层 (fetch/axios)                    │
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
│  │  │大纲审查  │  │正文审查  │  │逻辑审查  │  │ 人设审查  │   │   │
│  │  │ OutlineRv│ ChapterRv │ LogicCheck│ CharCheck │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           生成控制引擎 (Generation Control Engine)            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │字数控制  │  │去AI味    │  │对话优化  │  │时间线    │   │   │
│  │  │WordCtrl  │  │AIFlavor  │  │Dialogue  │  │Timeline  │   │   │
│  │  │          │  │Remover   │  │Optimizer │  │Checker   │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                       数据库 (PostgreSQL + pgvector)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  books   │  │ outlines │  │characters│  │    chapters       │  │
│  │ 项目表   │  │ 大纲表   │  │ 角色表   │  │   章节表          │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │analysis  │  │ reviews  │  │versions  │  │   embeddings      │  │
│  │拆书记录  │  │审查记录  │  │版本表    │  │  向量索引         │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│  │timeline  │  │char_state│  │style_ref │                         │
│  │时间线    │  │角色状态  │  │风格档案  │                         │
│  └──────────┘  └──────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

| 层级 | 技术选型 | 版本 | 选型理由 |
|-----|---------|------|---------|
| 前端框架 | Next.js | 16 | React 全栈框架，SSR/SSG 支持好 |
| UI 组件 | Tailwind CSS + shadcn/ui | latest | 快速构建美观 UI |
| 富文本编辑器 | TipTap / Novel Editor | latest | 基于 ProseMirror，适合长文编辑 |
| 树形组件 | react-arborist / dnd-kit | latest | 拖拽排序树形大纲 |
| 状态管理 | Zustand | latest | 轻量级状态管理 |
| 后端框架 | Python FastAPI | latest | 异步高性能，AI 生态丰富 |
| ORM | SQLAlchemy 2.0 + Alembic | latest | 最成熟的 Python ORM |
| 数据库 | PostgreSQL | 16 | 支持向量检索 |
| 向量检索 | pgvector | latest | PostgreSQL 原生插件 |
| AI SDK | LangChain / LiteLLM | latest | 统一多模型调用 |
| 缓存 | Redis | 7 | 缓存 AI 响应 |
| 认证 | JWT + OAuth2 | - | 无状态认证 |
| 部署 | Docker + Docker Compose | - | 一键部署 |

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
│ genre          │       │ level             │       │ role_type        │
│ style          │       │ title             │       │ personality      │
│ synopsis       │       │ content           │       │ background       │
│ target_platform│       │ plot_points (JSON)│       │ motivation       │
│ created_at     │       │ word_count_target │       │ growth_arc (JSON)│
│ updated_at     │       │ sort_order        │       │ relationships    │
└────────────────┘       │ created_at        │       │ speech_profile   │
       │                  │ updated_at        │       │ (JSON) - 语音特征 │
       │                  └──────────────────┘       │ created_at       │
       │                                             └──────────────────┘
       │                  ┌──────────────────┐
       │                  │   chapters        │
       │                  │──────────────────│
       │──1:N─────────────│ id (PK)           │
       │                  │ book_id (FK)      │
       │                  │ outline_id (FK)   │
       │                  │ title             │
       │                  │ content (TEXT)    │
       │                  │ ai_summary        │
       │                  │ word_count        │
       │                  │ word_count_target │
       │                  │ characters (JSON) │
       │                  │ key_events (JSON) │
       │                  │ emotion_curve (INT[])│
       │                  │ status            │
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
       │                  │ created_at       │
       │                  └──────────────────┘
       │
       │    ┌──────────────────┐   ┌──────────────────┐
       │    │  timeline_events │   │  char_state_log  │
       │    │──────────────────│   │──────────────────│
       │    │ id (PK)          │   │ id (PK)          │
       │───N│ book_id (FK)     │   │ character_id (FK)│
       │    │ chapter_id (FK)  │   │ chapter_id (FK)  │
       │    │ day_number       │   │ state_snapshot   │
       │    │ event_desc       │   │ (JSON)           │
       │    │ involved_chars   │   │ created_at       │
       │    │ location         │   └──────────────────┘
       │    │ created_at       │
       │    └──────────────────┘
```

### 2.2 新增表详细设计

#### timeline_events (时间线事件表)

```sql
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,           -- 故事中的第几天
    event_desc VARCHAR(500) NOT NULL,       -- 事件描述
    involved_chars UUID[] DEFAULT '{}',     -- 涉及角色ID列表
    location VARCHAR(200),                  -- 发生地点
    importance INTEGER DEFAULT 5,           -- 重要性 1-10
    season VARCHAR(10),                     -- 季节标记
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_book_day ON timeline_events(book_id, day_number);
CREATE INDEX idx_timeline_chapter ON timeline_events(chapter_id);
```

#### char_state_log (角色状态变更日志)

```sql
CREATE TABLE char_state_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    state_snapshot JSONB NOT NULL,          -- 角色状态快照
    -- {
    --   "age": 18,
    --   "cultivation": "筑基后期",
    --   "location": "青云宗",
    --   "items": ["铁剑", "古玉"],
    --   "hp": 100,
    --   "mp": 80,
    --   "relationships": {"lisi": "敌对"}
    -- }
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_char_state_char ON char_state_log(character_id);
CREATE INDEX idx_char_state_chapter ON char_state_log(chapter_id);
```

#### style_profiles (角色语音特征库)

```sql
CREATE TABLE speech_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    style_name VARCHAR(50) NOT NULL,        -- "直爽型"/"文雅型"/"冷面型"
    formality_level FLOAT DEFAULT 0.5,      -- 0.0-1.0 正式度
    avg_sentence_length INTEGER DEFAULT 8,  -- 平均句子长度（字）
    tone_words TEXT[] DEFAULT '{}',          -- 常用语气词
    favorite_words TEXT[] DEFAULT '{}',      -- 爱用词
    forbidden_words TEXT[] DEFAULT '{}',     -- 禁用词
    speech_pattern TEXT,                     -- 说话模式描述
    created_at TIMESTAMP DEFAULT NOW()
);

-- 预设角色类型模板表
CREATE TABLE speech_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) NOT NULL,         -- "豪爽大侠"/"文雅书生"/"市井小民"/...
    formality_level FLOAT DEFAULT 0.5,
    avg_sentence_length INTEGER DEFAULT 8,
    tone_words TEXT[] DEFAULT '{}',
    favorite_words TEXT[] DEFAULT '{}',
    description TEXT,
    example_dialogue TEXT
);
```

#### reviews (审查记录表)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,       -- 'outline' / 'chapter'
    target_id UUID NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    passed BOOLEAN NOT NULL,
    dimension_scores JSONB NOT NULL,
    -- {
    --   "剧情连贯性": {"score": 85, "issues": [...], "suggestions": "..."},
    --   "人设一致性": {"score": 78, "issues": [...], "suggestions": "..."},
    --   ...
    -- }
    priority_issues JSONB DEFAULT '[]',
    rewrite_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
```

---

## 三、API 接口设计

### 3.1 API 路由总览

```
API 前缀: /api/v1

认证相关:
  POST   /auth/register              # 注册
  POST   /auth/login                 # 登录
  POST   /auth/refresh               # 刷新 Token

项目管理:
  GET    /books                      # 获取项目列表
  POST   /books                      # 创建项目
  GET    /books/{id}                 # 获取项目详情
  PUT    /books/{id}                 # 更新项目
  DELETE /books/{id}                 # 删除项目

大纲管理:
  GET    /books/{id}/outlines        # 获取大纲树
  POST   /books/{id}/outlines        # 创建大纲节点
  PUT    /outlines/{id}              # 更新大纲节点
  DELETE /outlines/{id}              # 删除大纲节点
  PUT    /outlines/reorder           # 大纲节点排序
  POST   /outlines/ai-generate       # AI 生成大纲
  POST   /outlines/ai-extract        # AI 提取大纲（从已有作品）
  POST   /outlines/ai-review         # AI 审查大纲

角色管理:
  GET    /books/{id}/characters      # 获取角色列表
  POST   /books/{id}/characters      # 创建角色
  PUT    /characters/{id}            # 更新角色
  DELETE /characters/{id}            # 删除角色
  POST   /characters/ai-generate     # AI 生成角色
  PUT    /characters/{id}/speech-profile  # 更新角色语音特征
  GET    /speech-templates           # 获取预设角色类型模板

章节管理:
  GET    /books/{id}/chapters        # 获取章节列表
  POST   /books/{id}/chapters        # 创建章节
  GET    /chapters/{id}              # 获取章节内容
  PUT    /chapters/{id}              # 更新章节内容
  DELETE /chapters/{id}              # 删除章节
  POST   /chapters/{id}/generate     # AI 生成正文（SSE 流式，含字数控制）
  POST   /chapters/{id}/expand       # AI 扩写
  POST   /chapters/{id}/compress     # AI 压缩
  POST   /chapters/{id}/de-ai        # AI 去AI味处理
  POST   /chapters/{id}/optimize-dialogue  # AI 对话优化

审查评分:
  POST   /review/outline             # 审查大纲
  POST   /review/chapter             # 审查正文（含7维度评分）
  POST   /review/check-consistency   # 一致性检查（时间线+人设）
  GET    /books/{id}/reviews         # 获取审查记录

时间线管理:
  GET    /books/{id}/timeline        # 获取全局时间线
  POST   /books/{id}/timeline/check  # 检查时间线一致性
  GET    /books/{id}/char-state      # 获取角色状态

版本管理:
  GET    /chapters/{id}/versions     # 获取版本列表
  GET    /versions/{id}              # 获取版本内容
  POST   /chapters/{id}/versions     # 创建新版本
  POST   /versions/{id}/restore      # 回滚到指定版本

拆书分析:
  POST   /analysis/upload            # 上传作品进行拆书
  POST   /analysis/paste             # 粘贴内容拆书
  GET    /analysis/{id}              # 获取拆书报告
  POST   /analysis/{id}/generate-template  # 基于拆书生成大纲模板

提示词模板:
  GET    /prompts                    # 获取模板列表
  POST   /prompts                    # 创建模板
  GET    /prompts/{id}               # 获取模板详情
```

### 3.2 关键 API 详细设计

#### POST /api/v1/chapters/{id}/generate — AI 生成章节正文 (SSE，带字数控制)

```
请求:
{
    "model": "deepseek",
    "word_count_target": 3000,        // 目标字数
    "word_count_tolerance": 0.1,      // 允许误差 ±10%
    "temperature": 0.8,
    "style_hints": ["节奏紧凑", "对话生动"],
    "enable_de_ai": true,             // 是否启用去AI味
    "enable_dialogue_optimize": true  // 是否启用对话优化
}

SSE 事件流:
event: context
data: {"summary": "...", "characters": [...], "outline": "...", "word_budget": {...}}

event: progress
data: {"scene": "冲突爆发", "words_generated": 800, "target": 800, "percent": 100}

event: progress
data: {"scene": "势力介入", "words_generated": 650, "target": 700, "percent": 93}

event: progress
data: {"scene": "主角应对", "words_generated": 950, "target": 1000, "percent": 95}

event: progress
data: {"scene": "结尾悬念", "words_generated": 480, "target": 500, "percent": 96}

event: complete
data: {
    "chapter_id": "uuid",
    "word_count": 2880,
    "target": 3000,
    "deviation": "-4%",
    "summary": "..."
}
```

#### POST /api/v1/chapters/{id}/de-ai — 去AI味处理

```
请求:
{
    "aggressiveness": "medium",     // low / medium / high
    "focus_areas": ["tone", "sentence_structure", "dialogue"]
}

响应:
{
    "original_text": "...",
    "processed_text": "...",
    "changes": [
        {"from": "然而", "to": "可", "position": 156},
        {"from": "他感到非常愤怒", "to": "他一拳砸在桌上，茶杯跳了起来", "position": 890},
        {"from": "值得一提的是", "to": "(已删除)", "position": 2340}
    ],
    "flavor_score_before": 62,
    "flavor_score_after": 88,
    "removed_ai_words": 7,
    "dialogue_percentage_before": "32%",
    "dialogue_percentage_after": "43%",
    "short_sentence_ratio_before": "22%",
    "short_sentence_ratio_after": "35%"
}
```

#### POST /api/v1/review/chapter — 章节审查评分

```
请求:
{
    "chapter_id": "uuid",
    "review_dimensions": [
        "剧情连贯性",
        "人设一致性",
        "爽点密度",
        "节奏控制",
        "对话质量",
        "去AI味语感",
        "时间线一致性"
    ]
}

响应:
{
    "chapter_id": "uuid",
    "review_id": "uuid",
    "overall_score": 82,
    "passed": true,
    "rewrite_required": false,
    "dimensions": {
        "剧情连贯性": {
            "score": 85,
            "issues": [
                {"severity": "low", "content": "第3段提到'上次的事'没有前文铺垫"}
            ],
            "suggestions": "建议在第1段增加一句交代"
        },
        "人设一致性": {
            "score": 78,
            "issues": [
                {"severity": "medium", "content": "反派李四说话用词过于文雅"}
            ],
            "suggestions": "改得更粗犷一些"
        },
        "爽点密度": {
            "score": 70,
            "issues": [
                {"severity": "medium", "content": "3000字仅1个爽点"}
            ],
            "suggestions": "中间增加小型冲突"
        },
        "节奏控制": {"score": 88, "issues": [], "suggestions": "节奏良好"},
        "对话质量": {"score": 82, "issues": [], "suggestions": "基本自然"},
        "去AI味语感": {
            "score": 80,
            "issues": [
                {"severity": "low", "content": "出现2次'然而'、3次'值得一提的是'"}
            ],
            "suggestions": "替换为口语化表达"
        },
        "时间线一致性": {"score": 92, "issues": [], "suggestions": "时间线正确"}
    },
    "priority_issues": [
        "反派李四的对话不符合人设（中）",
        "本章仅1个爽点（中）"
    ]
}
```

#### POST /api/v1/books/{id}/timeline/check — 时间线一致性检查

```
请求:
{
    "chapter_outline": "主角在青云宗后山发现一个秘密洞穴...",
    "outline_characters": ["张三", "李四"]
}

响应:
{
    "passed": true,
    "warnings": [],
    "timeline_context": {
        "current_day": 15,
        "season": "初夏",
        "last_event": "宗门大比结束（第14天）",
        "character_states": {
            "张三": {"cultivation": "筑基后期", "location": "青云宗"},
            "李四": {"cultivation": "筑基中期", "location": "青云宗"}
        }
    }
}
```

#### POST /api/v1/chapters/{id}/optimize-dialogue — 对话优化

```
请求:
{
    "characters": ["张三", "李四"],
    "optimization_level": "medium"
}

响应:
{
    "original_dialogue": "...",
    "optimized_dialogue": "...",
    "changes": [...],
    "before_score": 65,
    "after_score": 88,
    "character_distinction": {
        "before": 0.3,
        "after": 0.8
    }
}
```

---

## 三、生成控制引擎详细设计

### 3.1 字数控制子系统

#### 字数预算分配器

```python
class WordBudgetAllocator:
    """将章节目标字数按场景分配"""

    def allocate(self, chapter_outline: str, total_target: int) -> list[SceneBudget]:
        """根据大纲内容智能分配字数预算"""
        scenes = self._extract_scenes(chapter_outline)
        total_weight = sum(self._estimate_importance(s) for s in scenes)

        budgets = []
        remaining = total_target
        for i, scene in enumerate(scenes):
            if i == len(scenes) - 1:
                # 最后一个场景取剩余
                budgets.append(SceneBudget(scene=scene, target=remaining))
            else:
                weight = self._estimate_importance(scene)
                target = int(total_target * weight / total_weight)
                budgets.append(SceneBudget(scene=scene, target=target))
                remaining -= target

        return budgets

    def _estimate_importance(self, scene: str) -> float:
        """评估场景重要性"""
        keywords_weight = {
            "战斗": 1.5, "冲突": 1.5, "对决": 1.5,
            "对话": 1.0, "谈判": 1.0, "商议": 1.0,
            "描写": 0.6, "过渡": 0.5, "回忆": 0.5
        }
        for kw, weight in keywords_weight.items():
            if kw in scene:
                return weight
        return 1.0
```

#### 实时字数控制器

```python
class WordCountController:
    """流式生成过程中的实时字数控制"""

    def __init__(self, target: int, tolerance: float = 0.1):
        self.target = target
        self.min_words = int(target * (1 - tolerance))
        self.max_words = int(target * (1 + tolerance))
        self.current_words = 0
        self.phase = "normal"  # normal / winding_down / capped

    def update(self, new_text: str) -> dict:
        """更新字数统计并返回控制指令"""
        self.current_words += len(new_text)

        if self.current_words >= self.max_words:
            self.phase = "capped"
            return {"action": "stop", "reason": "超出上限"}

        if self.current_words >= self.target * 0.9:
            self.phase = "winding_down"
            return {
                "action": "inject_prompt",
                "prompt": "本章即将结束，请自然收尾。不要开启新的情节线索。"
            }

        return {"action": "continue"}
```

#### 扩写/压缩 Pass

```python
class TextExpander:
    """字数不足时扩写"""

    async def expand(self, text: str, target_words: int) -> str:
        current = len(text)
        if current >= target_words:
            return text

        prompt = f"""
        请将以下段落从{current}字扩展到{target_words}字（增加约{target_words - current}字）。
        扩展方向：
        1. 增加角色之间的对话互动
        2. 补充环境细节和氛围描写
        3. 丰富角色的动作和表情描写
        4. 保持原有风格和节奏，不要引入新的情节。
        """
        return await ai_service.generate(prompt, text)


class TextCompressor:
    """字数超出时压缩"""

    async def compress(self, text: str, target_words: int) -> str:
        current = len(text)
        if current <= target_words:
            return text

        prompt = f"""
        请将以下段落从{current}字压缩到{target_words}字（删减约{current - target_words}字）。
        压缩方向：
        1. 精简修饰性形容词和副词
        2. 合并重复或相似的描述
        3. 缩短环境描写，保留核心情节
        4. 保持故事逻辑完整，不删除关键对话和情节推进。
        """
        return await ai_service.generate(prompt, text)
```

---

### 3.2 去AI味子系统

```python
class AIFlavorRemover:
    """六层去AI味机制"""

    AI_FLAVOR_WORDS = [
        "然而", "但是", "不过", "值得一提的是",
        "显而易见", "毫无疑问", "事实上", "换句话说",
        "简而言之", "总的来说", "换言之", "不可否认",
        "从某种程度上说", "在某种意义上", "值得注意的是"
    ]

    PSYCHOLOGICAL_PATTERNS = [
        "他感到", "她感到", "他心里想", "她心里想",
        "他意识到", "她意识到", "他觉得自己", "她觉得自己"
    ]

    async def remove(self, text: str, aggressiveness: str = "medium") -> DeAIResult:
        """执行去AI味处理"""
        # 第一遍：规则检测
        stats = self._analyze_flavor(text)

        # 第二遍：AI改写
        processed = await self._ai_rewrite(text, aggressiveness, stats)

        # 第三遍：验证评分
        final_score = self._score(processed)

        return DeAIResult(
            original_text=text,
            processed_text=processed,
            changes=self._diff(text, processed),
            flavor_score_before=stats.score,
            flavor_score_after=final_score,
            removed_ai_words=stats.ai_word_count
        )

    def _analyze_flavor(self, text: str) -> FlavorStats:
        """分析AI味程度"""
        stats = FlavorStats()

        # 统计AI高频词
        for word in self.AI_FLAVOR_WORDS:
            count = text.count(word)
            if count > 0:
                stats.ai_words[word] = count
                stats.ai_word_count += count

        # 统计心理描写标签
        for pattern in self.PSYCHOLOGICAL_PATTERNS:
            count = text.count(pattern)
            if count > 0:
                stats.psych_patterns[pattern] = count

        # 分析句子长度分布
        sentences = self._split_sentences(text)
        short_sentences = [s for s in sentences if len(s) <= 10]
        stats.short_sentence_ratio = len(short_sentences) / max(len(sentences), 1)

        # 分析对话占比
        dialogue_chars = self._count_dialogue_chars(text)
        stats.dialogue_ratio = dialogue_chars / max(len(text), 1)

        return stats

    def _score(self, text: str) -> int:
        """语感评分"""
        stats = self._analyze_flavor(text)
        score = 100

        # AI词扣分（每500字超过2个扣分）
        expected_max = max(len(text) / 500 * 2, 1)
        if stats.ai_word_count > expected_max:
            score -= int((stats.ai_word_count - expected_max) * 10)

        # 短句比例扣分
        if stats.short_sentence_ratio < 0.3:
            score -= 10
        elif stats.short_sentence_ratio > 0.6:
            score -= 5

        # 对话占比扣分
        if stats.dialogue_ratio < 0.35:
            score -= 15
        elif stats.dialogue_ratio > 0.7:
            score -= 5

        # 心理描写扣分
        if stats.psych_pattern_count > 5:
            score -= min(stats.psych_pattern_count * 5, 20)

        return max(score, 0)

    async def _ai_rewrite(self, text: str, level: str, stats: FlavorStats) -> str:
        """AI改写去AI味"""
        prompt = f"""
        请改写以下文本，去除AI写作痕迹，让语言更自然、更像人类网文作者写的。

        当前文本存在的具体问题：
        - AI高频词（{', '.join(stats.ai_words.keys())}）出现了{stats.ai_word_count}次
        - 心理描写标签（{', '.join(stats.psych_patterns.keys())}）出现了{stats.psych_pattern_count}次
        - 短句占比仅{stats.short_sentence_ratio:.0%}，需要更多短句
        - 对话占比仅{stats.dialogue_ratio:.0%}，需要增加对话

        改写要求：
        1. 删除或替换{"所有" if level == "high" else "大部分"}AI高频词
        2. 用动作和对话代替直接的心理描写
        {"3. 大幅增加短句，让节奏更明快" if level == "high" else "3. 适当增加短句"}
        4. 增加对话互动，让对话占比提升到40%以上
        5. 保持原意和情节不变
        """
        return await ai_service.generate(prompt, text)
```

---

### 3.3 对话优化子系统

```python
class DialogueOptimizer:
    """四维对话优化系统"""

    # 预设角色类型模板
    SPEECH_TEMPLATES = {
        "豪爽大侠": {
            "formality": 0.3,
            "avg_len": 6,
            "tone_words": ["哈", "痛快", "兄弟"],
            "favorite": ["老子", "干", "走"],
            "forbidden": []
        },
        "文雅书生": {
            "formality": 0.8,
            "avg_len": 14,
            "tone_words": ["矣", "乎", "哉"],
            "favorite": ["确实", "不过", "依我之见"],
            "forbidden": ["卧槽", "特么"]
        },
        "冷面高手": {
            "formality": 0.5,
            "avg_len": 4,
            "tone_words": [],
            "favorite": ["嗯", "走吧", "不必"],
            "forbidden": []
        },
        "活泼少女": {
            "formality": 0.2,
            "avg_len": 7,
            "tone_words": ["哎呀", "啦", "耶", "嘛"],
            "favorite": ["真的吗", "好好玩", "好耶"],
            "forbidden": []
        }
    }

    async def optimize(
        self,
        chapter_text: str,
        character_speech_profiles: dict[str, SpeechProfile]
    ) -> DialogueOptimizeResult:
        """优化章节中的对话"""
        dialogues = self._extract_dialogues(chapter_text)

        changes = []
        total_before = 0
        total_after = 0

        for dialogue in dialogues:
            speaker = dialogue["speaker"]
            profile = character_speech_profiles.get(speaker)

            if profile:
                # 检查当前对话是否符合角色特征
                score = self._score_dialogue(dialogue["text"], profile)
                total_before += score

                if score < 70:
                    # 不符合则优化
                    optimized = await self._rewrite_dialogue(
                        dialogue["text"], speaker, profile
                    )
                    chapter_text = chapter_text.replace(
                        dialogue["text"], optimized
                    )
                    changes.append({
                        "speaker": speaker,
                        "from": dialogue["text"],
                        "to": optimized,
                        "reason": self._get_failure_reason(dialogue["text"], profile)
                    })

                    new_score = self._score_dialogue(optimized, profile)
                    total_after += new_score
                else:
                    total_after += score

        return DialogueOptimizeResult(
            original_text=chapter_text,
            optimized_text=chapter_text,
            changes=changes,
            before_score=total_before / max(len(dialogues), 1),
            after_score=total_after / max(len(dialogues), 1)
        )

    def _score_dialogue(self, text: str, profile: SpeechProfile) -> int:
        """单句对话评分"""
        score = 100

        # 检查禁用词
        for word in profile.forbidden_words:
            if word in text:
                score -= 20

        # 检查爱用词
        has_favorite = any(w in text for w in profile.favorite_words)
        if not has_favorite:
            score -= 10

        # 检查句子长度
        sentence_len = len(text)
        if abs(sentence_len - profile.avg_sentence_length) > 5:
            score -= 15

        # 检查正式度
        # 0.3以下：应含语气词
        if profile.formality_level < 0.4:
            has_tone = any(w in text for w in profile.tone_words)
            if not has_tone:
                score -= 15

        return max(score, 0)
```

---

### 3.4 时间线与角色状态追踪

```python
class TimelineManager:
    """全局时间线管理"""

    async def pre_generation_check(
        self,
        book_id: UUID,
        chapter_outline: str,
        mentioned_characters: list[str]
    ) -> PreGenCheckResult:
        """生成前的时间线和角色状态检查"""
        warnings = []

        # 1. 获取当前时间线状态
        last_event = await self.get_last_event(book_id)
        current_day = last_event.day_number if last_event else 1

        # 2. 检查时间连续性
        time_hint = self._extract_time_hint(chapter_outline)
        if time_hint and time_hint < current_day:
            warnings.append(Warning(
                severity="high",
                content=f"新章节时间({time_hint}d)早于当前时间({current_day}d)"
            ))

        # 3. 检查角色状态
        char_states = {}
        for char_name in mentioned_characters:
            char = await character_service.get_by_name(book_id, char_name)
            if char:
                last_state = await self.get_latest_state(char.id)
                char_states[char_name] = last_state

                # 检查位置连续性
                if last_state and "location" in last_state:
                    if last_state["location"] not in chapter_outline:
                        # 检查是否有行程交代
                        if not self._has_travel_narrative(chapter_outline, char_name):
                            warnings.append(Warning(
                                severity="medium",
                                content=f"{char_name}上一章在"
                                        f"{last_state['location']}，新章未交代移动"
                            ))

        return PreGenCheckResult(
            passed=len([w for w in warnings if w.severity == "high"]) == 0,
            warnings=warnings,
            timeline_context={
                "current_day": current_day,
                "season": self._calculate_season(current_day),
                "last_event": last_event.event_desc if last_event else "故事开始",
                "character_states": char_states
            }
        )

    async def record_chapter_events(
        self,
        chapter_id: UUID,
        events: list[ChapterEvent]
    ):
        """生成后记录章节事件"""
        chapter = await chapter_service.get(chapter_id)
        book_id = chapter.book_id

        for event in events:
            await TimelineEvent.create(
                book_id=book_id,
                chapter_id=chapter_id,
                day_number=event.day,
                event_desc=event.desc,
                involved_chars=event.characters,
                location=event.location,
                importance=event.importance
            )

    async def update_character_states(
        self,
        chapter_id: UUID,
        character_updates: dict[str, CharacterStateUpdate]
    ):
        """更新角色状态"""
        chapter = await chapter_service.get(chapter_id)

        for char_name, update in character_updates.items():
            char = await character_service.get_by_name(chapter.book_id, char_name)
            if char:
                latest_state = await self.get_latest_state(char.id)

                # 合并状态
                new_state = latest_state or {}
                new_state.update(update.dict(exclude_none=True))

                await CharStateLog.create(
                    character_id=char.id,
                    chapter_id=chapter_id,
                    chapter_number=chapter.sort_order,
                    state_snapshot=new_state
                )
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
│                                                             │
│  第2层：当前大纲节点 (来自 outlines)                           │
│  ───────────────────────────────────────────────────────────  │
│  获取当前章节的 outline 节点 + 所属卷的大纲节点                │
│                                                             │
│  第3层：角色设定 (来自 characters)                             │
│  ───────────────────────────────────────────────────────────  │
│  获取出场角色卡片，每个角色压缩到 200 字以内                   │
│                                                             │
│  附加：时间线信息 (来自 timeline_events)                       │
│  ───────────────────────────────────────────────────────────  │
│  当前故事时间：第15天 / 初夏                                   │
│                                                             │
│  附加：字数预算 (来自 WordBudgetAllocator)                     │
│  ───────────────────────────────────────────────────────────  │
│  目标3000字，当前场景字数分配表                                │
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
│    + {第1层内容}                                              │
│    + "=== 本章目标 ==="                                       │
│    + {第2层内容}                                              │
│    + "=== 出场角色 ==="                                       │
│    + {第3层内容}                                              │
│    + "=== 字数要求 ==="                                       │
│    + "本章目标字数{target}字，当前场景约{budget}字"           │
│    + "=== 写作要求 ==="                                       │
│    + style_instructions                                       │
│    + de_ai_instructions                                       │
│    + dialogue_instructions                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
    调用大模型生成正文（字数控制实时介入）
```

### 4.2 Prompt 模板集

#### 去AI味写作指令模板

```
=== 写作风格要求 ===

【禁止使用的表达】
❌ AI高频词：然而、但是、不过、值得一提的是、显而易见、毫无疑问、事实上
❌ 心理描写标签：他感到、她意识到、他心里想、他觉得自己
❌ 每段结尾的总结性句子
❌ 工整的排比句
❌ "就这样"、"如此一来" 等过渡词

【必须遵循的要求】
✅ 用动作和对话表现情绪
   ❌ "他感到非常愤怒"
   ✅ "他一拳砸在桌上，茶杯跳了起来"
✅ 句子长短结合，至少30%的句子在10字以内
✅ 对话占比不低于40%
✅ 段落短小，每段不超过200字
✅ 适当使用口语化表达
✅ 不同角色说话要有明显区别
```

#### 对话写作指令模板

```
=== 角色对话要求 ===

【角色语音特征】
{角色名}（{角色类型}）：
  - 说话特点：{speech_profile.speech_pattern}
  - 常用语气词：{speech_profile.tone_words}
  - 爱用词：{speech_profile.favorite_words}
  - 禁用词：{speech_profile.forbidden_words}
  - 句子长度偏好：约{speech_profile.avg_sentence_length}字
  - 正式度：{speech_profile.formality_level}

【当前对话场景】
场景类型：{scene_type}
正式度要求：{formality_adjustment}
注意事项：{scene_notes}

请确保每个角色的对话方式符合其语音特征，
不同角色之间要有明显的语言风格差异。
```

#### 字数控制指令模板

```
=== 字数要求 ===

本章目标总字数：{target}字
允许误差：±10%（即{min_words}-{max_words}字）

当前场景：{scene_name}
本场景目标字数：{scene_budget}字

请严格按照字数要求写作。
当字数接近目标时会收到"收尾提示"，请配合执行。
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

---

## 六、目录结构

```
ai-novel-platform/
├── client/                          # 前端 (Next.js 16)
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── books/
│   │   │   └── book/[id]/
│   │   │       ├── page.tsx
│   │   │       ├── outlines/
│   │   │       ├── characters/
│   │   │       ├── chapters/
│   │   │       ├── chapter/[chapterId]/
│   │   │       └── analysis/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui 组件
│   │   │   ├── layout/
│   │   │   ├── editor/              # 章节编辑器
│   │   │   ├── outline-tree/        # 大纲树组件
│   │   │   ├── character-card/      # 角色卡片
│   │   │   ├── analysis-report/     # 拆书报告
│   │   │   ├── review-score/        # 审查评分组件
│   │   │   ├── speech-profile/      # 语音特征配置
│   │   │   └── timeline/            # 时间线可视化
│   │   ├── lib/
│   │   │   ├── api/                 # API 客户端
│   │   │   ├── stores/              # Zustand 状态
│   │   │   └── utils/
│   │   └── types/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                          # 后端 (Python FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── book.py
│   │   │   ├── outline.py
│   │   │   ├── character.py
│   │   │   ├── chapter.py
│   │   │   ├── analysis.py
│   │   │   ├── review.py
│   │   │   ├── timeline.py
│   │   │   └── speech_profile.py
│   │   ├── schemas/
│   │   │   ├── book.py
│   │   │   ├── outline.py
│   │   │   ├── character.py
│   │   │   ├── chapter.py
│   │   │   ├── review.py
│   │   │   └── timeline.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── books.py
│   │   │   ├── outlines.py
│   │   │   ├── characters.py
│   │   │   ├── chapters.py
│   │   │   ├── review.py
│   │   │   ├── analysis.py
│   │   │   └── timeline.py
│   │   └── services/
│   │       ├── ai/
│   │       │   ├── base.py
│   │       │   ├── deepseek.py
│   │       │   ├── kimi.py
│   │       │   ├── router.py
│   │       │   └── stream.py
│   │       ├── context/
│   │       │   ├── assembler.py
│   │       │   ├── summarizer.py
│   │       │   └── rag.py
│   │       ├── generator/
│   │       │   ├── chapter_gen.py
│   │       │   ├── outline_gen.py
│   │       │   └── character_gen.py
│   │       ├── control/
│   │       │   ├── word_count.py       # 字数控制
│   │       │   ├── de_ai.py            # 去AI味
│   │       │   └── dialogue.py         # 对话优化
│   │       ├── review/
│   │       │   ├── chapter_review.py   # 章节审查评分
│   │       │   └── outline_review.py   # 大纲审查
│   │       ├── analysis/
│   │       │   ├── preprocessor.py
│   │       │   ├── structure.py
│   │       │   └── template_gen.py
│   │       └── timeline/
│   │           ├── timeline_manager.py # 时间线管理
│   │           └── state_tracker.py    # 角色状态追踪
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 七、部署方案

```yaml
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
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      KIMI_API_KEY: ${KIMI_API_KEY}
      TONGYI_API_KEY: ${TONGYI_API_KEY}
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