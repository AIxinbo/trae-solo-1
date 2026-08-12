"""战术分析路由"""
from fastapi import APIRouter
from app.schemas.schemas import ApiResponse, TacticsAnalysisRequest, TacticsAnalysisResponse
from app.services.tactics_service import TacticsService

router = APIRouter(prefix="/tactics", tags=["战术分析"])


@router.post("/analyze", response_model=ApiResponse)
async def analyze(req: TacticsAnalysisRequest):
    """分析阵型并给出战术建议"""
    result = await TacticsService.analyze(req)
    return ApiResponse(data=result)
