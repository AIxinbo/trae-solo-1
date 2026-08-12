"""战术分析服务"""
from app.core.logging import log
from app.schemas.schemas import (
    TacticsAnalysisRequest,
    TacticsAnalysisResponse,
    TacticsSuggestion,
)


class TacticsService:
    """战术分析服务"""

    # 阵型基础评分
    FORMATION_SCORES = {
        "4-3-3": 85.0,
        "4-2-3-1": 83.5,
        "3-5-2": 82.0,
        "4-4-2": 81.5,
        "5-3-2": 80.0,
        "3-4-3": 84.0,
    }

    @staticmethod
    async def analyze(req: TacticsAnalysisRequest) -> TacticsAnalysisResponse:
        """分析阵型并给出建议"""
        log.info(f"分析阵型: {req.formation}, 对手: {req.opponent}")

        base_score = TacticsService.FORMATION_SCORES.get(req.formation, 80.0)
        # 根据比赛数据微调
        if req.match_data:
            possession = req.match_data.get("possession", 50)
            if possession > 55:
                base_score += 2
            elif possession < 45:
                base_score -= 2

        suggestions = TacticsService._generate_suggestions(req.formation, req.opponent)
        key_players = TacticsService._get_key_players(req.formation)

        return TacticsAnalysisResponse(
            formation=req.formation,
            overall_score=round(base_score, 1),
            suggestions=suggestions,
            key_players=key_players,
        )

    @staticmethod
    def _generate_suggestions(formation: str, opponent: str) -> list[TacticsSuggestion]:
        """生成战术建议"""
        suggestions_map = {
            "4-3-3": [
                TacticsSuggestion(
                    category="attack",
                    priority="high",
                    suggestion="加强右路传中，禁区内增加包抄点",
                    reason="右路传中成功率仅 23%，需要更多人手支援",
                ),
                TacticsSuggestion(
                    category="midfield",
                    priority="medium",
                    suggestion="围绕 #10 号球员组织进攻",
                    reason="其跑动覆盖率全场最高，关键传球 4 次",
                ),
                TacticsSuggestion(
                    category="defense",
                    priority="high",
                    suggestion="高位压迫时注意防线身后空当",
                    reason="对方有快速反击能力，需保持防线紧凑",
                ),
            ],
            "4-2-3-1": [
                TacticsSuggestion(
                    category="attack",
                    priority="high",
                    suggestion="单前锋需要边路内切支援",
                    reason="#9 号易被对方双人包夹",
                ),
                TacticsSuggestion(
                    category="defense",
                    priority="medium",
                    suggestion="双后腰可适度前压，增加中场控制",
                    reason="中路防守稳固",
                ),
            ],
            "3-5-2": [
                TacticsSuggestion(
                    category="attack",
                    priority="high",
                    suggestion="边翼卫插上后中卫需拉边补位",
                    reason="边翼卫插上留出空当",
                ),
                TacticsSuggestion(
                    category="attack",
                    priority="medium",
                    suggestion="双前锋可形成 2v2 优势，加强直塞球",
                    reason="双前锋配合默契",
                ),
            ],
            "4-4-2": [
                TacticsSuggestion(
                    category="defense",
                    priority="high",
                    suggestion="两条平行防线之间空当需后腰回撤保护",
                    reason="平行防线之间空当较大",
                ),
                TacticsSuggestion(
                    category="attack",
                    priority="medium",
                    suggestion="双前锋尝试斜插跑动撕开防线",
                    reason="对方防线站位靠前",
                ),
            ],
        }
        return suggestions_map.get(formation, suggestions_map["4-3-3"])

    @staticmethod
    def _get_key_players(formation: str) -> list[dict]:
        """获取关键球员"""
        return [
            {"no": "10", "name": "李明轩", "pos": "CAM", "rating": 8.5, "reason": "核心组织者"},
            {"no": "9", "name": "张志远", "pos": "ST", "rating": 8.2, "reason": "主要得分手"},
            {"no": "6", "name": "周凯", "pos": "DM", "rating": 7.9, "reason": "防守枢纽"},
        ]
