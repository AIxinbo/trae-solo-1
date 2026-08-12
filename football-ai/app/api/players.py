"""球员分析路由"""
from fastapi import APIRouter
from app.schemas.schemas import ApiResponse, PlayerAnalysisRequest, PlayerAnalysisResponse
from app.services.player_service import PlayerService

router = APIRouter(prefix="/players", tags=["球员分析"])


@router.post("/analyze", response_model=ApiResponse)
async def analyze(req: PlayerAnalysisRequest):
    """分析球员"""
    result = await PlayerService.analyze(req)
    return ApiResponse(data=result)
