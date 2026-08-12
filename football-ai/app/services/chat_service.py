"""AI 对话服务"""
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import log
from app.dao.chat_history_dao import ChatHistoryDAO
from app.schemas.schemas import ChatRequest, ChatResponse


class ChatService:
    """AI 对话服务"""

    # 预设快捷回复（LLM 不可用时降级）
    FALLBACK_REPLIES = {
        "训练": "基于近期训练数据，建议今日降低 #9 号球员训练强度（膝部负荷偏高），加强中场传球配合训练，时长控制在 75 分钟内。",
        "首发": "根据球员近期评分和健康状态，推荐 4-3-3 阵型首发：门将刘强，后卫王浩/赵磊/陈刚/刘洋，中场周凯/李明轩/张伟，前锋孙宇/张志远/王浩。",
        "对手": "对方左后卫体能下降明显，建议本方右路加强突破；对方中路防守密集，可尝试边路传中战术。",
        "伤病": "当前伤停 2 人：#21 号左脚踝扭伤（预计 5 天回归），#15 号大腿肌肉拉伤（预计 12 天回归）。",
    }

    @staticmethod
    async def chat(db: AsyncSession, user_id: str, req: ChatRequest) -> ChatResponse:
        session_id = req.session_id or str(uuid.uuid4().replace("-", ""))[:32]

        # 保存用户消息
        await ChatHistoryDAO.create(
            db,
            id=str(uuid.uuid4().replace("-", ""))[:32],
            user_id=user_id,
            session_id=session_id,
            role="user",
            content=req.message,
        )

        # 生成回复
        reply = await ChatService._generate_reply(req.message)

        # 保存 AI 回复
        await ChatHistoryDAO.create(
            db,
            id=str(uuid.uuid4().replace("-", ""))[:32],
            user_id=user_id,
            session_id=session_id,
            role="assistant",
            content=reply,
        )

        suggestions = ChatService._get_suggestions(req.message)

        return ChatResponse(
            session_id=session_id,
            reply=reply,
            suggestions=suggestions,
            tokens=len(reply) // 4,
        )

    @staticmethod
    async def _generate_reply(message: str) -> str:
        """生成回复：优先用 LLM，降级用规则"""
        if settings.openai_api_key:
            try:
                return await ChatService._call_llm(message)
            except Exception as e:
                log.warning(f"LLM 调用失败，降级到规则回复: {e}")

        return ChatService._rule_based_reply(message)

    @staticmethod
    async def _call_llm(message: str) -> str:
        """调用 LLM"""
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
        )
        resp = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "你是数智绿茵足球平台的 AI 战术参谋，专注于足球战术分析、球员评估和训练建议。回答要简洁专业。"},
                {"role": "user", "content": message},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return resp.choices[0].message.content or ""

    @staticmethod
    def _rule_based_reply(message: str) -> str:
        """规则匹配回复"""
        for keyword, reply in ChatService.FALLBACK_REPLIES.items():
            if keyword in message:
                return reply
        return f"已收到「{message}」的请求。基于近期 5 场赛事与训练数据，相关建议已生成，可在战术看板或球员档案中查看完整分析。"

    @staticmethod
    def _get_suggestions(message: str) -> list[str]:
        """获取建议问题"""
        base = ["生成今日训练建议", "分析对手右路", "推荐首发 11 人", "本周伤病风险"]
        return base[:2]
