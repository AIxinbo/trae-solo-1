from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.books import router as books_router
from app.api.outlines import router as outlines_router
from app.api.detailed_outlines import router as detailed_outlines_router
from app.api.characters import router as characters_router
from app.api.chapters import router as chapters_router
from app.api.review import router as review_router
from app.api.analysis import router as analysis_router
from app.api.timeline import router as timeline_router
from app.api.model_config import router as model_config_router
from app.api.writing_logs import router as writing_logs_router
from app.api.generate import router as generate_router

api_router = APIRouter()

# 认证
api_router.include_router(auth_router, prefix="/auth", tags=["认证"])

# 项目管理
api_router.include_router(books_router, prefix="/books", tags=["项目管理"])

# 大纲
api_router.include_router(outlines_router, prefix="/books", tags=["大纲管理"])

# 细纲
api_router.include_router(detailed_outlines_router, prefix="/books", tags=["细纲管理"])

# 角色
api_router.include_router(characters_router, prefix="/books", tags=["角色管理"])

# 章节
api_router.include_router(chapters_router, prefix="/books", tags=["章节管理"])

# 审查
api_router.include_router(review_router, prefix="/books", tags=["审查评分"])

# 拆书分析
api_router.include_router(analysis_router, prefix="/books", tags=["拆书分析"])

# 时间线
api_router.include_router(timeline_router, prefix="/books", tags=["时间线"])

# 模型配置
api_router.include_router(model_config_router, prefix="/user", tags=["模型配置"])

# 写作日志
api_router.include_router(writing_logs_router, prefix="/books", tags=["写作日志"])

# AI 生成
api_router.include_router(generate_router, prefix="/books", tags=["AI生成"])