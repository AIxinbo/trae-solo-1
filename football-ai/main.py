"""数智绿茵 AI 服务启动入口"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import log
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """生命周期：启动与关闭"""
    log.info(f"{settings.app_name} v{settings.app_version} 启动中...")
    log.info(f"数据库: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    log.info(f"Redis: {settings.redis_host}:{settings.redis_port}")
    log.info(f"Milvus: {settings.milvus_host}:{settings.milvus_port}")
    log.info(f"后端: {settings.backend_url}")
    log.info(f"LLM: {'已配置' if settings.openai_api_key else '未配置（使用规则降级）'}")
    log.info(f"{settings.app_name} 启动完成")
    yield
    log.info(f"{settings.app_name} 关闭")


app = FastAPI(
    title="数智绿茵 AI 服务",
    description="足球战术 AI 分析、对话参谋、视频分析",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(api_router, prefix="/api/v1/ai")


@app.get("/health", tags=["健康检查"])
async def health():
    """健康检查"""
    return {
        "status": "UP",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/", tags=["默认"])
async def root():
    """根路径"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }
