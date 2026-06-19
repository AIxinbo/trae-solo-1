"""根据用户配置，为指定场景动态创建 AI 客户端"""
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