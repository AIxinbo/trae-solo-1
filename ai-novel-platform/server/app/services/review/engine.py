"""
多智能体审查引擎
管线: 3个并行审查 Agent (连贯性/人设/写作质量) → 综合评分 Agent
"""
import json
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.ai.client import AIClient
from app.services.ai.factory import get_client_for_scene
from app.services.review.prompts import (
    COHERENCE_REVIEW_PROMPT,
    CHARACTER_REVIEW_PROMPT,
    WRITING_QUALITY_REVIEW_PROMPT,
    SYNTHESIS_REVIEW_PROMPT,
    DIMENSION_WEIGHTS,
    DIMENSION_GROUPS,
)
from app.services.context.assembler import ContextAssembler
from app.models.chapter import Chapter

logger = logging.getLogger(__name__)


class ReviewEngine:
    """多智能体审查管线"""

    def __init__(self, db: AsyncSession, user_id: str, book_id: str, chapter_id: str):
        self.db = db
        self.user_id = user_id
        self.book_id = book_id
        self.chapter_id = chapter_id
        self.assembler = ContextAssembler(db, book_id, chapter_id)

    async def _get_client(self, scene: str = "review") -> AIClient:
        return await get_client_for_scene(self.db, self.user_id, scene, self.book_id)

    async def review(self) -> dict:
        """
        执行完整审查管线
        返回: { overall_score, passed, rewrite_required, dimensions, priority_issues, summary }
        """
        # 获取上下文
        context = await self.assembler.assemble()

        # 获取章节内容
        result = await self.db.execute(
            select(Chapter).where(Chapter.id == self.chapter_id)
        )
        chapter = result.scalar_one_or_none()
        if not chapter or not chapter.content:
            return {
                "overall_score": 0,
                "passed": False,
                "rewrite_required": False,
                "dimensions": {},
                "priority_issues": [{"severity": "high", "description": "章节无内容，无法审查"}],
                "summary": "章节内容为空",
            }

        content = chapter.content

        # Step 1: 并行审查（3个Agent同时运行）
        logger.info("[Review] Step 1/2: 并行审查中...")
        client = await self._get_client()

        results = await asyncio.gather(
            self._review_coherence(client, content, context),
            self._review_character(client, content, context),
            self._review_writing_quality(client, content),
            return_exceptions=True,
        )

        coherence_result = self._safe_result(results[0], DIMENSION_GROUPS["coherence"])
        character_result = self._safe_result(results[1], DIMENSION_GROUPS["character"])
        writing_result = self._safe_result(results[2], DIMENSION_GROUPS["writing_quality"])

        # 合并所有维度结果
        all_dimensions = {}
        all_dimensions.update(coherence_result)
        all_dimensions.update(character_result)
        all_dimensions.update(writing_result)

        # Step 2: 综合评分
        logger.info("[Review] Step 2/2: 综合评分中...")
        synthesis = await self._review_synthesis(client, all_dimensions)

        return synthesis

    async def _review_coherence(
        self, client: AIClient, content: str, context: dict
    ) -> dict:
        """审查故事逻辑与连贯性"""
        previous_summary = context.get("previous_chapters", "暂无前文")
        prompt = COHERENCE_REVIEW_PROMPT.format(previous_summary=previous_summary)

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"请审查以下章节内容：\n\n{content[:8000]}"},
        ]
        resp = await client.chat(messages, temperature=0.3, max_tokens=2048)
        return self._parse_json(resp)

    async def _review_character(
        self, client: AIClient, content: str, context: dict
    ) -> dict:
        """审查角色与对话"""
        character_cards = context.get("characters", "暂无角色设定")
        prompt = CHARACTER_REVIEW_PROMPT.format(character_cards=character_cards)

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"请审查以下章节内容：\n\n{content[:8000]}"},
        ]
        resp = await client.chat(messages, temperature=0.3, max_tokens=2048)
        return self._parse_json(resp)

    async def _review_writing_quality(
        self, client: AIClient, content: str
    ) -> dict:
        """审查写作质量与去AI味"""
        messages = [
            {"role": "system", "content": WRITING_QUALITY_REVIEW_PROMPT},
            {"role": "user", "content": f"请审查以下章节内容：\n\n{content[:8000]}"},
        ]
        resp = await client.chat(messages, temperature=0.3, max_tokens=2048)
        return self._parse_json(resp)

    async def _review_synthesis(
        self, client: AIClient, dimensions: dict
    ) -> dict:
        """综合评分"""
        results_str = json.dumps(dimensions, ensure_ascii=False, indent=2)
        prompt = SYNTHESIS_REVIEW_PROMPT.format(review_results=results_str)

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "请根据以上各维度审查结果，给出综合评分和最终建议。"},
        ]
        resp = await client.chat(messages, temperature=0.3, max_tokens=2048)
        result = self._parse_json(resp)

        # 如果 AI 综合评分失败，手动计算
        if "overall_score" not in result or result["overall_score"] == 0:
            result = self._manual_synthesis(dimensions)

        return result

    def _manual_synthesis(self, dimensions: dict) -> dict:
        """手动计算综合评分（当 AI 综合评分失败时的兜底方案）"""
        total_weight = 0
        weighted_sum = 0
        priority_issues = []

        for dim_key, weight in DIMENSION_WEIGHTS.items():
            if dim_key in dimensions:
                dim_data = dimensions[dim_key]
                score = dim_data.get("score", 70)
                weighted_sum += score * weight
                total_weight += weight

                # 收集严重问题
                for issue in dim_data.get("issues", []):
                    if issue.get("severity") == "high":
                        priority_issues.append({
                            "severity": "high",
                            "dimension": dim_key,
                            "description": issue.get("description", ""),
                            "suggestion": dim_data.get("suggestions", ""),
                        })

        overall_score = round(weighted_sum / total_weight) if total_weight > 0 else 70
        passed = overall_score >= 70
        rewrite_required = overall_score < 60 or any(
            dimensions.get(dim, {}).get("score", 100) < 40
            for dim in DIMENSION_WEIGHTS
        )

        # 限制优先问题数量
        priority_issues = priority_issues[:5]

        return {
            "overall_score": overall_score,
            "passed": passed,
            "rewrite_required": rewrite_required,
            "dimension_scores": dimensions,
            "priority_issues": priority_issues,
            "summary": f"综合评分 {overall_score} 分，{'通过' if passed else '需要修改'}" + (
                "，建议重写" if rewrite_required else ""
            ),
        }

    @staticmethod
    def _parse_json(text: str) -> dict:
        """从 AI 回复中提取 JSON"""
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            if end > start:
                text = text[start:end].strip()
        elif "```" in text:
            start = text.find("```") + 3
            end = text.find("```", start)
            if end > start:
                text = text[start:end].strip()
        else:
            brace_start = text.find("{")
            brace_end = text.rfind("}")
            if brace_start >= 0 and brace_end > brace_start:
                text = text[brace_start:brace_end + 1]

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {}

    @staticmethod
    def _safe_result(result, dim_keys: list[str]) -> dict:
        """安全地获取审查结果，如果失败则返回默认值"""
        if isinstance(result, Exception):
            logger.warning(f"审查 Agent 异常: {result}")
            return {k: {"score": 70, "issues": [], "suggestions": "审查异常，使用默认评分"} for k in dim_keys}
        if not isinstance(result, dict):
            return {k: {"score": 70, "issues": [], "suggestions": "审查结果格式异常"} for k in dim_keys}
        # 确保所有维度都有值
        for key in dim_keys:
            if key not in result:
                result[key] = {"score": 70, "issues": [], "suggestions": "该维度审查未返回结果"}
        return result