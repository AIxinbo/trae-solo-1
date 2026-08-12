"""核心配置"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置，从环境变量读取"""

    # 应用
    app_name: str = "football-ai"
    app_version: str = "0.1.0"
    debug: bool = True

    # 数据库
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "football"
    db_pass: str = "football@2026"
    db_name: str = "football_db"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_pass: str = "redis@2026"

    # Milvus
    milvus_host: str = "localhost"
    milvus_port: int = 19530

    # Java 后端
    backend_url: str = "http://localhost:8080"

    # LLM
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_pass}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def redis_url(self) -> str:
        return f"redis://:{self.redis_pass}@{self.redis_host}:{self.redis_port}/0"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
