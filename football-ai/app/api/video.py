"""视频分析路由"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import ApiResponse, VideoAnalysisRequest, VideoAnalysisResult
from app.services.video_service import VideoService

router = APIRouter(prefix="/video", tags=["视频分析"])


@router.post("/analyze", response_model=ApiResponse)
async def submit(req: VideoAnalysisRequest, db: AsyncSession = Depends(get_db)):
    """提交视频分析任务"""
    result = await VideoService.submit(db, req)
    return ApiResponse(data=result)


@router.get("/status/{task_id}", response_model=ApiResponse)
async def status(task_id: str, db: AsyncSession = Depends(get_db)):
    """查询视频分析任务状态"""
    result = await VideoService.get_status(db, task_id)
    return ApiResponse(data=result)
