"""
多智能体写作管线引擎
管线: Planner(规划) → Writer(写作) → DeAI(去AI味) → Proofreader(校对)
"""
import json
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ai.client import AIClient
from app.services.ai.factory import get_client_for_scene
from app.services.ai.prompts import (
    PLANNER_SYSTEM_PROMPT,
    WRITER_SYSTEM_PROMPT,
    DEAI_SYSTEM_PROMPT,
    PROOFREADER_SYSTEM_PROMPT,
    OUTLINE_GENERATOR_PROMPT,
    CHARACTER_GENERATOR_PROMPT,
)
from app.services.context.assembler import ContextAssembler

logger = logging.getLogger(__name__)


class GenerationEngine:
    """多智能体写作管线"""

    def __init__(self, db: AsyncSession, user_id: str, book_id: str, chapter_id: str | None = None):
        self.db = db
        self.user_id = user_id
        self.book_id = book_id
        self.chapter_id = chapter_id
        self.assembler = ContextAssembler(db, book_id, chapter_id)

    async def _get_client(self, scene: str) -> AIClient:
        return await get_client_for_scene(self.db, self.user_id, scene, self.book_id)

    # ================================================================
    # 章节生成管线
    # ================================================================

    async def generate_chapter(self, target_words: int = 2000) -> dict:
        """
        完整多智能体管线：Planner → Writer → DeAI → Proofreader
        返回: { "content": str, "plan": dict, "deai_diff": str, "final_words": int }
        """
        context = await self.assembler.assemble()

        # Step 1: Planner 规划
        logger.info(f"[Pipeline] Step 1/4: Planner 规划中...")
        planner = await self._get_client("planning")
        plan = await self._run_planner(planner, context, target_words)

        # Step 2: Writer 写作
        logger.info(f"[Pipeline] Step 2/4: Writer 写作中...")
        writer = await self._get_client("writing")
        draft = await self._run_writer(writer, context, plan, target_words)

        # Step 3: DeAI 去AI味
        logger.info(f"[Pipeline] Step 3/4: DeAI 去AI味处理中...")
        deai = await self._get_client("deai")
        deai_result = await self._run_deai(deai, draft)

        # Step 4: Proofreader 校对
        logger.info(f"[Pipeline] Step 4/4: Proofreader 校对中...")
        proofreader = await self._get_client("proofread")
        final = await self._run_proofreader(proofreader, deai_result)

        return {
            "content": final,
            "plan": plan,
            "deai_diff": f"去AI味前后字数变化: {len(draft)} → {len(deai_result)}",
            "final_words": len(final),
        }

    async def generate_chapter_stream(
        self, target_words: int = 2000
    ) -> AsyncGenerator[dict, None]:
        """流式生成章节，实时返回各阶段状态"""
        context = await self.assembler.assemble()

        # Step 1: Planner
        yield {"stage": "planning", "message": "正在规划章节结构..."}
        planner = await self._get_client("planning")
        plan = await self._run_planner(planner, context, target_words)
        yield {"stage": "planning_done", "plan": plan}

        # Step 2: Writer (流式)
        yield {"stage": "writing", "message": "AI 正在创作正文..."}
        writer = await self._get_client("writing")
        draft = await self._run_writer(writer, context, plan, target_words)
        yield {"stage": "writing_done", "draft_preview": draft[:200]}

        # Step 3: DeAI
        yield {"stage": "deai", "message": "正在去除AI味..."}
        deai = await self._get_client("deai")
        deai_result = await self._run_deai(deai, draft)
        yield {"stage": "deai_done", "words_before": len(draft), "words_after": len(deai_result)}

        # Step 4: Proofreader
        yield {"stage": "proofreading", "message": "正在校对..."}
        proofreader = await self._get_client("proofread")
        final = await self._run_proofreader(proofreader, deai_result)

        yield {
            "stage": "done",
            "content": final,
            "plan": plan,
            "final_words": len(final),
        }

    async def _run_planner(self, client: AIClient, context: dict, target_words: int) -> dict:
        """运行 Planner Agent"""
        user_msg = self.assembler.build_user_message("write_chapter", context, {
            "target_words": target_words,
        })
        messages = [
            {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]
        try:
            resp = await client.chat(messages, temperature=0.5, max_tokens=2048)
            # 提取 JSON
            json_str = self._extract_json(resp)
            return json.loads(json_str)
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Planner JSON 解析失败: {e}，使用默认规划")
            return {
                "chapter_title": "",
                "scene_plan": [{
                    "scene_index": 1,
                    "summary": "主线场景",
                    "emotion_tone": "平",
                    "pov_character": "",
                    "key_beats": ["开场", "发展", "结尾"],
                    "word_count_ratio": 1.0,
                }],
                "writing_notes": "按大纲推进",
                "pleasure_points": [],
            }

    async def _run_writer(
        self, client: AIClient, context: dict, plan: dict, target_words: int
    ) -> str:
        """运行 Writer Agent"""
        user_msg = self.assembler.build_user_message("write_chapter", context, {
            "plan": json.dumps(plan, ensure_ascii=False, indent=2),
            "target_words": target_words,
        })
        messages = [
            {"role": "system", "content": WRITER_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]
        return await client.chat(messages, temperature=0.8, max_tokens=8192)

    async def _run_deai(self, client: AIClient, content: str) -> str:
        """运行 DeAI Agent"""
        messages = [
            {"role": "system", "content": DEAI_SYSTEM_PROMPT},
            {"role": "user", "content": f"请对以下文本进行去AI味处理：\n\n{content}"},
        ]
        return await client.chat(messages, temperature=0.4, max_tokens=8192)

    async def _run_proofreader(self, client: AIClient, content: str) -> str:
        """运行 Proofreader Agent"""
        messages = [
            {"role": "system", "content": PROOFREADER_SYSTEM_PROMPT},
            {"role": "user", "content": f"请校对以下文本：\n\n{content}"},
        ]
        return await client.chat(messages, temperature=0.2, max_tokens=8192)

    # ================================================================
    # 大纲生成
    # ================================================================

    async def generate_outline(self) -> dict:
        """生成完整大纲"""
        context = await self.assembler.assemble()
        client = await self._get_client("planning")

        messages = [
            {"role": "system", "content": OUTLINE_GENERATOR_PROMPT.format(
                book_info=context.get("book_info", "")
            )},
            {"role": "user", "content": "请根据以上作品信息，生成完整的章节大纲。"},
        ]
        resp = await client.chat(messages, temperature=0.7, max_tokens=4096)
        try:
            return json.loads(self._extract_json(resp))
        except (json.JSONDecodeError, Exception):
            return {"volumes": [], "error": "大纲生成失败，请重试"}

    # ================================================================
    # 角色生成
    # ================================================================

    async def generate_characters(self) -> dict:
        """生成角色设定"""
        context = await self.assembler.assemble()
        client = await self._get_client("planning")

        messages = [
            {"role": "system", "content": CHARACTER_GENERATOR_PROMPT.format(
                book_info=context.get("book_info", "")
            )},
            {"role": "user", "content": "请根据以上作品信息，生成主要角色设定。"},
        ]
        resp = await client.chat(messages, temperature=0.7, max_tokens=4096)
        try:
            return json.loads(self._extract_json(resp))
        except (json.JSONDecodeError, Exception):
            return {"characters": [], "error": "角色生成失败，请重试"}

    # ================================================================
    # 工具方法
    # ================================================================

    @staticmethod
    def _extract_json(text: str) -> str:
        """从 AI 回复中提取 JSON 字符串"""
        # 尝试匹配 ```json ... ``` 代码块
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            if end > start:
                return text[start:end].strip()
        # 尝试匹配 ``` ... ``` 代码块
        if "```" in text:
            start = text.find("```") + 3
            end = text.find("```", start)
            if end > start:
                return text[start:end].strip()
        # 尝试匹配 { 到 }
        brace_start = text.find("{")
        brace_end = text.rfind("}")
        if brace_start >= 0 and brace_end > brace_start:
            return text[brace_start:brace_end + 1]
        return text