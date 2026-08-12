# football-ai

数智绿茵 AI 服务（Python FastAPI）

## 技术栈

- **Python 3.11** + **FastAPI 0.115**
- **SQLAlchemy 2.0** (async) - ORM
- **asyncpg** - PostgreSQL 异步驱动
- **Redis 5.1** - 缓存
- **PyMilvus 2.4** - 向量数据库
- **OpenAI** - LLM 对话
- **Pydantic 2.9** - 数据校验
- **Loguru** - 日志

## 分层架构

```
app/
├── main.py                          # FastAPI 入口（顶层）
├── core/                            # 核心配置
│   ├── config.py                    # Settings 配置
│   ├── database.py                  # 数据库连接
│   └── logging.py                   # 日志配置
├── api/                             # 路由层
│   ├── router.py                    # 路由汇总
│   ├── chat.py                      # AI 对话
│   ├── tactics.py                   # 战术分析
│   ├── players.py                   # 球员分析
│   └── video.py                     # 视频分析
├── services/                        # 业务逻辑层
│   ├── chat_service.py
│   ├── tactics_service.py
│   ├── player_service.py
│   └── video_service.py
├── dao/                             # 数据访问层
│   ├── chat_history_dao.py
│   └── video_analysis_dao.py
├── models/                          # ORM 模型
│   └── entities.py
└── schemas/                         # Pydantic 数据模型
    └── schemas.py
```

## API 端点

所有接口前缀：`/api/v1/ai`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/ai/chat` | AI 对话 |
| POST | `/api/v1/ai/tactics/analyze` | 战术分析 |
| POST | `/api/v1/ai/players/analyze` | 球员分析 |
| POST | `/api/v1/ai/video/analyze` | 提交视频分析 |
| GET | `/api/v1/ai/video/status/{task_id}` | 查询视频分析状态 |
| GET | `/health` | 健康检查 |
| GET | `/docs` | API 文档 |

## 本地开发

```bash
cd football-ai
cp .env.example .env

# 启动
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
