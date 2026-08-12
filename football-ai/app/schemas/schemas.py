"""Pydantic 数据模型"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


# ============================================================
# 通用响应
# ============================================================
class ApiResponse(BaseModel):
    """统一响应"""
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None


# ============================================================
# AI 对话
# ============================================================
class ChatMessage(BaseModel):
    """对话消息"""
    role: str = Field(..., description="角色: user/assistant")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    """对话请求"""
    session_id: str = Field(default="", description="会话 ID")
    message: str = Field(..., min_length=1, description="用户消息")
    context: Optional[list[ChatMessage]] = Field(default=[], description="上下文")


class ChatResponse(BaseModel):
    """对话响应"""
    session_id: str
    reply: str
    suggestions: list[str] = Field(default=[], description="建议问题")
    tokens: int = 0


# ============================================================
# 战术分析
# ============================================================
class TacticsAnalysisRequest(BaseModel):
    """战术分析请求"""
    formation: str = Field(..., description="阵型，如 4-3-3")
    opponent: Optional[str] = Field(default="", description="对手")
    match_data: Optional[dict] = Field(default={}, description="比赛数据")


class TacticsSuggestion(BaseModel):
    """战术建议"""
    category: str = Field(..., description="类别: attack/defense/midfield")
    priority: str = Field(..., description="优先级: high/medium/low")
    suggestion: str
    reason: str


class TacticsAnalysisResponse(BaseModel):
    """战术分析响应"""
    formation: str
    overall_score: float
    suggestions: list[TacticsSuggestion]
    key_players: list[dict] = []


# ============================================================
# 球员分析
# ============================================================
class PlayerAnalysisRequest(BaseModel):
    """球员分析请求"""
    player_id: str
    match_count: int = Field(default=5, ge=1, le=20)


class PlayerAnalysisResponse(BaseModel):
    """球员分析响应"""
    player_id: str
    player_name: str
    rating_trend: list[float]
    strength: list[str]
    weakness: list[str]
    recommendation: str


# ============================================================
# 视频分析
# ============================================================
class VideoAnalysisRequest(BaseModel):
    """视频分析请求"""
    video_url: str
    match_id: Optional[str] = ""
    title: str


class VideoAnalysisResult(BaseModel):
    """视频分析结果"""
    task_id: str
    status: str = "pending"
