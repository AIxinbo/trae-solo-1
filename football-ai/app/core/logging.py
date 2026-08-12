"""日志配置"""
import sys
from loguru import logger
from app.core.config import settings


def setup_logging():
    """初始化日志"""
    logger.remove()
    logger.add(
        sys.stdout,
        level="DEBUG" if settings.debug else "INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
               "{message}",
        colorize=True,
    )
    logger.add(
        "logs/ai_{time:YYYYMMDD}.log",
        rotation="00:00",
        retention="30 days",
        level="INFO",
        encoding="utf-8",
    )
    return logger


log = setup_logging()
