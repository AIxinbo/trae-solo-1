"""视频分析服务"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import log
from app.dao.video_analysis_dao import VideoAnalysisDAO
from app.schemas.schemas import VideoAnalysisRequest, VideoAnalysisResult


class VideoService:
    """视频分析服务"""

    @staticmethod
    async def submit(db: AsyncSession, req: VideoAnalysisRequest) -> VideoAnalysisResult:
        """提交视频分析任务"""
        task_id = str(uuid.uuid4()).replace("-", "")[:32]

        await VideoAnalysisDAO.create(
            db,
            id=task_id,
            match_id=req.match_id or "",
            title=req.title,
            video_url=req.video_url,
            status="pending",
        )

        log.info(f"视频分析任务已提交: {task_id}")

        # 实际场景应异步处理，这里仅返回任务 ID
        return VideoAnalysisResult(task_id=task_id, status="pending")

    @staticmethod
    async def get_status(db: AsyncSession, task_id: str) -> dict:
        """查询任务状态"""
        record = await VideoAnalysisDAO.get(db, task_id)
        if not record:
            return {"error": "任务不存在"}
        return {
            "task_id": record.id,
            "status": record.status,
            "title": record.title,
            "ai_summary": record.ai_summary,
        }
