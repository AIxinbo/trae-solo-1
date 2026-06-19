# AI小说写作平台 - 开发实现文档

## 目录

1. [开发环境与依赖](#1-开发环境与依赖)
2. [项目目录结构](#2-项目目录结构)
3. [Step 1：项目骨架搭建](#3-step-1项目骨架搭建)
4. [Step 2：后端核心开发](#4-step-2后端核心开发)
5. [Step 3：前端基础框架](#5-step-3前端基础框架)
6. [Step 4：AI 生成功能](#6-step-4ai-生成功能)
7. [Step 5：质量优化系统](#7-step-5质量优化系统)
8. [Step 6：拆书分析](#8-step-6拆书分析)
9. [附录：UI 设计规范](#9-附录ui-设计规范)

---

## 1. 开发环境与依赖

### 1.1 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Docker | 24+ | 容器化运行 |
| Docker Compose | 2.20+ | 编排 3 个容器 |
| Node.js | 20+ | 仅本地开发用 |
| Python | 3.12+ | 仅本地开发用 |
| 包管理器 | npm 10+ / pnpm 8+ | 推荐 pnpm |

### 1.2 后端依赖

```txt
# server/requirements.txt
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

### 1.3 前端依赖

```json
{
  "dependencies": {
    "next": "^16",
    "react": "^19",
    "react-dom": "^19",
    "@tiptap/react": "^2.11",
    "@tiptap/starter-kit": "^2.11",
    "@tiptap/extension-placeholder": "^2.11",
    "react-arborist": "^3.4",
    "zustand": "^5.0",
    "lucide-react": "^0.470",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.6",
    "@radix-ui/react-dialog": "^1.1",
    "@radix-ui/react-dropdown-menu": "^2.1",
    "@radix-ui/react-tabs": "^1.1",
    "@radix-ui/react-toast": "^1.2",
    "@radix-ui/react-tooltip": "^1.1",
    "@radix-ui/react-progress": "^1.1"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "tailwindcss": "^4.0",
    "@tailwindcss/postcss": "^4.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "postcss": "^8.5"
  }
}
```

### 1.4 环境变量 (.env.example)

```bash
# Database
DB_PASSWORD=changeme

# JWT
JWT_SECRET=your-jwt-secret-change-in-production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**说明**：不再需要在环境变量中配置 AI API Key。用户模型的 API Key 通过前端页面配置，存储在数据库中（`user_model_configs` 表），支持用户运行时动态切换和添加第三方模型。

---

## 2. 项目目录结构

### 2.1 完整目录树

```
/workspace/ai-novel-platform/
├── .env.example
├── .gitignore
├── docker-compose.yml              # 3 个容器编排
├── docker-compose.dev.yml          # 本地开发用（热重载）
│
├── server/                         # FastAPI 后端
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # FastAPI 入口
│       ├── config.py               # 环境变量配置
│       ├── database.py             # 数据库连接 + init_db()
│       ├── models/                 # SQLAlchemy 模型
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── book.py
│       │   ├── outline.py
│       │   ├── character.py
│       │   ├── chapter.py
│       │   ├── review.py
│       │   ├── timeline.py
│       │   └── model_config.py      # 用户模型配置表
│       ├── schemas/                # Pydantic 请求/响应
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── book.py
│       │   ├── outline.py
│       │   ├── character.py
│       │   ├── chapter.py
│       │   └── review.py
│       ├── api/                    # 路由层
│       │   ├── __init__.py
│       │   ├── router.py           # 统一注册所有路由
│       │   ├── auth.py
│       │   ├── books.py
│       │   ├── outlines.py
│       │   ├── characters.py
│       │   ├── chapters.py
│       │   ├── review.py
│       │   ├── analysis.py
│       │   ├── timeline.py
│       │   └── model_config.py      # 模型配置API
│       ├── services/
│       │   ├── __init__.py
│       │   ├── ai/
│       │   │   ├── __init__.py
│       │   │   ├── client.py       # AIClient 基类（支持动态模型）
│       │   │   ├── factory.py      # 模型工厂：根据用户配置创建客户端实例
│       │   │   └── router.py       # ModelRouter（废弃，由factory替代）
│       │   ├── context/
│       │   │   ├── __init__.py
│       │   │   └── assembler.py    # 三重上下文组装
│       │   ├── generator/
│       │   │   ├── __init__.py
│       │   │   ├── chapter.py      # 章节正文生成（多智能体入口）
│       │   │   ├── planner.py      # Agent 1：情节规划Agent
│       │   │   ├── writer.py       # Agent 2：正文写手Agent
│       │   │   ├── de_ai.py        # Agent 3：去AI味Agent
│       │   │   └── proofreader.py  # Agent 4：审校Agent
│       │   ├── control/
│       │   │   ├── __init__.py
│       │   │   ├── word_count.py   # 字数控制
│       │   │   └── dialogue.py     # 对话优化
│       │   ├── review/
│       │   │   ├── __init__.py
│       │   │   ├── coherence_agent.py   # Agent 1：连贯性审查Agent
│       │   │   ├── character_agent.py   # Agent 2：人设审查Agent
│       │   │   ├── pleasure_agent.py    # Agent 3：爽点+节奏审查Agent
│       │   │   ├── aggregator.py        # Agent 4：综合评分Agent + 判定
│       │   │   ├── chapter_review.py    # 章节审查入口（编排4个Agent）
│       │   │   └── outline_review.py    # 大纲审查
│       │   ├── analysis/
│       │   │   ├── __init__.py
│       │   │   └── core.py         # 拆书分析核心
│       │   └── timeline/
│       │       ├── __init__.py
│       │       ├── manager.py      # 时间线管理
│       │       └── state_tracker.py # 角色状态追踪
│       └── middleware/
│           ├── __init__.py
│           └── auth.py             # JWT 中间件
│
├── client/                         # Next.js 前端
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── app/
│       │   ├── globals.css         # 全局样式 + Tailwind
│       │   ├── layout.tsx          # 根布局
│       │   ├── page.tsx            # 首页
│       │   ├── login/
│       │   │   └── page.tsx
│       │   ├── register/
│       │   │   └── page.tsx
│       │   ├── dashboard/
│       │   │   └── page.tsx        # 控制台（项目列表）
│       │   └── book/
│       │       └── [id]/
│       │           ├── page.tsx    # 项目概览
│       │           ├── outlines/
│       │           │   └── page.tsx
│       │           ├── characters/
│       │           │   └── page.tsx
│       │           ├── chapters/
│       │           │   └── page.tsx
│       │           ├── chapter/
│       │           │   └── [chapterId]/
│       │           │       └── page.tsx   # 写作编辑器页
│       │           ├── analysis/
│       │           │   └── page.tsx
│       │   ├── timeline/
│       │   │   └── page.tsx
│       │   └── settings/
│       │       └── models/
│       │           └── page.tsx    # 模型配置页
│       ├── components/
│       │   ├── ui/                 # 通用UI组件
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── dialog.tsx      # 模态框
│       │   │   ├── dropdown-menu.tsx
│       │   │   ├── tabs.tsx
│       │   │   ├── toast.tsx
│       │   │   ├── progress.tsx
│       │   │   ├── tooltip.tsx
│       │   │   └── loading-spinner.tsx
│       │   ├── layout/
│       │   │   ├── sidebar.tsx     # 左侧导航
│       │   │   ├── topbar.tsx      # 顶部栏
│       │   │   └── book-layout.tsx # 项目内布局
│       │   ├── editor/
│       │   │   ├── novel-editor.tsx        # 编辑器主体
│       │   │   ├── editor-toolbar.tsx      # 格式工具栏
│       │   │   ├── word-count-bar.tsx      # 字数进度条
│       │   │   └── ai-panel.tsx            # AI 侧边栏
│       │   ├── outline-tree/
│       │   │   ├── outline-tree.tsx        # 大纲树
│       │   │   ├── outline-node.tsx        # 树节点
│       │   │   └── outline-actions.tsx     # 节点操作菜单
│       │   ├── character-card/
│       │   │   ├── character-card.tsx      # 角色卡片
│       │   │   ├── character-form.tsx      # 角色表单
│       │   │   └── speech-profile.tsx      # 语音特征编辑
│       │   ├── review-score/
│       │   │   ├── review-result.tsx       # 审查结果展示
│       │   │   ├── radar-chart.tsx         # 雷达图组件
│       │   │   └── dimension-score.tsx     # 单维度评分
│       │   ├── timeline/
│       │   │   ├── timeline-view.tsx       # 时间线视图
│       │   │   └── char-state-log.tsx      # 角色状态列表
│       │   └── analysis/
│       │       ├── analysis-result.tsx     # 拆书结果
│       │       └── structure-view.tsx      # 结构分析视图
│       ├── lib/
│       │   ├── api/
│       │   │   ├── client.ts       # fetch 封装
│       │   │   ├── auth.ts         # 认证 API
│       │   │   ├── books.ts        # 项目 API
│       │   │   ├── outlines.ts     # 大纲 API
│       │   │   ├── characters.ts   # 角色 API
│       │   │   ├── chapters.ts     # 章节 API
│       │   │   ├── review.ts       # 审查 API
│       │   │   └── analysis.ts     # 拆书 API
│       │   ├── stores/
│       │   │   ├── auth-store.ts   # 认证状态
│       │   │   ├── book-store.ts   # 当前项目
│       │   │   ├── editor-store.ts # 编辑器状态
│       │   │   └── review-store.ts # 审查状态
│       │   └── utils.ts
│       └── types/
│           ├── index.ts            # 全局类型
│           ├── book.ts
│           ├── outline.ts
│           ├── character.ts
│           ├── chapter.ts
│           └── review.ts
```

---

## 3. Step 1：项目骨架搭建

### 3.1 docker-compose.yml

文件：`docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: ai-novel-db
    environment:
      POSTGRES_DB: ai_novel
      POSTGRES_USER: ai_novel
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docs/init.sql:/docker-entrypoint-initdb.d/init.sql
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

**关键说明**：
- PostgreSQL 镜像改为标准 `postgres:16`（移除 pgvector）
- `init.sql` 挂载到 `docker-entrypoint-initdb.d/`，首次启动自动建表
- 后端通过 `depends_on` + `healthcheck` 确保数据库就绪后才启动

### 3.2 docker-compose.dev.yml（本地开发用）

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: ai-novel-db
    environment:
      POSTGRES_DB: ai_novel
      POSTGRES_USER: ai_novel
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docs/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ai_novel"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    container_name: ai-novel-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://ai_novel:${DB_PASSWORD:-changeme}@postgres:5432/ai_novel
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      KIMI_API_KEY: ${KIMI_API_KEY}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
    volumes:
      - ./server/app:/app/app
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8000:8000"
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    container_name: ai-novel-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    volumes:
      - ./client/src:/app/src
    depends_on:
      - backend
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3.3 后端 Dockerfile

```dockerfile
# server/Dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 启动时自动建表 + 启动 FastAPI
CMD ["sh", "-c", "\
    python -c 'from app.database import init_db; import asyncio; asyncio.run(init_db())' && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 \
"]
```

```dockerfile
# server/Dockerfile.dev（热重载）
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn[standard]

COPY . .

CMD ["sh", "-c", "\
    python -c 'from app.database import init_db; import asyncio; asyncio.run(init_db())' && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
"]
```

### 3.4 前端 Dockerfile

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

```dockerfile
# client/Dockerfile.dev（热重载）
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
```

### 3.5 后端启动文件

#### config.py

```python
# server/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://ai_novel:changeme@localhost:5432/ai_novel"
    )
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    KIMI_API_KEY: str = os.getenv("KIMI_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天


settings = Settings()
```

#### database.py

```python
# server/app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """自动建表（启动时调用）"""
    async with engine.begin() as conn:
        from app.models.user import User
        from app.models.book import Book
        from app.models.outline import Outline
        from app.models.character import Character
        from app.models.chapter import Chapter, ChapterVersion
        from app.models.review import Review
        from app.models.timeline import TimelineEvent, CharStateLog
        from app.models.analysis import AnalysisRecord
        from app.models.model_config import UserModelConfig
        await conn.run_sync(Base.metadata.create_all)
```

#### main.py

```python
# server/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.database import init_db

app = FastAPI(title="AI Novel Platform", version="1.0.0")

# CORS — 允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def on_startup():
    """启动时自动建表"""
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}
```

### 3.6 SQLAlchemy 模型（共10张表）

#### models/user.py

```python
# server/app/models/user.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50))
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    books = relationship("Book", back_populates="user")
```

#### models/book.py

```python
# server/app/models/book.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(200), nullable=False)
    genre = Column(String(50), nullable=False, default="玄幻")
    style = Column(String(50), default="default")
    synopsis = Column(String, default="")
    target_platform = Column(String(50), default="")
    world_setting = Column(String, default="")
    word_count_target = Column(Integer, default=0)
    status = Column(String(20), default="draft")
    ai_config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    outlines = relationship("Outline", back_populates="book", cascade="all, delete-orphan")
    characters = relationship("Character", back_populates="book", cascade="all, delete-orphan")
    chapters = relationship("Chapter", back_populates="book", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="book", cascade="all, delete-orphan")
```

#### models/outline.py

```python
# server/app/models/outline.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Outline(Base):
    __tablename__ = "outlines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("outlines.id", ondelete="CASCADE"))
    level = Column(String(10), nullable=False)  # volume, chapter, section
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    plot_points = Column(JSON, default=list)
    word_count_target = Column(Integer, default=0)
    emotion_curve = Column(String(20), default="")
    sort_order = Column(Integer, nullable=False, default=0)
    ai_summary = Column(Text, default="")
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="outlines")
    children = relationship("Outline", backref="parent", remote_side=[id], cascade="all, delete-orphan")
```

#### models/character.py

```python
# server/app/models/character.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(String(20), default="")
    gender = Column(String(10), default="")
    role_type = Column(String(20), nullable=False, default="supporter")
    appearance = Column(Text, default="")
    personality = Column(Text, default="")
    background = Column(Text, default="")
    motivation = Column(Text, default="")
    growth_arc = Column(JSON, default=list)
    relationships = Column(JSON, default=list)

    # 语音特征
    speech_style = Column(String(30), default="普通")
    formality_level = Column(Float, default=0.5)
    avg_sentence_len = Column(Integer, default=8)
    favorite_words = Column(ARRAY(String), default=list)
    forbidden_words = Column(ARRAY(String), default=list)
    tone_words = Column(ARRAY(String), default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="characters")
    state_logs = relationship("CharStateLog", back_populates="character", cascade="all, delete-orphan")
```

#### models/chapter.py

```python
# server/app/models/chapter.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    outline_id = Column(UUID(as_uuid=True), ForeignKey("outlines.id", ondelete="SET NULL"))
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    ai_summary = Column(String(500), default="")
    word_count = Column(Integer, default=0)
    word_count_target = Column(Integer, default=0)
    characters = Column(ARRAY(UUID), default=list)
    key_events = Column(JSON, default=list)
    pleasure_points = Column(JSON, default=list)
    status = Column(String(20), default="draft")
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="chapters")
    versions = relationship("ChapterVersion", back_populates="chapter", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="chapter")


class ChapterVersion(Base):
    __tablename__ = "chapter_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    chapter = relationship("Chapter", back_populates="versions")
```

#### models/review.py

```python
# server/app/models/review.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"))
    target_type = Column(String(10), nullable=False)  # outline, chapter
    target_id = Column(UUID(as_uuid=True), nullable=False)
    overall_score = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False, default=True)
    rewrite_required = Column(Boolean, default=False)
    dimension_scores = Column(JSON, nullable=False)
    priority_issues = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="reviews")
    chapter = relationship("Chapter", back_populates="reviews")
```

#### models/timeline.py

```python
# server/app/models/timeline.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    day_number = Column(Integer, nullable=False)
    event_desc = Column(String(500), nullable=False)
    involved_chars = Column(ARRAY(UUID), default=list)
    location = Column(String(200), default="")
    season = Column(String(10), default="")
    importance = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="timeline_events")


class CharStateLog(Base):
    __tablename__ = "char_state_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(UUID(as_uuid=True), ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    chapter_number = Column(Integer, nullable=False)
    state_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    character = relationship("Character", back_populates="state_logs")
```

#### models/analysis.py

```python
# server/app/models/analysis.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="SET NULL"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    source_title = Column(String(200), nullable=False)
    source_author = Column(String(100), default="")
    source_type = Column(String(20), default="manual")
    source_content = Column(Text, default="")
    structure_analysis = Column(JSON, default=dict)
    character_analysis = Column(JSON, default=dict)
    rhythm_analysis = Column(JSON, default=dict)
    techniques = Column(JSON, default=dict)
    templates = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### 3.7 路由注册

```python
# server/app/api/router.py
from fastapi import APIRouter
from app.api import auth, books, outlines, characters, chapters, review, analysis, timeline, model_config

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(books.router, prefix="/books", tags=["项目管理"])
api_router.include_router(outlines.router, prefix="/books", tags=["大纲管理"])
api_router.include_router(characters.router, prefix="/books", tags=["角色管理"])
api_router.include_router(chapters.router, prefix="/books", tags=["章节管理"])
api_router.include_router(review.router, prefix="/review", tags=["审查评分"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["拆书分析"])
api_router.include_router(timeline.router, prefix="/books", tags=["时间线"])
api_router.include_router(model_config.router, prefix="/model-configs", tags=["模型配置"])
```

### 3.8 Pydantic Schema 示例

```python
# server/app/schemas/user.py
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    nickname: str | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

```python
# server/app/schemas/character.py
from pydantic import BaseModel
from typing import Optional


class CharacterCreate(BaseModel):
    name: str
    age: str = ""
    gender: str = ""
    role_type: str = "supporter"
    appearance: str = ""
    personality: str = ""
    background: str = ""
    motivation: str = ""
    speech_style: str = "普通"
    formality_level: float = 0.5
    avg_sentence_len: int = 8
    favorite_words: list[str] = []
    forbidden_words: list[str] = []
    tone_words: list[str] = []


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    role_type: Optional[str] = None
    appearance: Optional[str] = None
    personality: Optional[str] = None
    background: Optional[str] = None
    motivation: Optional[str] = None
    speech_style: Optional[str] = None
    formality_level: Optional[float] = None
    avg_sentence_len: Optional[int] = None
    favorite_words: Optional[list[str]] = None
    forbidden_words: Optional[list[str]] = None
    tone_words: Optional[list[str]] = None


class CharacterResponse(BaseModel):
    id: str
    book_id: str
    name: str
    age: str
    gender: str
    role_type: str
    appearance: str
    personality: str
    background: str
    motivation: str
    speech_style: str
    formality_level: float
    avg_sentence_len: int
    favorite_words: list[str]
    forbidden_words: list[str]
    tone_words: list[str]
    created_at: str

    model_config = {"from_attributes": True}
```

---

## 4. Step 2：后端核心开发

### 4.1 JWT 认证中间件

```python
# server/app/middleware/auth.py
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

security = HTTPBearer()


async def get_current_user(request: Request):
    """从请求中解析 JWT 获取当前用户 ID"""
    credentials: HTTPAuthorizationCredentials = await security(request)
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 4.2 AI 客户端 + 模型配置（支持用户自定义模型）

**核心变化**：用户可以在前端自由配置第三方模型（DeepSeek、Kimi、通义千问、OpenAI 等），系统根据配置动态创建客户端实例，不再硬编码。

#### 数据模型：模型配置表

```python
# server/app/models/model_config.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class UserModelConfig(Base):
    """用户自定义第三方模型配置"""
    __tablename__ = "user_model_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    provider = Column(String(50), default="openai-compatible")
    base_url = Column(String(500), nullable=False)
    api_key = Column(String(500), nullable=False)
    model_name = Column(String(100), nullable=False)
    scenes = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**场景标识符**：

| 场景 | 用途 | 所属模块 |
|------|------|---------|
| `chapter_planner` | 写作 — 情节规划Agent | 写正文多智能体 |
| `chapter_writer` | 写作 — 正文写手Agent | 写正文多智能体 |
| `de_ai` | 写作 — 去AI味Agent | 写正文多智能体 |
| `proofreader` | 写作 — 审校Agent | 写正文多智能体 |
| `chapter_review` | 审查 — 审查Agent（所有审查共用） | 审查多智能体 |
| `outline_generate` | AI 生成大纲 | 大纲管理 |
| `outline_review` | AI 审查大纲 | 大纲管理 |
| `analysis` | 拆书分析 | 拆书分析 |
| `dialogue` | 对话优化 | 对话优化 |

用户可为每个场景指派不同模型。

#### AIClient 基类

```python
# server/app/services/ai/client.py
import httpx
import json
from typing import AsyncGenerator


class AIClient:
    """AI 模型 HTTP 客户端 — 兼容 OpenAI 协议，不绑定具体模型"""

    def __init__(self, base_url: str, api_key: str, model_name: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def chat(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        """非流式调用"""
        async with httpx.AsyncClient(timeout=120) as client:
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
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def chat_stream(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        """流式调用（SSE）"""
        async with httpx.AsyncClient(timeout=180) as client:
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
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                yield delta["content"]
                        except json.JSONDecodeError:
                            continue
```

```python
# server/app/services/ai/factory.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.ai.client import AIClient
from app.models.model_config import UserModelConfig
from app.models.book import Book
from app.config import settings


async def get_client_for_scene(
    db: AsyncSession,
    user_id: str,
    scene: str,
    book_id: Optional[str] = None,
) -> AIClient:
    """
    根据用户配置，为指定场景获取 AI 客户端。
    优先级：book.ai_config 覆盖 > 用户全局配置 > 默认 DeepSeek 兜底
    """
    # 1. 书籍级覆盖
    if book_id:
        result = await db.execute(select(Book).where(Book.id == book_id))
        book = result.scalar_one_or_none()
        if book and book.ai_config and "model_overrides" in book.ai_config:
            overrides = book.ai_config["model_overrides"]
            if scene in overrides:
                cfg = overrides[scene]
                if all(k in cfg for k in ("base_url", "api_key", "model_name")):
                    return AIClient(cfg["base_url"], cfg["api_key"], cfg["model_name"])

    # 2. 用户全局配置
    result = await db.execute(
        select(UserModelConfig)
        .where(UserModelConfig.user_id == user_id, UserModelConfig.is_active == True)
        .order_by(UserModelConfig.sort_order)
    )
    for config in result.scalars().all():
        if scene in config.scenes:
            return AIClient(config.base_url, config.api_key, config.model_name)

    # 3. 兜底
    return AIClient(
        base_url="https://api.deepseek.com",
        api_key=settings.DEEPSEEK_API_KEY or "",
        model_name="deepseek-chat",
    )
```

**说明**：用户如果没有配置任何模型，系统读取环境变量 DEEPSEEK_API_KEY 做兜底。用户在前端配置模型后，完全使用用户配置，API Key 存储在数据库中。

---

### 4.2a 模型配置 API

```python
# server/app/api/model_config.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.model_config import UserModelConfig
from app.schemas.model_config import ModelConfigCreate, ModelConfigUpdate, ModelConfigResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[ModelConfigResponse])
async def list_configs(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的所有模型配置"""
    result = await db.execute(
        select(UserModelConfig)
        .where(UserModelConfig.user_id == user_id)
        .order_by(UserModelConfig.sort_order)
    )
    configs = result.scalars().all()
    return [ModelConfigResponse.model_validate(c) for c in configs]


@router.post("/", response_model=ModelConfigResponse, status_code=201)
async def create_config(
    data: ModelConfigCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """新增模型配置"""
    config = UserModelConfig(
        user_id=user_id,
        name=data.name,
        base_url=data.base_url,
        api_key=data.api_key,
        model_name=data.model_name,
        scenes=data.scenes,
    )
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return ModelConfigResponse.model_validate(config)


@router.put("/{config_id}", response_model=ModelConfigResponse)
async def update_config(
    config_id: str,
    data: ModelConfigUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新模型配置"""
    result = await db.execute(
        select(UserModelConfig).where(
            UserModelConfig.id == config_id,
            UserModelConfig.user_id == user_id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)

    await db.commit()
    await db.refresh(config)
    return ModelConfigResponse.model_validate(config)


@router.delete("/{config_id}", status_code=204)
async def delete_config(
    config_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除模型配置"""
    result = await db.execute(
        select(UserModelConfig).where(
            UserModelConfig.id == config_id,
            UserModelConfig.user_id == user_id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")
    await db.delete(config)
    await db.commit()


@router.get("/scenes")
async def list_scenes():
    """返回所有可用场景标识符列表"""
    return {
        "scenes": [
            {"id": "chapter_planner", "name": "情节规划", "module": "写正文"},
            {"id": "chapter_writer", "name": "正文写手", "module": "写正文"},
            {"id": "de_ai", "name": "去AI味", "module": "写正文"},
            {"id": "proofreader", "name": "审校", "module": "写正文"},
            {"id": "chapter_review", "name": "章节审查", "module": "审查"},
            {"id": "outline_generate", "name": "大纲生成", "module": "大纲"},
            {"id": "outline_review", "name": "大纲审查", "module": "大纲"},
            {"id": "analysis", "name": "拆书分析", "module": "拆书"},
            {"id": "dialogue", "name": "对话优化", "module": "写作"},
        ]
    }
```

And also the Pydantic schemas for model_config:

```python
# server/app/schemas/model_config.py
from pydantic import BaseModel
from typing import Optional


class ModelConfigCreate(BaseModel):
    name: str
    base_url: str
    api_key: str
    model_name: str
    scenes: list[str] = []


class ModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    scenes: Optional[list[str]] = None
    is_active: Optional[bool] = None


class ModelConfigResponse(BaseModel):
    id: str
    name: str
    provider: str
    base_url: str
    model_name: str
    scenes: list[str]
    is_active: bool
    sort_order: int

    model_config = {"from_attributes": True}
```

### 4.3 认证路由

```python
# server/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
from datetime import datetime, timedelta
from passlib.hash import bcrypt
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """用户注册"""
    # 检查用户名/邮箱是否已存在
    result = await db.execute(
        select(User).where(
            (User.username == data.username) | (User.email == data.email)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名或邮箱已存在")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=bcrypt.hash(data.password),
        nickname=data.username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 生成 JWT
    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """用户登录"""
    result = await db.execute(
        select(User).where(User.username == data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not bcrypt.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )
```

### 4.4 项目管理路由

```python
# server/app/api/books.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[BookResponse])
async def list_books(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取用户的所有项目"""
    result = await db.execute(
        select(Book).where(Book.user_id == user_id).order_by(Book.updated_at.desc())
    )
    books = result.scalars().all()
    return [BookResponse.model_validate(b) for b in books]


@router.post("/", response_model=BookResponse, status_code=201)
async def create_book(
    data: BookCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建新项目"""
    book = Book(
        user_id=user_id,
        title=data.title,
        genre=data.genre,
        style=data.style,
        synopsis=data.synopsis or "",
        target_platform=data.target_platform or "",
        world_setting=data.world_setting or "",
        word_count_target=data.word_count_target or 0,
        ai_config=data.ai_config or {},
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return BookResponse.model_validate(book)


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取项目详情"""
    result = await db.execute(
        select(Book).where(Book.id == book_id, Book.user_id == user_id)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")
    return BookResponse.model_validate(book)


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    data: BookUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新项目"""
    result = await db.execute(
        select(Book).where(Book.id == book_id, Book.user_id == user_id)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)

    await db.commit()
    await db.refresh(book)
    return BookResponse.model_validate(book)


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除项目"""
    result = await db.execute(
        select(Book).where(Book.id == book_id, Book.user_id == user_id)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")
    await db.delete(book)
    await db.commit()
```

### 4.5 大纲管理路由

```python
# server/app/api/outlines.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.outline import Outline
from app.schemas.outline import OutlineCreate, OutlineUpdate, OutlineResponse, OutlineTreeResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/outlines", response_model=list[OutlineTreeResponse])
async def get_outline_tree(
    book_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取大纲树（所有节点平铺返回，前端构建树）"""
    result = await db.execute(
        select(Outline)
        .where(Outline.book_id == book_id)
        .order_by(Outline.sort_order)
    )
    outlines = result.scalars().all()
    return [OutlineTreeResponse.model_validate(o) for o in outlines]


@router.post("/{book_id}/outlines", response_model=OutlineResponse, status_code=201)
async def create_outline(
    book_id: str,
    data: OutlineCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建大纲节点"""
    # 如果指定了父节点，验证父节点存在
    if data.parent_id:
        result = await db.execute(
            select(Outline).where(Outline.id == data.parent_id, Outline.book_id == book_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="父节点不存在")

    # 计算 sort_order
    if data.sort_order is not None:
        sort_order = data.sort_order
    else:
        result = await db.execute(
            select(Outline)
            .where(Outline.book_id == book_id, Outline.parent_id == data.parent_id)
            .order_by(Outline.sort_order.desc())
            .limit(1)
        )
        last = result.scalar_one_or_none()
        sort_order = (last.sort_order + 1) if last else 0

    outline = Outline(
        book_id=book_id,
        parent_id=data.parent_id,
        level=data.level,
        title=data.title,
        content=data.content or "",
        sort_order=sort_order,
    )
    db.add(outline)
    await db.commit()
    await db.refresh(outline)
    return OutlineResponse.model_validate(outline)


@router.put("/outlines/{outline_id}", response_model=OutlineResponse)
async def update_outline(
    outline_id: str,
    data: OutlineUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新大纲节点"""
    result = await db.execute(select(Outline).where(Outline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="大纲节点不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(outline, key, value)

    await db.commit()
    await db.refresh(outline)
    return OutlineResponse.model_validate(outline)


@router.delete("/outlines/{outline_id}", status_code=204)
async def delete_outline(
    outline_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除大纲节点"""
    result = await db.execute(select(Outline).where(Outline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="大纲节点不存在")
    await db.delete(outline)
    await db.commit()


@router.put("/outlines/reorder")
async def reorder_outlines(
    items: list[dict],
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """批量排序：items = [{"id": "uuid", "sort_order": 0, "parent_id": "uuid"}]"""
    for item in items:
        result = await db.execute(select(Outline).where(Outline.id == item["id"]))
        outline = result.scalar_one_or_none()
        if outline:
            outline.sort_order = item.get("sort_order", outline.sort_order)
            if "parent_id" in item:
                outline.parent_id = item["parent_id"]
    await db.commit()
    return {"status": "ok"}
```

### 4.6 章节生成 API（SSE 流式 + 多智能体管线）

```python
# server/app/api/chapters.py（关键部分）

@router.post("/{book_id}/chapters/{chapter_id}/generate")
async def generate_chapter(
    book_id: str,
    chapter_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI 生成章节正文（多智能体管线 + SSE 流式）"""
    # 验证章节归属
    result = await db.execute(
        select(Chapter).where(Chapter.id == chapter_id, Chapter.book_id == book_id)
    )
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 获取大纲节点
    outline = None
    if chapter.outline_id:
        result = await db.execute(select(Outline).where(Outline.id == chapter.outline_id))
        outline = result.scalar_one_or_none()

    # 获取前5章摘要
    result = await db.execute(
        select(Chapter)
        .where(Chapter.book_id == book_id, Chapter.sort_order < chapter.sort_order)
        .order_by(Chapter.sort_order.desc())
        .limit(5)
    )
    prev_chapters = result.scalars().all()
    prev_summaries = [
        f"第{c.sort_order}章《{c.title}》：{c.ai_summary or '（无摘要）'}"
        for c in reversed(prev_chapters)
    ]

    # 获取本章出场角色
    result = await db.execute(
        select(Character).where(
            Character.book_id == book_id,
            Character.id.in_(chapter.characters) if chapter.characters else False
        )
    )
    characters = result.scalars().all()

    # 获取时间线
    result = await db.execute(
        select(TimelineEvent)
        .where(TimelineEvent.book_id == book_id)
        .order_by(TimelineEvent.day_number.desc())
        .limit(10)
    )
    timeline_events = result.scalars().all()

    # 组装上下文（同前）
    context = await ContextAssembler(db).assemble_chapter_context(
        book_id, chapter_id
    )

    # SSE 响应 — 多智能体管线执行
    async def event_stream():
        full_content = ""

        # Agent 1：调用 planner 生成场景计划
        yield f"data: {json.dumps({'type': 'stage', 'agent': 'planner', 'message': '正在规划情节...'})}\n\n"
        scenes = await plan_chapter(
            db, user_id, chapter.title,
            outline.content if outline else "",
            context, chapter.word_count_target or 2000, book_id
        )

        # Agent 2 (writer)：分场景逐个生成，流式返回给客户端
        async for event in write_chapter_stream(
            db, user_id, scenes, context,
            chapter.word_count_target or 2000, book_id
        ):
            if event["type"] == "content":
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "scene_start":
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "scene_done":
                yield f"data: {json.dumps(event)}\n\n"
            full_content += event.get("text", "")

        # Agent 3 (DeAI) 和 Agent 4 (Proofreader) 在后台异步执行
        import asyncio
        asyncio.ensure_future(run_post_processing(
            db, user_id, chapter_id, full_content, book_id
        ))

        # 保存最终内容
        chapter.content = full_content
        chapter.word_count = len(full_content)
        await db.commit()

        yield f"data: {json.dumps({'type': 'done', 'word_count': len(full_content)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


async def run_post_processing(db, user_id, chapter_id, content, book_id):
    """后台执行去AI味和审校"""
    from app.services.generator.de_ai import de_ai_process
    from app.services.generator.proofreader import proofread_chapter
    # Agent 3：去AI味
    await de_ai_process(db, user_id, content, book_id)
    # Agent 4：审校
    await proofread_chapter(db, user_id, chapter_id, content, book_id)
```

### 4.7 审查评分 API

```python
# server/app/api/review.py（关键部分）

@router.post("/chapter", response_model=ReviewResponse)
async def review_chapter_endpoint(
    data: ReviewRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """审查章节评分"""
    chapter_id = data.chapter_id

    # 获取章节
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 获取前3章摘要
    result = await db.execute(
        select(Chapter)
        .where(Chapter.book_id == chapter.book_id, Chapter.sort_order < chapter.sort_order)
        .order_by(Chapter.sort_order.desc())
        .limit(3)
    )
    prev_chapters = result.scalars().all()
    prev_summaries = [
        f"第{c.sort_order}章《{c.title}》：{c.ai_summary or '（无摘要）'}"
        for c in reversed(prev_chapters)
    ]

    # 获取角色
    result = await db.execute(
        select(Character).where(
            Character.book_id == chapter.book_id,
            Character.id.in_(chapter.characters) if chapter.characters else False
        )
    )
    characters = result.scalars().all()

    # 获取时间线
    result = await db.execute(
        select(TimelineEvent)
        .where(TimelineEvent.book_id == chapter.book_id)
        .order_by(TimelineEvent.day_number)
    )
    timeline = result.scalars().all()

    # 获取大纲
    result = await db.execute(
        select(Outline).where(Outline.id == chapter.outline_id)
    )
    outline = result.scalar_one_or_none()

    # 调用 AI 审查
    client = await get_client_for_scene(db, user_id, "chapter_review")

    prompt = f"""请以专业网文编辑的身份，对以下章节进行12维度审查评分。

重要：审查时不仅看本章内容，还须对比前文情节和大纲，检测故事线是否偏离。

== 前情提要 ==
{' '.join(prev_summaries)}

== 本章大纲 ==
{outline.content if outline else '（无大纲）'}
{json.dumps(outline.plot_points, ensure_ascii=False) if outline and outline.plot_points else ''}

== 角色设定 ==
{' '.join([f'【{c.name}】角色类型：{c.role_type}，性格：{c.personality}' for c in characters])}

== 时间线 ==
{' '.join([f'第{e.day_number}天：{e.event_desc}' for e in timeline])}

== 待审查章节 ==
《{chapter.title}》
{chapter.content}

== 评分要求 ==
请按以下12个维度评分（每项0-100分），并指出具体问题：

=== 故事逻辑组 ===
1. 剧情连贯性（权重12%）：与前文逻辑衔接是否顺畅，因果是否自洽？是否有"凭空出现"的信息或角色？
2. 大纲贴合度★（权重10%）：本章情节是否按照大纲走？有没有偏离主线或擅自添加不在大纲中的主要情节？如果有偏离，指出具体偏离点。
3. 前文引用正确性★（权重8%）：文中角色引用前文发生的事件是否正确？有没有把A发生的事说成B做的？世界观规则是否被违反？

=== 角色组 ===
4. 人设一致性（权重10%）：角色行为、语言、决策是否符合设定？角色是否知道本不该知道的信息？
5. 角色情感逻辑★（权重8%）：角色情绪变化是否合理？是否有足够的铺垫和诱因？情绪转变是否突兀？

=== 写作质量组 ===
6. 爽点密度（权重10%）：爽点数量与分布是否合理？每1500-2000字是否有一个爽点？
7. 节奏控制（权重8%）：铺垫/冲突/高潮比例是否得当？段落长短是否交替合理？
8. 对话质量（权重8%）：对话是否自然？不同角色的说话方式是否有明显区分度？是否推进情节？

=== 去AI味组 ===
9. 去AI味-用词（权重6%）：检测"然而、但是、值得一提的是、显而易见、毫无疑问、事实上"等AI高频词密度。每500字超过2个则扣分。
10. 去AI味-句式（权重6%）：短句（≤10字）是否占30-50%？是否有过度工整的排比句？句子开头是否多样(不总是"他/她/这/那")？
11. 去AI味-描写手法（权重6%）：是否用动作/对话表现情绪而非直接描述"他感到…"？心理描写标签是否过多（每章超过5次扣分）？

=== 一致性组 ===
12. 时间线与伏笔（权重8%）：时间顺序/年龄/季节是否正确？前文伏笔是否被回收？新设伏笔是否合理？

---

审查意见要求：
- 对每个维度给出具体的问题描述（从原文引用例子）
- 对每个问题给出具体的修改建议
- severity分为：high（严重问题，必须修改）、medium（建议修改）、low（小瑕疵）、info（提示）

请以JSON格式输出评分结果，严格按照以下格式：
{{
    "剧情连贯性": {{"score": 85, "issues": [{{"severity": "low", "content": "第3段提到'上次的事'，但前文没有铺垫"}}], "suggestions": "建议在第1段增加一句对'上次的事'的交代"}},
    "大纲贴合度": {{"score": 90, "issues": [], "suggestions": "完全按大纲执行"}},
    ...
}}"""

    result_text = await client.chat([{"role": "user", "content": prompt}], temperature=0.3)

    # 解析评分结果
    try:
        scores = json.loads(result_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI 评分解析失败")

    # 计算总分（12维度加权）
    WEIGHTS = {
        "剧情连贯性": 0.12, "大纲贴合度": 0.10, "前文引用正确性": 0.08,
        "人设一致性": 0.10, "角色情感逻辑": 0.08,
        "爽点密度": 0.10, "节奏控制": 0.08, "对话质量": 0.08,
        "去AI味-用词": 0.06, "去AI味-句式": 0.06, "去AI味-描写手法": 0.06,
        "时间线与伏笔": 0.08,
    }
    overall = sum(scores[d]["score"] * WEIGHTS[d] for d in WEIGHTS)

    # 判定
    passed = overall >= 70
    rewrite = overall < 60

    # 提取优先级问题
    priority = []
    for dim, data in scores.items():
        for issue in data.get("issues", []):
            if issue.get("severity") in ("high", "medium"):
                priority.append({"dimension": dim, "content": issue["content"], "severity": issue["severity"]})

    # 保存审查记录
    review = Review(
        book_id=chapter.book_id,
        chapter_id=chapter.id,
        target_type="chapter",
        target_id=chapter.id,
        overall_score=int(overall),
        passed=passed,
        rewrite_required=rewrite,
        dimension_scores=scores,
        priority_issues=priority,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewResponse(
        review_id=str(review.id),
        overall_score=int(overall),
        passed=passed,
        rewrite_required=rewrite,
        dimensions=scores,
        priority_issues=priority,
    )
```

---

## 5. Step 3：前端基础框架

### 5.1 UI 设计规范

#### 配色方案

```
主色（Primary）：    #6366F1 (Indigo-500)    — 按钮、链接、重点元素
主色悬浮：          #4F46E5 (Indigo-600)    — hover 状态
主色浅色：          #EEF2FF (Indigo-50)     — 背景色块

辅色（Accent）：    #F59E0B (Amber-500)     — AI 功能、评分高亮
辅色浅色：          #FFFBEB (Amber-50)      — AI 标签背景

成功（Success）：    #22C55E (Green-500)     — 通过、达标
警告（Warning）：    #F97316 (Orange-500)    — 需要修改
错误（Danger）：     #EF4444 (Red-500)       — 不通过、错误

背景（Background）：#FAFAFA (Neutral-50)    — 页面背景
卡片（Card）：       #FFFFFF                 — 卡片背景
边框（Border）：     #E5E7EB (Gray-200)     — 分割线、边框

文本主色：          #111827 (Gray-900)      — 正文
文本次要：          #6B7280 (Gray-500)      — 辅助说明
文本占位：          #9CA3AF (Gray-400)      — 占位符

暗色模式（可选）：
  背景：            #0F172A (Slate-900)
  卡片：            #1E293B (Slate-800)
  文本：            #F1F5F9 (Slate-100)
```

#### 间距系统

```
间距单位：4px 为基数
  space-1:  4px
  space-2:  8px
  space-3:  12px
  space-4:  16px
  space-5:  20px
  space-6:  24px
  space-8:  32px
  space-10: 40px
  space-12: 48px
```

#### 字体系统

```
字体栈：Inter, -apple-system, sans-serif

字号（Text Scale）：
  xs:   12px (Tailwind text-xs)
  sm:   14px (text-sm)
  base: 16px (text-base)  — 正文
  lg:   18px (text-lg)
  xl:   20px (text-xl)
  2xl:  24px (text-2xl)
  3xl:  30px (text-3xl)   — 页面标题
```

#### 圆角

```
  sm:   4px
  md:   8px   — 默认
  lg:   12px
  xl:   16px
  full: 9999px — 头像、标签
```

#### 阴影

```
  sm:   0 1px 2px rgba(0,0,0,0.05)
  md:   0 4px 6px rgba(0,0,0,0.07)   — 卡片
  lg:   0 10px 15px rgba(0,0,0,0.1)  — 模态框/下拉
```

### 5.2 页面布局结构

```
┌──────────────────────────────────────────────────────────────┐
│  Topbar                                                    │
│  ┌──────┬───────────────────────────────────────────────────┤
│  │      │                                                   │
│  │Side  │  Main Content                                     │
│  │ bar  │                                                   │
│  │      │                                                   │
│  │      │                                                   │
│  └──────┴───────────────────────────────────────────────────┘
```

#### Topbar 组件

**位置**：页面顶部，全宽
**高度**：56px (h-14)
**背景色**：#FFFFFF
**底部边框**：1px solid #E5E7EB

**元素**（从左到右）：
1. Logo/品牌名 — 左侧，字体加粗，颜色 #6366F1
2. 项目名称（如果当前在项目内）— 中间
3. 右侧操作区：
   - 用户头像（圆形，32px）+ 用户名
   - 下拉菜单（个人中心 / 退出登录）

#### Sidebar 组件

**位置**：左侧，Topbar 下方
**宽度**：240px (w-60)
**背景色**：#F8FAFC
**右边框**：1px solid #E5E7EB

**项目内显示的菜单项**：
```
┌─────────────────────┐
│  📋  项目概览        │
│  📑  大纲管理        │
│  👥  角色管理        │
│  📝  章节管理        │
│  🔍  拆书分析        │
│  ⏱️  时间线          │
└─────────────────────┘
```

- 当前活跃菜单项：背景色 #EEF2FF，文字色 #6366F1
- 非活跃菜单项：文字色 #6B7280
- hover：背景色 #F1F5F9，文字色 #374151

### 5.3 页面详细设计

#### 5.3.1 首页 (`/`)

**URL**: `/`

**布局**：居中，最大宽度 1200px

**内容**：
1. **Hero 区** — 页面顶部大区块
   - 标题："AI 小说写作平台"（text-3xl，颜色 #111827，居中）
   - 副标题："从拆书到成稿，AI 陪你写出好故事"（text-lg，颜色 #6B7280）
   - 按钮组：
     - [开始使用] 主按钮，背景色 #6366F1，白色文字，圆角 md，padding: 12px 24px
     - [了解更多] 次要按钮，边框 1px solid #6366F1，文字色 #6366F1

2. **功能卡片区** — 3x3 网格
   - 9 张功能卡片，每张包含：图标（lucide-react）+ 标题 + 简短描述
   - 卡片样式：白色背景，圆角 lg，阴影 md，padding 24px，hover 时上移 2px 动画
   - 功能列表：拆书分析、大纲提取、大纲设计、大纲审查、角色创作、细纲创造、正文编写、正文审稿、章节修改

3. **页脚**
   - 版权信息
   - GitHub 链接（可选）

#### 5.3.2 登录页 (`/login`)

**URL**: `/login`

**布局**：居中卡片，最大宽度 400px，垂直居中

**表单元素**：
1. 标题："登录"（text-2xl，居中）
2. 用户名输入框
   - label: "用户名"
   - placeholder: "请输入用户名"
   - 高度 40px，边框 1px solid #E5E7EB，圆角 md
   - focus 时边框色 #6366F1，ring
3. 密码输入框
   - label: "密码"
   - placeholder: "请输入密码"
   - type: password
4. [登录] 按钮 — 全宽，主色，白色文字
5. 底部链接："还没有账号？[立即注册]"
   - 文字色 #6366F1，hover 下划线

**按钮状态**：
- 默认：背景色 #6366F1
- hover：背景色 #4F46E5
- disabled：背景色 #9CA3AF，cursor not-allowed
- loading：显示旋转 spinner + "登录中..."

#### 5.3.3 注册页 (`/register`)

**URL**: `/register`

**与登录页类似**，增加"确认密码"字段。

#### 5.3.4 控制台 (`/dashboard`)

**URL**: `/dashboard`

**布局**：Topbar + Main Content（无 Sidebar）

**内容**：
1. 页面标题："我的项目"（text-2xl，#111827）
2. [新建项目] 按钮 — 右上角，主色
3. 项目卡片网格（每行 3-4 张）

**项目卡片样式**：
- 白色背景，圆角 lg，阴影 md
- padding: 24px
- 内容：
  - 项目标题（text-lg，加粗，#111827）
  - 题材标签：小圆角标签，背景色 #EEF2FF，文字色 #6366F1，字号 xs
  - 状态指示器：
    - 草稿：灰色圆点 + "草稿"
    - 进行中：蓝色圆点 + "进行中"
    - 已完成：绿色圆点 + "已完成"
  - 统计数据：字数 / 章节数 / 角色数（灰色小字）
  - 更新时间（灰色小字）
- hover：阴影 lg，上移 2px 动画

**空状态**：没有项目时显示空状态插图 + "还没有项目，[创建第一个项目]"

#### 5.3.5 新建项目对话框

**触发方式**：点击"新建项目"按钮

**模态框样式**：
- 居中，宽度 520px
- 白色背景，圆角 xl，阴影 lg
- padding: 32px
- 遮罩：半透明黑色，背景色 rgba(0,0,0,0.5)

**表单字段**：
1. 项目名称 — 必填，text input
2. 题材 — 下拉选择
   - 选项：玄幻、仙侠、都市、言情、历史、科幻、悬疑、游戏、竞技、其他
3. 风格 — 下拉选择
   - 选项：默认、轻松、压抑、紧张、欢快
4. 目标总字数 — number input，可选
5. 简介 — textarea，可选
6. 世界观设定 — textarea，可选

**按钮**：
- [取消] 次要按钮（白色背景，边框）
- [创建] 主按钮，全宽

#### 5.3.6 项目概览 (`/book/[id]`)

**URL**: `/book/[id]`

**布局**：Topbar + Sidebar + Main Content

**内容**：
1. 项目基本信息：
   - 标题（text-2xl，#111827）
   - 题材标签 + 状态标签
   - 简介（灰色文字）
2. 统计卡片行（4 张并排）：
   - 总字数：大数字 + 小标题
   - 章节数：大数字 + 小标题
   - 角色数：大数字 + 小标题
   - 大纲节点数：大数字 + 小标题
3. 快捷操作区：
   - [写新章节] 主按钮
   - [管理大纲] 次要按钮
   - [管理角色] 次要按钮
   - [拆书分析] 次要按钮
4. 最近活动列表（可选）

#### 5.3.7 大纲管理页 (`/book/[id]/outlines`)

**URL**: `/book/[id]/outlines`

**布局**：Topbar + Sidebar + Main Content

**左侧面板（40%宽度）**：大纲树
**右侧面板（60%宽度）**：选中节点详情

**大纲树组件 (react-arborist)**：
- 树形结构：卷 → 章 → 节
- 每个节点显示：图标 + 标题 + 状态标签
- 节点图标：
  - 卷：📚 (book-open)
  - 章：📝 (file-text)
  - 节：🔖 (bookmark)
- 节点操作（右键菜单或三点菜单）：
  - 编辑标题（内联编辑）
  - 添加子节点
  - 添加同级节点
  - 删除节点（带确认弹窗）
  - 上移/下移
- 拖拽排序（react-arborist 内置）
- 顶部操作栏：
  - [添加卷] 按钮
  - [AI 生成大纲] 按钮（琥珀色，带 sparkles 图标）
  - [AI 审查大纲] 按钮

**节点详情面板**：
- 标题（可编辑）
- 内容（textarea，支持 Markdown）
- 情节点列表（可添加/删除）
- 目标字数（number input）
- 情绪曲线（下拉选择：上升、下降、起伏、平稳）
- 状态切换：[草稿] [待审查] [已完成]
- [保存] 按钮

**AI 生成大纲对话框**：
- 题材选择
- 风格选择
- 生成长度（短/中/长）
- [生成] 按钮（流式显示生成过程）

**AI 审查大纲结果展示**：
- 总评分（大数字，颜色根据分数：≥85 绿色，70-84 蓝色，<70 红色）
- 每项评分列表
- 改进建议（高亮显示）

#### 5.3.8 角色管理页 (`/book/[id]/characters`)

**URL**: `/book/[id]/characters`

**布局**：Topbar + Sidebar + Main Content

**左侧面板（320px 宽度）**：角色列表
**右侧面板**：角色详情/编辑

**角色列表样式**：
- 每个角色项：头像（圆形，40px，显示名字首字背景色 #6366F1）+ 名字 + 角色类型标签
- 角色类型标签颜色：
  - 主角：红色 #EF4444
  - 配角：蓝色 #3B82F6
  - 反派：紫色 #8B5CF6
  - 路人：灰色 #6B7280
- 顶部：[添加角色] 按钮 + [AI 生成角色] 按钮

**角色详情/编辑表单**：
- 基础信息区（一行两列）：
  - 姓名（text input）
  - 年龄（text input）
  - 性别（下拉）
  - 角色类型（下拉）
- 外貌描述（textarea）
- 性格描述（textarea）
- 背景故事（textarea）
- 核心动机（textarea）
- 成长弧光（可折叠区域）
  - JSON 编辑或结构化表单
- 关系网（可折叠区域）
  - 列表：[角色] - [关系类型] - [亲密度 slider]
- 语音特征（可折叠区域）：
  - 预设语音模板（8种）：下拉选择，选择后自动填充以下字段
  - 正式度（slider 0-1）
  - 平均句长（number input，单位：字）
  - 爱用词（tags 输入）
  - 禁用词（tags 输入）
  - 语气词（tags 输入）
- 底部：[保存] 主按钮

**AI 生成角色对话框**：
- 角色数量（1-5 个）
- 角色类型偏好
- 生成风格
- [生成] 按钮

#### 5.3.9 章节列表页 (`/book/[id]/chapters`)

**URL**: `/book/[id]/chapters`

**布局**：Topbar + Sidebar + Main Content

**内容**：
1. 页面标题："章节管理"
2. [新建章节] 按钮
3. 章节列表（表格形式）

**表格列**：
| 序号 | 标题 | 字数 | 状态 | 评分 | 操作 |
|------|------|------|------|------|------|

**状态标签**：
- 草稿：灰色标签，背景 #F3F4F6，文字 #6B7280
- 待审查：橙色标签，背景 #FFFBEB，文字 #F97316
- 已完成：绿色标签，背景 #F0FDF4，文字 #22C55E

**评分显示**：
- ≥85：绿色数字
- 70-84：蓝色数字
- <70：红色数字
- 未评分："—"

**操作列**：
- [写作] 图标按钮 — 跳转到编辑器
- [审查] 图标按钮 — 触发审查
- [更多] 三点菜单（删除、版本历史等）

#### 5.3.10 写作编辑器页 (`/book/[id]/chapter/[chapterId]`)

**URL**: `/book/[id]/chapter/[chapterId]`

**布局**：全屏写作模式

**页面结构**：
```
┌──────────────────────────────────────────────────────────────┐
│  Topbar（精简版）                                            │
│  返回 | 章节标题 | 字数统计 | [保存] [审查] [...更多]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────── Editor ───────────────────────────────────┐  │
│  │                                                         │  │
│  │  TipTap 富文本编辑器                                    │  │
│  │                                                         │  │
│  │                                                         │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────── AI 侧边栏 (可折叠) ────────────────────┐     │
│  │                                                      │     │
│  │  AI 辅助面板                                         │     │
│  │  ─────────────────                                   │     │
│  │  [AI 续写] [AI 扩写] [AI 压缩]                      │     │
│  │  [去AI味]  [对话优化] [审查评分]                    │     │
│  │                                                      │     │
│  │  字数进度条: ████████░░ 2400/3000                    │     │
│  │                                                      │     │
│  │  生成状态: 空闲 / 生成中...                          │     │
│  └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

**Topbar（精简版）**：
- 左侧：[← 返回] 按钮（文字色 #6B7280，hover #111827）
- 中间：章节标题（text-lg，可编辑）
- 右侧：
  - 字数统计："2,400 / 3,000 字"（灰色小字）
  - [保存] 按钮（主色，仅有关联章节时显示）— 自动保存时显示 "已保存 ✓"
  - 更多菜单：[审查章节] [版本历史] [导出]

**TipTap 编辑器**：
- 高度：calc(100vh - 56px)
- 默认字体：16px，行高 1.8
- padding：48px（左右留白，模拟书本）
- 最大宽度：800px（居中）
- 占位文字："开始写作吧..."
- 工具栏（隐藏/浮动）：
  - 加粗、斜体、标题（H2/H3）
  - 分割线
  - 字数统计

**AI 侧边栏**：
- 宽度：320px
- 可折叠（通过右侧边缘的 tab 触发）
- 背景色：白色，左边框 1px solid #E5E7EB

**AI 侧边栏内容**：
1. **AI 操作按钮组**（竖向排列，每个按钮带图标）：
   - [AI 续写] — 从光标位置继续写（sparkles 图标）
   - [AI 扩写] — 扩写选中段落（expand 图标）
   - [AI 压缩] — 压缩选中段落（shrink 图标）
   - [去AI味] — 检测并去除 AI 腔（wand 图标）
   - [对话优化] — 优化对话口语化（message 图标）
   - [审查评分] — 7维度评分（bar-chart 图标）

   按钮样式：
   - 宽度 100%，高度 40px
   - 背景色 #F8FAFC，边框 1px solid #E5E7EB
   - 文字左对齐，图标在左
   - hover：背景色 #EEF2FF，边框色 #6366F1

2. **字数进度条**：
   - 进度条高度 8px，圆角 full
   - 背景色 #E5E7EB
   - 填充色：#6366F1（正常）/ #F97316（接近上限）/ #EF4444（超出）
   - 下方文字："已达目标字数的 80%"

3. **生成状态区域**：
   - 空闲状态：灰色文字"就绪"
   - 生成中：旋转 spinner + "AI 正在写作..."
   - 完成：绿色文字"生成完成 ✓"

**AI 流式续写效果**：
- 点击 [AI 续写] 后
- 编辑器光标位置插入一个临时的占位符
- AI 文字逐个 token 流式出现在编辑器中（打字机效果）
- 侧边栏显示实时字数统计
- 完成时播放一个轻柔的动画

#### 5.3.11 审查结果展示组件

**触发**：点击 [审查评分] 或章节列表的 [审查]

**模态框样式**：
- 宽度 720px，最大高度 80vh
- 白色背景，圆角 xl，阴影 lg
- 可滚动

**内容**：

1. **总分大数字**（居中）：
   - ≥85：绿色 (#22C55E)，大号字体 (text-5xl)
   - 70-84：蓝色 (#3B82F6)
   - <70：红色 (#EF4444)
   - 下文字："总分"（灰色小字）

2. **判定结果**：
   - 自动通过：绿色徽章 "✓ 自动通过"
   - 基本通过：蓝色徽章 "ⓘ 基本通过，建议修改"
   - 不通过：红色徽章 "✗ 不通过，建议重写"
   - 强制重写：红色徽章 "✗ 强制重写"

3. **雷达图**（使用 canvas 绘制或 SVG）：
   - 7 个维度
   - 每个维度 0-100 分
   - 填充色半透明 #6366F1
   - 边框色 #4F46E5

4. **各维度评分列表**：
   ```
   ┌──────────────────────────────────────────────────────┐
   │  📊 剧情连贯性         85分  ████████████████░░░░  │
   │     问题：第3段提到'上次的事'但前文没有明确铺垫      │
   │     建议：在第1段增加一句交代                        │
   ├──────────────────────────────────────────────────────┤
   │  👤 人设一致性         78分  ██████████████░░░░░░  │
   │     问题：反派李四说话过于文雅，不符合粗人设定       │
   │     建议：将'我'改为'老子'                          │
   └──────────────────────────────────────────────────────┘
   ```
   - 每项背景色：#FAFAFA，圆角 md，padding 16px
   - 分数条：背景色 #E5E7EB，填充色根据分数
   - 问题项前带图标（⚠️ 高、⚡ 中、💡 低）
   - 建议项前带 💡

5. **底部操作**：
   - [关闭] 次要按钮
   - [重新审查] 文字按钮（若分数 < 70 显示）
   - [去修改] 主按钮（若分数 < 70 显示，跳转到编辑器）

#### 5.3.12 拆书分析页 (`/book/[id]/analysis`)

**URL**: `/book/[id]/analysis`

**布局**：Topbar + Sidebar + Main Content

**内容**：
1. **输入区**：
   - 标题输入框："作品名称"（placeholder: "请输入作品名称"）
   - 作者输入框："作者"（可选）
   - 内容输入区域（大 textarea，高度 300px）
     - placeholder: "请粘贴小说内容..."
     - 支持拖拽上传 txt 文件
   - [开始分析] 主按钮（全宽）

2. **分析进行中**（加载状态）：
   - 进度指示器（进度条 + 百分比）
   - 当前分析步骤文字："正在分析结构..." → "正在提取角色..." → "正在分析节奏..." → "完成"

3. **分析结果展示**：
   - 页面标题："《作品名称》拆书报告"
   - **结构分析**（可折叠卡片）：
     - 起承转合分析
     - 章节节奏分析（可视化时间线）
     - 叙事视角分析
   - **角色系统分析**（可折叠卡片）：
     - 角色列表 + 角色类型
     - 角色关系网络（文本描述）
     - 角色成长弧光
   - **爽点分布**（可折叠卡片）：
     - 爽点类型统计（条形图或文字列表）
     - 爽点密度分析
   - **写作技巧提取**（可折叠卡片）：
     - 叙事手法列表
     - 对话特点分析
     - 描写风格总结
   - **创作模板**（可折叠卡片）：
     - 大纲模板
     - 角色模板
     - 节奏模板
   - [生成模板] 主按钮 — 将分析结果转为大纲模板

#### 5.3.13 时间线页 (`/book/[id]/timeline`)

**URL**: `/book/[id]/timeline`

**布局**：Topbar + Sidebar + Main Content

**内容**：
1. **时间线视图**（纵向时间线）：
   - 按 day_number 排序
   - 每个事件显示：
     - 时间标签（"第 X 天"）
     - 事件描述
     - 涉及角色（标签）
     - 地点
     - 季节
     - 关联章节（可点击跳转）
   - 样式：左侧竖线，节点圆点，内容在右侧

2. **角色状态追踪**（侧边栏或下半部分）：
   - 选择角色下拉
   - 显示该角色状态变更历史（表格）：
     | 章节 | 时间 | 位置 | 状态 | 物品/能力 |

### 5.3.14 模型配置页 (`/settings/models`)

**URL**: `/settings/models`

**布局**：Topbar + Main Content（无 Sidebar）

**页面标题**："模型配置"（text-2xl，#111827）

**内容**：

1. **模型配置列表**（表格形式）
   - 每行显示：名称、供应商、模型名、关联场景标签、启用状态、排序
   - 操作列：[编辑] [删除] [测试连接]
   - 顶部：[添加模型] 主按钮

2. **添加/编辑模型表单**（模态框，宽度 600px）
   - 名称（text input，必填）— 用户自定义标识，如"我的 DeepSeek"
   - Base URL（text input，必填）— 例如 `https://api.deepseek.com`
   - API Key（password input，必填）— 明文显示切换（eye 图标）
   - 模型名称（text input，必填）— 例如 `deepseek-chat`
   - 场景选择（checkbox 组）— 列出所有场景标识符，用户勾选该模型负责的场景
   - 启用状态（switch toggle）
   - 底部：[保存] 主按钮 | [取消] 次要按钮

3. **测试连接按钮**
   - 在配置表单内或列表行操作中
   - 点击后调用 API `/api/v1/model-configs/{id}/test`
   - 显示连接结果：成功（绿色 ✓）/ 失败（红色 ✗ + 错误信息）
   - 测试过程中显示加载 spinner

4. **删除确认**（Dialog 组件）
   - 标题："确认删除"
   - 内容："删除后该配置将不可恢复，确定要删除「{name}」吗？"
   - [取消] / [确认删除（红色）]

5. **空状态**：没有配置时显示空状态提示 + "还没有模型配置，[添加第一个模型]"

### 5.4 前端 API 封装

```typescript
// client/src/lib/api/client.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: '请求失败' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// 文件导出
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

### 5.5 Zustand 状态管理

```typescript
// client/src/lib/stores/auth-store.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { id: string; username: string; email: string } | null;
  isLoggedIn: boolean;
  login: (token: string, user: { id: string; username: string; email: string }) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isLoggedIn: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 从 token 解析用户信息或调用 /auth/me
      set({ token, isLoggedIn: true });
    }
  },
}));
```

---

## 6. Step 4：AI 生成功能

### 6.1 多智能体写作管线

写作管线由 4 个 Agent 串联组成，每个 Agent 负责一个阶段，支持独立配置模型：

```
用户点击 [AI续写]
     ↓
Agent 1 (Planner)：分析大纲 + 上下文 → 输出分镜计划
     ↓
Agent 2 (Writer)：按分镜逐段生成正文 → 流式输出给用户
     ↓
Agent 3 (DeAI)：检测AI词、优化语感、确保对话口语化
     ↓
Agent 4 (Proofreader)：检查逻辑漏洞 → 更新角色状态和时间线
     ↓
生成完成
```

#### Agent 1：情节规划 (planner.py)

```python
# server/app/services/generator/planner.py
from app.services.ai.factory import get_client_for_scene


PLANNER_PROMPT = """你是一位专业的网络小说情节规划师。请根据以下信息，为本章制定详细的分镜写作计划。

请将章节分成 3-5 个场景（scene），每个场景包含：
1. 场景标题和功能定位（冲突建立 / 铺垫深化 / 爽点释放 / 过渡衔接 / 悬念收尾）
2. 目标字数（基于总目标合理分配）
3. 主要出场角色
4. 核心情节进展
5. 情感基调（紧张/轻松/压抑/激昂）

输出JSON格式：
{
    "scenes": [
        {
            "scene_index": 1,
            "title": "冲突爆发",
            "function": "冲突建立",
            "target_words": 800,
            "characters": ["张三"],
            "plot": "张三遭遇埋伏...",
            "emotion": "紧张"
        }
    ],
    "total_words": 3000,
    "chapter_theme": "本章核心主题"
}
"""


async def plan_chapter(
    db, user_id: str, chapter_title: str, outline_content: str,
    context: str, word_target: int, book_id: str = None,
) -> list[dict]:
    """调用规划Agent生成场景计划"""
    client = await get_client_for_scene(db, user_id, "chapter_planner", book_id)
    prompt = f"""章节标题：{chapter_title}
大纲内容：{outline_content}
上下文：{context}
目标字数：{word_target}

{PLANNER_PROMPT}"""
    result = await client.chat([{"role": "user", "content": prompt}], temperature=0.7)
    import json
    plan = json.loads(result)
    return plan["scenes"]
```

#### Agent 2：正文写手 (writer.py)

```python
# server/app/services/generator/writer.py
from app.services.ai.factory import get_client_for_scene
from app.services.control.word_count import WordCountController


WRITER_SYSTEM_PROMPT = """你是一位专业的网络小说作家。请根据场景计划撰写正文。

写作要求：
1. 严格按照场景的目标字数写作
2. 角色行为必须符合其性格设定
3. 对话要口语化、自然，不同角色说话方式有区别
4. 用动作和对话表现情绪，不要直接描述"他感到…"
5. 句子长短结合，至少30%短句（10字以内）
6. 对话占比不低于40%
7. 段落短小，每段不超过200字"""


async def write_scene(
    db, user_id: str, scene_plan: dict, context: str,
    book_id: str = None,
) -> str:
    """调用写手Agent生成单个场景正文"""
    client = await get_client_for_scene(db, user_id, "chapter_writer", book_id)

    scene_prompt = f"""== 场景信息 ==
标题：{scene_plan['title']}
功能：{scene_plan.get('function', '')}
目标字数：{scene_plan['target_words']}字
出场角色：{', '.join(scene_plan.get('characters', []))}
情节：{scene_plan.get('plot', '')}
情感基调：{scene_plan.get('emotion', '')}

{context}

请严格按照{scene_plan['target_words']}字左右的篇幅完成本场景的写作。"""

    # 非流式生成（场景级别）
    content = await client.chat([
        {"role": "system", "content": WRITER_SYSTEM_PROMPT},
        {"role": "user", "content": scene_prompt}
    ], temperature=0.8, max_tokens=min(scene_plan['target_words'] * 2, 4096))

    return content


async def write_chapter_stream(
    db, user_id: str, scenes: list[dict], context: str,
    word_target: int, book_id: str = None,
):
    """流式生成所有场景（向客户端SSE推送）"""
    controller = WordCountController(target=word_target)
    full_content = ""

    for i, scene in enumerate(scenes):
        # 生成前通知客户端
        yield {"type": "scene_start", "index": i, "title": scene["title"],
               "target": scene["target_words"]}

        content = await write_scene(db, user_id, scene, context, book_id)
        # 补一个换行分隔场景
        content = f"\n\n{content}\n\n"
        full_content += content

        for char in content:
            ctrl = controller.update(char)
            yield {"type": "content", "text": char}
            if ctrl["action"] == "stop":
                break

        yield {"type": "scene_done", "index": i, "words": len(content)}

    yield {"type": "done", "total_words": len(full_content)}
```

### 6.2 上下文组装器

```python
# server/app/services/context/assembler.py
import json
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.chapter import Chapter
from app.models.outline import Outline
from app.models.character import Character
from app.models.timeline import TimelineEvent


class ContextAssembler:
    """三重上下文组装器"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def assemble_chapter_context(
        self,
        book_id: str,
        chapter_id: str,
        include_prev: int = 5,
        include_timeline: int = 10,
    ) -> str:
        """组装生成章节所需的三重上下文"""
        parts = []

        # 获取当前章节
        result = await self.db.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = result.scalar_one_or_none()
        if not chapter:
            return ""

        # === 第一层：前文摘要 ===
        result = await self.db.execute(
            select(Chapter)
            .where(
                Chapter.book_id == book_id,
                Chapter.sort_order < chapter.sort_order,
                Chapter.status == "done"
            )
            .order_by(Chapter.sort_order.desc())
            .limit(include_prev)
        )
        prev_chapters = result.scalars().all()
        if prev_chapters:
            parts.append("=== 前情提要 ===")
            for c in reversed(prev_chapters):
                summary = c.ai_summary or "（无摘要）"
                parts.append(f"  · 第{c.sort_order}章《{c.title}》：{summary}")

        # === 第二层：大纲节点 ===
        if chapter.outline_id:
            result = await self.db.execute(
                select(Outline).where(Outline.id == chapter.outline_id)
            )
            outline = result.scalar_one_or_none()
            if outline:
                parts.append("\n=== 本章大纲 ===")
                parts.append(f"  标题：{outline.title}")
                if outline.content:
                    parts.append(f"  内容：{outline.content}")
                if outline.plot_points:
                    parts.append(f"  情节点：{json.dumps(outline.plot_points, ensure_ascii=False)}")

        # === 第三层：角色设定 + 语音特征 ===
        if chapter.characters:
            result = await self.db.execute(
                select(Character).where(
                    Character.book_id == book_id,
                    Character.id.in_(chapter.characters)
                )
            )
            characters = result.scalars().all()
            if characters:
                parts.append("\n=== 出场角色 ===")
                for c in characters:
                    fav = "、".join(c.favorite_words) if c.favorite_words else "无"
                    tone = "、".join(c.tone_words) if c.tone_words else "无"
                    parts.append(
                        f"  【{c.name}】（{c.role_type}）\n"
                        f"  性格：{c.personality or '未设定'}\n"
                        f"  说话风格：{c.speech_style}（正式度{c.formality_level}，平均句长{c.avg_sentence_len}字）\n"
                        f"  爱用词：{fav} | 语气词：{tone}"
                    )

        # === 时间线注入 ===
        result = await self.db.execute(
            select(TimelineEvent)
            .where(TimelineEvent.book_id == book_id)
            .order_by(TimelineEvent.day_number.desc())
            .limit(include_timeline)
        )
        events = result.scalars().all()
        if events:
            parts.append("\n=== 当前时间线 ===")
            for e in reversed(events):
                chars = "、".join([str(cid)[:8] for cid in e.involved_chars]) if e.involved_chars else ""
                parts.append(f"  第{e.day_number}天 | {e.event_desc} | 涉及：{chars}")

        return "\n".join(parts)
```

### 6.3 字数控制服务

```python
# server/app/services/control/word_count.py

class WordBudgetAllocator:
    """字数预算分配器"""

    SCENE_WEIGHTS = {
        "战斗": 1.5, "冲突": 1.5, "对决": 1.5, "高潮": 1.5,
        "对话": 1.0, "谈判": 1.0, "商议": 1.0, "日常": 1.0,
        "描写": 0.6, "过渡": 0.5, "回忆": 0.5, "叙述": 0.6,
    }

    def allocate(self, scenes: list[str], total_target: int) -> list[dict]:
        """为每个场景分配字数预算"""
        if not scenes:
            return [{"scene": "全文", "target": total_target}]

        weights = []
        for scene in scenes:
            w = 1.0
            for kw, weight in self.SCENE_WEIGHTS.items():
                if kw in scene:
                    w = weight
                    break
            weights.append(w)

        total_w = sum(weights)
        budgets = []
        remaining = total_target
        for i, scene in enumerate(scenes):
            if i == len(scenes) - 1:
                budgets.append({"scene": scene, "target": max(remaining, 100)})
            else:
                target = max(int(total_target * weights[i] / total_w), 100)
                remaining -= target
                budgets.append({"scene": scene, "target": target})
        return budgets


class WordCountController:
    """流式字数控制器"""

    def __init__(self, target: int, tolerance: float = 0.1):
        self.target = target
        self.min_words = int(target * (1 - tolerance))
        self.max_words = int(target * (1 + tolerance))
        self.current = 0

    def update(self, text_chunk: str) -> dict:
        """更新字数并返回控制指令"""
        self.current += len(text_chunk)

        if self.current >= self.max_words:
            return {"action": "stop", "reason": "超出上限"}

        if self.current >= self.target * 0.95:
            return {
                "action": "inject",
                "prompt": "本章即将结束，请在200字内自然收尾，不要开启新线索或新情节。"
            }

        if self.current >= self.target * 0.85:
            return {
                "action": "inject",
                "prompt": "注意：已接近目标字数，请适当精简描述，尽快收束本段情节。"
            }

        return {"action": "continue"}

    def get_progress(self) -> float:
        return min(self.current / self.target, 1.0) if self.target > 0 else 0
```

### 6.4 去AI味 + 语感评分

```python
# server/app/services/generator/de_ai.py
"""
去AI味 Agent — 多维度检测+改写
位于 generator/ 下，作为多智能体写作管线的 Agent 3
"""

# ==================== 检测词库 ====================

# AI高频词（第1类：转折/总结类）
AI_TURNING_WORDS = [
    "然而", "但是", "不过", "可是", "却",
    "尽管如此", "即便如此", "话虽如此",
]

AI_SUMMARY_WORDS = [
    "值得一提的是", "显而易见", "毫无疑问", "事实上",
    "换句话说", "简而言之", "不可否认", "值得注意的是",
    "总体而言", "从某种角度来说", "在一定程度上",
    "不可忽视的是", "需要指出的是", "不得不承认",
    "平心而论", "客观来说", "坦白说",
]

# AI高频词（第2类：强调/递进类）
AI_EMPHASIS_WORDS = [
    "尤为", "尤为突出", "格外", "愈发",
    "越发", "愈加", "倍加",
    "所谓的", "某种意义上的",
]

# AI句式模式
AI_SENTENCE_STARTS = [
    "这意味", "这表", "这说", "这体现",
    "这反映", "这揭示", "这凸显",
    "正如前文所述", "如前所述",
]

# 心理描写标签
PSYCH_PATTERNS = [
    "他感到", "她感到", "他心里想", "她心里想",
    "他意识到", "她意识到", "他忽然觉得", "她忽然觉得",
    "他明白", "她明白", "他清楚", "她清楚",
    "他察觉", "她察觉", "他感知", "她感知",
    "他心中", "她心中", "他内心", "她内心",
    "他的心里", "她的心里",
]

# "展示vs告知" 扣分模式 — 用告知代替展示
TELL_PATTERNS = [
    "他很生气", "她很开心", "他很伤心", "她很害怕",
    "他很紧张", "他很兴奋", "他很失落", "他很绝望",
    "他很惊讶", "他很尴尬", "他很委屈", "他很愧疚",
    "他非常愤怒", "她非常高兴",
]


def score_flavor(text: str) -> dict:
    """
    网文语感评分（0-100）— 6维度检测
    阈值：≥75 合格，<75 触发自动改写Pass
    """
    score = 100
    details = {}
    total_len = max(len(text), 1)

    # === 1. AI转折词密度（15分） ===
    count1 = sum(text.count(w) for w in AI_TURNING_WORDS)
    count2 = sum(text.count(w) for w in AI_SUMMARY_WORDS)
    ai_word_total = count1 + count2
    expected_max = max(int(total_len / 500 * 2), 1)
    if ai_word_total > expected_max:
        penalty = min(int((ai_word_total - expected_max) * 8), 15)
        score -= penalty
        turning_penalty = penalty
    else:
        turning_penalty = 0
    details["ai_turning_words"] = {"count": ai_word_total, "expected_max": expected_max, "penalty": turning_penalty}

    # === 2. 强调词密度（10分） ===
    emph_count = sum(text.count(w) for w in AI_EMPHASIS_WORDS)
    if emph_count > 3:
        penalty = min(emph_count * 3, 10)
        score -= penalty
        emph_penalty = penalty
    else:
        emph_penalty = 0
    details["emphasis_words"] = {"count": emph_count, "penalty": emph_penalty}

    # === 3. 心理描写密度（15分） ===
    psych_count = sum(text.count(p) for p in PSYCH_PATTERNS)
    if psych_count > 5:
        penalty = min(psych_count * 3, 15)
        score -= penalty
        psych_penalty = penalty
    else:
        psych_penalty = 0
    details["psych_desc"] = {"count": psych_count, "penalty": psych_penalty}

    # === 4. 展示vs告知（15分） ===
    tell_count = sum(text.count(p) for p in TELL_PATTERNS)
    if tell_count > 0:
        penalty = min(tell_count * 5, 15)
        score -= penalty
        tell_penalty = penalty
    else:
        tell_penalty = 0
    details["show_vs_tell"] = {"count": tell_count, "penalty": tell_penalty}

    # === 5. 句式多样性（15分） ===

    # 5a. 短句比例
    separators = "！？。\n"
    sentences = []
    buf = ""
    for ch in text:
        buf += ch
        if ch in separators:
            buf = buf.strip()
            if buf:
                sentences.append(buf)
            buf = ""
    if buf.strip():
        sentences.append(buf.strip())

    short_ratio = 0
    if sentences:
        short_count = sum(1 for s in sentences if len(s) <= 10)
        short_ratio = short_count / len(sentences)
        if short_ratio < 0.25:
            score -= 8
            short_penalty = 8
        elif short_ratio < 0.30:
            score -= 4
            short_penalty = 4
        else:
            short_penalty = 0
    else:
        short_penalty = 0

    # 5b. 句子开头多样性
    if sentences:
        unique_starts = len(set(s[:2] for s in sentences if len(s) >= 2))
        if unique_starts < 5:
            score -= 7
            start_penalty = 7
        else:
            start_penalty = 0
    else:
        start_penalty = 0

    details["sentence_diversity"] = {
        "short_ratio": round(short_ratio, 2),
        "short_penalty": short_penalty,
        "unique_starts": unique_starts if sentences else 0,
        "start_penalty": start_penalty,
    }

    # === 6. 对话占比 + 段落长度（10分） ===
    in_dialogue = False
    dialogue_chars = 0
    for ch in text:
        if ch in '「『""':
            in_dialogue = True
        elif ch in '」』""':
            in_dialogue = False
        elif in_dialogue:
            dialogue_chars += 1
    dialogue_ratio = dialogue_chars / total_len

    dialogue_penalty = 0
    if dialogue_ratio < 0.30:
        dialogue_penalty = 6
        score -= 6
    elif dialogue_ratio < 0.35:
        dialogue_penalty = 3
        score -= 3

    # 段落长度检测
    paragraphs = [p for p in text.split("\n") if p.strip()]
    para_penalty = 0
    if paragraphs:
        avg_para_len = sum(len(p) for p in paragraphs) / len(paragraphs)
        if avg_para_len > 200:
            para_penalty = 4
            score -= 4

    details["paragraph_dialogue"] = {
        "dialogue_ratio": round(dialogue_ratio, 2),
        "dialogue_penalty": dialogue_penalty,
        "avg_para_len": round(avg_para_len, 1) if paragraphs else 0,
        "para_penalty": para_penalty,
    }

    # === 综合 ===
    return {
        "score": max(score, 0),
        "details": details,
        "passed": score >= 75,
        "needs_rewrite": score < 75,
    }


# ==================== AI改写Pass ====================

DE_AI_REWRITE_PROMPT = """你是一位专业的网文编辑，擅长去除AI腔。请对以下文本进行改写，使其读起来像人写的网文。

改写要求：
1. 删除或替换以下AI高频词：然而、但是、值得一提的是、显而易见、毫无疑问、事实上、换句话说、简而言之
2. 将"他感到/她意识到/他心里想"等心理描写标签改为动作或对话表现
   ❌ "他感到非常愤怒"
   ✅ "他一拳砸在桌上，茶杯跳了起来"
3. 增加短句比例，长短句交替使用
4. 确保对话占比不低于40%，使用语气词（啊、嘛、吧、呢）
5. 避免工整的排比句
6. 不同角色说话方式要有区分度
7. 段落不要太长，每段不超过200字

原文：
{text}

请直接输出改写后的文本，不要加任何解释。"""


async def de_ai_process(
    db, user_id: str, text: str, book_id: str = None,
) -> dict:
    """
    去AI味完整流程：评分 → 检测 → 决定是否改写
    返回：{"original": ..., "optimized": ..., "score": ..., "rewritten": bool}
    """
    from app.services.ai.factory import get_client_for_scene

    # 第一步：评分
    score_result = score_flavor(text)

    if score_result["passed"]:
        return {
            "original": text,
            "optimized": text,
            "score": score_result["score"],
            "rewritten": False,
            "details": score_result["details"],
        }

    # 第二步：调用AI改写
    client = await get_client_for_scene(db, user_id, "de_ai", book_id)
    optimized = await client.chat([
        {"role": "system", "content": "你是一位专业的网文编辑，擅长去AI腔。"},
        {"role": "user", "content": DE_AI_REWRITE_PROMPT.format(text=text)},
    ], temperature=0.6)

    # 第三步：改写后再评分
    post_score = score_flavor(optimized)

    return {
        "original": text,
        "optimized": optimized if post_score["passed"] else text,
        "score": post_score["score"],
        "rewritten": True,
        "details": post_score["details"],
    }
```

### 6.5 系统常量定义

```python
# 8种语音特征预设类型
SPEECH_TEMPLATES = {
    "豪爽大侠": {"formality": 0.3, "avg_len": 6,
                 "tone_words": ["哈", "痛快", "兄弟", "来"],
                 "favorite": ["老子", "干", "走", "怕什么"]},
    "文雅书生": {"formality": 0.8, "avg_len": 14,
                 "tone_words": ["矣", "乎", "哉", "也"],
                 "favorite": ["确实", "不过", "依我之见", "然也"]},
    "冷面高手": {"formality": 0.5, "avg_len": 4,
                 "tone_words": [],
                 "favorite": ["嗯", "走吧", "不必", "知道了"]},
    "活泼少女": {"formality": 0.2, "avg_len": 7,
                 "tone_words": ["哎呀", "啦", "耶", "嘛", "哇"],
                 "favorite": ["真的吗", "好好玩", "好耶", "太棒了"]},
    "阴险反派": {"formality": 0.6, "avg_len": 10,
                 "tone_words": ["呵呵", "有意思", "呵呵呵"],
                 "favorite": ["走着瞧", "有趣", "慢慢来", "不着急"]},
    "市井小民": {"formality": 0.2, "avg_len": 6,
                 "tone_words": ["得嘞", "您嘞", "呗", "啊"],
                 "favorite": ["整啥", "可劲儿", "妥妥的", "得令"]},
    "普通":     {"formality": 0.5, "avg_len": 8,
                 "tone_words": ["啊", "呢", "吧", "嘛"],
                 "favorite": [], "forbidden": []},
}

# 12维度评分权重（展开版）
REVIEW_WEIGHTS = {
    # === 故事逻辑组 (30%) ===
    "剧情连贯性":     0.12,  # 与前文逻辑衔接、因果自洽
    "大纲贴合度":     0.10,  # ★NEW: 是否按大纲走，情节是否偏离主线
    "前文引用正确性": 0.08,  # ★NEW: 引用前文事件/数据是否正确

    # === 角色组 (18%) ===
    "人设一致性":     0.10,  # 角色行为、决策符合设定
    "角色情感逻辑":   0.08,  # ★NEW: 情绪变化合理、有足够铺垫

    # === 写作质量组 (26%) ===
    "爽点密度":       0.10,  # 爽点分布合理、类型多样
    "节奏控制":       0.08,  # 张弛有度、段落长短合理
    "对话质量":       0.08,  # 自然度、角色区分度

    # === 去AI味组 (18%) ===
    "去AI味-用词":    0.06,  # ★NEW(分拆): AI高频词密度
    "去AI味-句式":    0.06,  # ★NEW(分拆): 短句比例、句式多样性
    "去AI味-描写手法": 0.06, # ★NEW(分拆): 展示vs告知、心理描写密度

    # === 一致性组 (8%) ===
    "时间线与伏笔":   0.08,  # ★NEW: 时间线正确 + 伏笔有回收
}

# 评分阈值
# 总分 ≥ 85：自动通过
# 70-84：基本通过（附带改进建议）
# 60-69：不通过（建议重写）
# < 60：强制重写
REVIEW_THRESHOLDS = {
    "auto_pass": 85,
    "pass_with_suggestions": 70,
    "suggest_rewrite": 60,
    "force_rewrite": 0,
}
```

---

## 7. Step 5：质量优化系统

### 7.1 对话优化服务

```python
# server/app/services/control/dialogue.py
import json
from app.services.ai.factory import get_client_for_scene


async def optimize_dialogue(
    db,
    user_id: str,
    text: str,
    characters: list[dict],
    scene_type: str = "default",
) -> dict:
    """
    对话优化

    Parameters:
    - text: 包含对话的原文
    - characters: 出场角色列表 [{"name": "...", "speech_style": "...", ...}]
    - scene_type: 场景类型 (private/public/conflict/hierarchy/intimate)

    Returns:
    - {"optimized_text": "...", "score": 85, "issues": [...]}
    """
    # 场景正式度调整
    scene_formality_adjust = {
        "private": -0.3,
        "public": 0.2,
        "conflict": -0.2,
        "hierarchy": 0.3,
        "intimate": -0.4,
        "default": 0,
    }

    adjustment = scene_formality_adjust.get(scene_type, 0)

    char_descs = []
    for c in characters:
        formality = c.get("formality_level", 0.5) + adjustment
        char_descs.append(
            f"{c.get('name')}：{c.get('speech_style', '普通')}风格，"
            f"正式度{formality:.1f}，平均句长{c.get('avg_sentence_len', 8)}字，"
            f"爱用词：{','.join(c.get('favorite_words', []))}，"
            f"禁用词：{','.join(c.get('forbidden_words', []))}"
        )

    prompt = f"""你是一位专业的网文对话编辑。请优化以下文本中的对话部分，使其更口语化、更符合角色特征。

场景类型：{scene_type}（正式度调整：{adjustment:+.1f}）

角色信息：
{chr(10).join(char_descs)}

优化要求：
1. 不同角色的说话方式要有明显区分
2. 使用语气词使对话更自然（啊、嘛、呢、吧、啦等）
3. 句子不要太完整（真实对话常有省略和打断）
4. 角色不能使用其"禁用词"，多使用"爱用词"
5. 根据场景类型调整正式度
6. 用动作描写辅助对话，而不是在对话中解释

待优化文本：
{text}

请输出JSON格式：
{{
    "optimized_text": "优化后的完整文本",
    "score": 85,
    "issues": ["问题1", "问题2"]
}}"""

    client = await get_client_for_scene(db, user_id, "dialogue_optimize")
    result = await client.chat([{"role": "user", "content": prompt}], temperature=0.5)

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {
            "optimized_text": text,
            "score": 0,
            "issues": ["AI响应解析失败，未做优化"]
        }
```

### 7.2 时间线管理

```python
# server/app/services/timeline/manager.py
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.timeline import TimelineEvent, CharStateLog


class TimelineManager:
    """时间线管理"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_event(
        self,
        book_id: str,
        chapter_id: str,
        day_number: int,
        event_desc: str,
        involved_chars: list[str] = None,
        location: str = "",
        season: str = "",
        importance: int = 5,
    ) -> TimelineEvent:
        """添加时间线事件"""
        event = TimelineEvent(
            book_id=book_id,
            chapter_id=chapter_id,
            day_number=day_number,
            event_desc=event_desc,
            involved_chars=involved_chars or [],
            location=location,
            season=season,
            importance=importance,
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def get_timeline(self, book_id: str, limit: int = 50) -> list[TimelineEvent]:
        """获取按时间排序的时间线"""
        result = await self.db.execute(
            select(TimelineEvent)
            .where(TimelineEvent.book_id == book_id)
            .order_by(TimelineEvent.day_number)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_last_day(self, book_id: str) -> int:
        """获取当前故事的最后一天"""
        result = await self.db.execute(
            select(TimelineEvent)
            .where(TimelineEvent.book_id == book_id)
            .order_by(TimelineEvent.day_number.desc())
            .limit(1)
        )
        event = result.scalar_one_or_none()
        return event.day_number if event else 0


class StateTracker:
    """角色状态追踪"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_state(
        self,
        character_id: str,
        chapter_id: str,
        chapter_number: int,
        state_snapshot: dict,
    ) -> CharStateLog:
        """记录角色状态快照"""
        log = CharStateLog(
            character_id=character_id,
            chapter_id=chapter_id,
            chapter_number=chapter_number,
            state_snapshot=state_snapshot,
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_current_state(self, character_id: str) -> dict | None:
        """获取角色最新状态"""
        result = await self.db.execute(
            select(CharStateLog)
            .where(CharStateLog.character_id == character_id)
            .order_by(CharStateLog.chapter_number.desc())
            .limit(1)
        )
        log = result.scalar_one_or_none()
        return log.state_snapshot if log else None

    async def get_state_history(self, character_id: str) -> list[CharStateLog]:
        """获取角色完整状态历史"""
        result = await self.db.execute(
            select(CharStateLog)
            .where(CharStateLog.character_id == character_id)
            .order_by(CharStateLog.chapter_number)
        )
        return result.scalars().all()

    async def check_consistency(
        self,
        character_id: str,
        new_state: dict,
    ) -> list[str]:
        """检查状态变更是否合理"""
        current = await self.get_current_state(character_id)
        if not current:
            return []

        issues = []

        # 检查位置突变
        if "location" in current and "location" in new_state:
            old_loc = current["location"]
            new_loc = new_state["location"]
            if old_loc and new_loc and old_loc != new_loc:
                issues.append(f"位置从'{old_loc}'变为'{new_loc}'，需要确认有合理的移动过程")

        # 检查能力突变
        if "level" in current and "level" in new_state:
            if new_state["level"] > current.get("level", ""):
                issues.append(f"等级从'{current.get('level')}'提升到'{new_state.get('level')}'，需确认有突破契机")

        # 检查年龄异常
        if "age" in current and "age" in new_state:
            age_diff = new_state["age"] - current["age"]
            if age_diff < 0:
                issues.append(f"年龄倒退：{current['age']} → {new_state['age']}")
            elif age_diff > 5:
                issues.append(f"年龄跳跃过大：{current['age']} → {new_state['age']}")

        return issues
```

### 7.3 多智能体审查管线

章节审查由 4 个 Agent 协作完成：

```
用户点击 [审查评分]
     ↓
并行执行3个审查Agent:
  ├── Agent 1 (连贯性审查)
  │    ├── 剧情连贯性
  │    ├── 大纲贴合度★      ← 检测是否偏离主线
  │    └── 前文引用正确性★  ← 检测前文引用错误
  │
  ├── Agent 2 (人设审查)
  │    ├── 人设一致性
  │    ├── 角色情感逻辑★
  │    └── 对话质量
  │
  └── Agent 3 (爽点+去AI味审查)
       ├── 爽点密度
       ├── 节奏控制
       ├── 去AI味-用词       ← 拆分3个子维度
       ├── 去AI味-句式
       └── 去AI味-描写手法
     ↓
  Agent 4 (综合评分)：汇总3个Agent结果 → 12维度加权计算
                           → 判定(≥85通过/70-84建议/<60重写)
                           → 输出详细审查报告
```

- **Agent 1**: `coherence_agent.py` — 专注于剧情逻辑、大纲贴合度、前文引用正确性审查
- **Agent 2**: `character_agent.py` — 专注于角色一致性、角色情感逻辑、对话质量审查
- **Agent 3**: `pleasure_agent.py` — 专注于爽点密度、节奏控制、去AI味用词/句式/描写手法审查
- **Agent 4**: `aggregator.py` — 汇总所有评分，12维度加权计算，按阈值判定，生成审查报告

`chapter_review.py` 编排器负责协调 4 个 Agent 的执行。

```python
# server/app/services/review/coherence_agent.py
"""Agent 1：连贯性审查 — 剧情连贯性 + 大纲贴合度 + 前文引用正确性"""
from app.services.ai.factory import get_client_for_scene


COHERENCE_PROMPT = """你是一位专注审查剧情逻辑的网文编辑。请严格审查以下3个维度：

1. 剧情连贯性（0-100分）：本章与前文的事件衔接是否顺畅？
   - 是否有"凭空出现"的信息或角色？
   - 因果逻辑链条是否完整？
   - 新情节点是否有合理铺垫？

2. 大纲贴合度（0-100分）：本章是否严格按大纲执行？
   - 有没有遗漏大纲中设定的情节点？
   - 有没有擅自添加大纲中没有的主要情节？
   - 如果有偏离，具体偏离了多少？

3. 前文引用正确性（0-100分）：文中引用前文的内容是否正确？
   - 角色提到的"上次的事"是否真实发生过？
   - 世界观规则是否被违反？
   - 角色的知识边界是否正确（不该知道的信息是否出现）？

== 本章大纲 ==
{outline}

== 前情提要 ==
{previous_summaries}

== 角色知识边界 ==
{character_knowledge}

== 待审查章节 ==
{chapter_content}

请输出JSON格式：
{{
    "剧情连贯性": {{"score": 85, "issues": [...], "suggestions": "..."}},
    "大纲贴合度": {{"score": 90, "issues": [...], "suggestions": "..."}},
    "前文引用正确性": {{"score": 80, "issues": [...], "suggestions": "..."}}
}}"""
```

```python
# server/app/services/review/character_agent.py
"""Agent 2：人设审查 — 人设一致性 + 角色情感逻辑 + 对话质量"""
```

```python
# server/app/services/review/pleasure_agent.py
"""Agent 3：爽点审查 — 爽点密度 + 节奏控制 + 去AI味用词/句式/描写手法"""
```

---

## 8. Step 6：拆书分析

### 8.1 拆书分析核心

```python
# server/app/services/analysis/core.py
from app.services.ai.factory import get_client_for_scene


ANALYSIS_PROMPT = """你是一位专业的文学分析师。请对以下小说内容进行全面拆书分析。

分析维度：

1. **结构分析**
   - 总体结构（起承转合/三幕式/其他）
   - 章节节奏（每章的功能和节奏）
   - 叙事视角（第一人称/第三人称/多视角）
   - 时间线结构（顺叙/倒叙/插叙）

2. **角色系统分析**
   - 主要角色清单（主角、配角、反派）
   - 角色关系网络
   - 角色成长弧光

3. **爽点与节奏分析**
   - 爽点类型与分布
   - 节奏控制手法

4. **写作技巧提取**
   - 叙事手法（留白/悬念/铺垫）
   - 对话特点
   - 描写风格
   - 开篇/结尾技巧

5. **可复用模板**
   - 大纲模板（结构框架）
   - 角色模板（人设公式）
   - 节奏模板（爽点布局）

请用结构化JSON格式输出结果。
"""


async def analyze_text(
    db,
    user_id: str,
    source_text: str,
    source_title: str,
    source_author: str = "",
    book_id: str = None,
) -> dict:
    """执行拆书分析"""
    client = await get_client_for_scene(db, user_id, "analysis", book_id)

    messages = [
        {
            "role": "system",
            "content": ANALYSIS_PROMPT
        },
        {
            "role": "user",
            "content": f"作品名称：{source_title}\n作者：{source_author or '未知'}\n\n内容：\n{source_text[:50000]}"
        }
    ]

    result = await client.chat(messages, temperature=0.3, max_tokens=8192)

    import json
    try:
        analysis = json.loads(result)
    except json.JSONDecodeError:
        # 如果AI返回的不是纯JSON，尝试提取JSON部分
        import re
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = {"error": "解析失败", "raw": result}

    return {
        "source_title": source_title,
        "source_author": source_author,
        "structure_analysis": analysis.get("结构分析", analysis.get("structure_analysis", {})),
        "character_analysis": analysis.get("角色系统分析", analysis.get("character_analysis", {})),
        "rhythm_analysis": analysis.get("爽点与节奏分析", analysis.get("rhythm_analysis", {})),
        "techniques": analysis.get("写作技巧提取", analysis.get("techniques", {})),
        "templates": analysis.get("可复用模板", analysis.get("templates", {})),
    }
```

---

## 9. 附录：UI 设计规范

### 9.1 设计原则

1. **专注写作**：所有 UI 围绕"让作者专注写作"设计，减少视觉干扰
2. **信息层级清晰**：大标题、卡片分组、适当的留白
3. **统一的交互反馈**：hover/active/disabled 状态明确
4. **AI 功能可视化**：AI 生成的流式效果、评分可视化（雷达图/进度条）

### 9.2 全局状态样式

```
Loading 状态：
  骨架屏：灰色渐变动画（shimmer effect）
  旋转加载：lucide-react Loader2 图标 + spin 动画
  按钮加载：圆形 spinner + 文字

Empty 状态：
  居中插图 + 提示文字 + 操作引导按钮

Error 状态：
  红色边框提示框 + 错误图标 + 错误描述
  Toast 通知（右上角弹出，自动消失）

Success 状态：
  绿色边框提示框 + 成功图标
  Toast 通知（右上角弹出）

AI 生成中：
  文字逐字出现（打字机效果）
  侧边栏显示进度
  可随时停止生成
```

### 9.3 响应式断点

| 断点 | 宽度 | 说明 |
|------|------|------|
| sm | ≥640px | 平板竖屏 |
| md | ≥768px | 平板横屏 |
| lg | ≥1024px | 桌面 |
| xl | ≥1280px | 大桌面 |
| 2xl | ≥1536px | 超大屏 |

### 9.4 动画规范

```
过渡：
  默认：150ms ease-in-out
  悬浮：200ms ease-out
  进入：300ms ease-out
  离开：200ms ease-in

关键帧动画：
  fadeIn: opacity 0→1, 300ms
  slideUp: translateY(10px)→0, 300ms
  slideInRight: translateX(20px)→0, 200ms
  shimmer: 骨架屏闪烁, 1.5s infinite
  spin: 旋转, 1s linear infinite
  typing: 光标闪烁, 1s step-end infinite
```

### 9.5 组件样式速查

| 组件 | 默认样式 | Hover | Active/选中 | Disabled |
|------|---------|-------|------------|----------|
| 主按钮 | bg-indigo-500 text-white | bg-indigo-600 | ring-2 ring-indigo-300 | bg-gray-300 cursor-not-allowed |
| 次要按钮 | bg-white border border-gray-200 | bg-gray-50 | border-indigo-500 | opacity-50 |
| 文字按钮 | text-gray-500 | text-indigo-500 | text-indigo-600 | opacity-50 |
| 文本输入框 | border border-gray-200 rounded-md | border-gray-300 | border-indigo-500 ring-2 ring-indigo-100 | bg-gray-100 |
| 选择器 | 同文本输入框 | 同文本输入框 | 同文本输入框 | 同文本输入框 |
| 标签/徽章 | px-2 py-0.5 rounded-full text-xs | - | - | - |
| 卡片 | bg-white rounded-lg shadow-sm | shadow-md translate-y-[-2px] | - | - |
| 模态框 | bg-white rounded-xl shadow-xl | - | - | - |
| Toast | bg-gray-900 text-white rounded-lg shadow-lg | - | - | - |
| 进度条 | h-2 bg-gray-200 rounded-full | - | fill:bg-indigo-500 | - |
| 滑块/Slider | h-2 bg-gray-200 rounded-full | - | fill:bg-indigo-500 | - |

### 9.6 常用图标清单

使用 lucide-react 图标库：

| 功能 | 图标名 | 用途 |
|------|--------|------|
| 通用 | Book, FileText, Users, Settings | 导航 |
| AI | Sparkles, Wand2, Brain | AI 功能 |
| 写作 | PenLine, Pencil, Type | 编辑器 |
| 审查 | BarChart3, CheckCircle2, AlertCircle | 评分 |
| 操作 | Plus, Trash2, Edit3, MoreVertical | CRUD |
| 导航 | ChevronLeft, ChevronRight, ChevronDown | 展开/折叠 |
| 状态 | Loader2, Check, X, AlertTriangle | 反馈 |
| 拆书 | Search, BookOpen, Layers | 分析 |
| 时间线 | Clock, Calendar, GitBranch | 时间 |
| 角色 | UserCircle, Users2, Heart | 角色 |