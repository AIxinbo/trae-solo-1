"""球员分析服务"""
from app.schemas.schemas import PlayerAnalysisRequest, PlayerAnalysisResponse


class PlayerService:
    """球员分析服务"""

    @staticmethod
    async def analyze(req: PlayerAnalysisRequest) -> PlayerAnalysisResponse:
        """分析球员"""
        # 模拟数据（实际从数据库查询）
        return PlayerAnalysisResponse(
            player_id=req.player_id,
            player_name="张志远",
            rating_trend=[7.8, 8.0, 7.5, 8.2, 8.5],
            strength=["门前嗅觉", "头球争顶", "跑位意识"],
            weakness=["回防积极性", "长传精度"],
            recommendation="建议在下一场比赛中继续担任首发中锋，注意加强回防参与度。",
        )
