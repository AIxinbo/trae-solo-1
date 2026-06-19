"""
拆书分析引擎
4个并行分析 Agent：结构分析 → 角色分析 → 节奏/爽点分析 → 写作技巧提取
"""
import json
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ai.client import AIClient
from app.services.ai.factory import get_client_for_scene
from app.services.analysis.prompts import ANALYSIS_TYPES

logger = logging.getLogger(__name__)

MAX_CONTENT_LENGTH = 15000  # 分析文本最大长度


class AnalysisEngine:
    """拆书分析引擎"""

    def __init__(self, db: AsyncSession, user_id: str, book_id: str | None = None):
        self.db = db
        self.user_id = user_id
        self.book_id = book_id

    async def _get_client(self) -> AIClient:
        return await get_client_for_scene(self.db, self.user_id, "analysis", self.book_id)

    async def analyze(self, content: str, source_title: str = "", source_author: str = "") -> dict:
        """
        执行完整拆书分析
        返回: { structure_analysis, character_analysis, rhythm_analysis, techniques }
        """
        # 截断过长文本
        if len(content) > MAX_CONTENT_LENGTH:
            content = content[:MAX_CONTENT_LENGTH]
            logger.info(f"Analysis content truncated to {MAX_CONTENT_LENGTH} chars")

        client = await self._get_client()

        # 4个并行分析 Agent
        logger.info("[Analysis] 4个并行分析 Agent 启动中...")
        results = await asyncio.gather(
            self._run_analysis(client, "structure", content),
            self._run_analysis(client, "character", content),
            self._run_analysis(client, "rhythm", content),
            self._run_analysis(client, "techniques", content),
            return_exceptions=True,
        )

        structure = self._safe_parse(results[0], {"overall_structure": {}, "chapter_analysis": {}, "plot_design": {}})
        character = self._safe_parse(results[1], {"characters": [], "relationship_map": {}, "dialogue_techniques": {}})
        rhythm = self._safe_parse(results[2], {"rhythm_analysis": {}, "pleasure_points": {}, "hook_techniques": {}})
        techniques = self._safe_parse(results[3], {"writing_techniques": {}, "reusable_templates": [], "language_style": {}})

        return {
            "source_title": source_title,
            "source_author": source_author,
            "structure_analysis": structure,
            "character_analysis": character,
            "rhythm_analysis": rhythm,
            "techniques": techniques,
        }

    async def _run_analysis(
        self, client: AIClient, analysis_type: str, content: str
    ) -> dict:
        """运行单个分析 Agent"""
        prompt = ANALYSIS_TYPES.get(analysis_type, "")
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"请分析以下小说文本：\n\n{content}"},
        ]
        resp = await client.chat(messages, temperature=0.5, max_tokens=4096)
        return self._parse_json(resp)

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
    def _safe_parse(result, default: dict) -> dict:
        """安全解析分析结果"""
        if isinstance(result, Exception):
            logger.warning(f"Analysis agent error: {result}")
            return default
        if not isinstance(result, dict):
            return default
        return result