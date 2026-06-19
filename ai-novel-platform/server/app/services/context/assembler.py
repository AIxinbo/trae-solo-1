"""
上下文组装器 — 从数据库提取并组装 AI 写作所需的所有上下文
三重上下文注入：前5章摘要 + 当前大纲节点 + 角色设定卡片 + 细纲场景
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.book import Book
from app.models.chapter import Chapter
from app.models.outline import Outline
from app.models.character import Character
from app.models.detailed_outline import DetailedOutline


class ContextAssembler:
    """为 AI 生成章节内容组装上下文"""

    def __init__(self, db: AsyncSession, book_id: str, chapter_id: str | None = None):
        self.db = db
        self.book_id = book_id
        self.chapter_id = chapter_id

    async def assemble(self) -> dict:
        """组装完整的上下文信息"""
        book = await self._get_book()
        context = {
            "book_info": await self._build_book_info(book),
            "previous_chapters": await self._build_previous_summaries(),
            "current_outline": await self._build_outline_context(),
            "characters": await self._build_character_cards(),
            "detailed_scenes": await self._build_detailed_scenes(),
            "timeline": await self._build_timeline_context(),
        }
        return context

    async def _get_book(self):
        result = await self.db.execute(select(Book).where(Book.id == self.book_id))
        return result.scalar_one_or_none()

    async def _build_book_info(self, book) -> str:
        """构建作品基本信息"""
        if not book:
            return "暂无作品信息"
        parts = [f"作品名称：《{book.title}》"]
        if book.genre:
            parts.append(f"类型：{book.genre}")
        if book.style:
            parts.append(f"风格：{book.style}")
        if book.synopsis:
            parts.append(f"简介：{book.synopsis}")
        if book.world_setting:
            parts.append(f"世界观设定：{book.world_setting}")
        if book.target_platform:
            parts.append(f"目标平台：{book.target_platform}")
        return "\n".join(parts)

    async def _build_previous_summaries(self) -> str:
        """构建前5章摘要（用于保持故事连贯性）"""
        result = await self.db.execute(
            select(Chapter)
            .where(Chapter.book_id == self.book_id)
            .order_by(Chapter.sort_order)
        )
        chapters = result.scalars().all()

        if not chapters:
            return "这是第一章，暂无前文摘要。"

        # 找到当前章节的位置
        current_idx = None
        if self.chapter_id:
            for i, ch in enumerate(chapters):
                if str(ch.id) == self.chapter_id:
                    current_idx = i
                    break

        # 取前5章（如果当前章节存在则取它之前的章节）
        if current_idx is not None:
            prev_chapters = chapters[max(0, current_idx - 5):current_idx]
        else:
            prev_chapters = chapters[-5:]

        if not prev_chapters:
            return "这是第一章，暂无前文摘要。"

        summaries = []
        for ch in prev_chapters:
            summary = ch.ai_summary or ch.content[:200] if ch.content else "暂无摘要"
            summaries.append(
                f"第{ch.sort_order}章《{ch.title}》摘要：{summary}"
            )
        return "\n\n".join(summaries)

    async def _build_outline_context(self) -> str:
        """构建大纲上下文（当前章节对应的大纲节点及其父节点）"""
        result = await self.db.execute(
            select(Outline)
            .where(Outline.book_id == self.book_id)
            .order_by(Outline.sort_order)
        )
        outlines = result.scalars().all()

        if not outlines:
            return "暂无大纲信息。"

        # 如果有关联章节，尝试找到对应的大纲节点
        if self.chapter_id:
            chapter_result = await self.db.execute(
                select(Chapter).where(Chapter.id == self.chapter_id)
            )
            chapter = chapter_result.scalar_one_or_none()
            if chapter and chapter.outline_id:
                outline_result = await self.db.execute(
                    select(Outline).where(Outline.id == chapter.outline_id)
                )
                outline = outline_result.scalar_one_or_none()
                if outline:
                    return self._format_outline_node(outline)

        # 否则返回整个大纲树
        return self._format_outline_tree(outlines)

    def _format_outline_node(self, node: Outline) -> str:
        parts = [f"当前大纲节点：{node.title}"]
        if node.content:
            parts.append(f"内容概要：{node.content}")
        if node.emotion_curve:
            parts.append(f"情感曲线：{node.emotion_curve}")
        if node.word_count_target:
            parts.append(f"目标字数：{node.word_count_target}")
        return "\n".join(parts)

    def _format_outline_tree(self, outlines: list[Outline]) -> str:
        """格式化大纲树"""
        by_level = {"volume": [], "chapter": [], "section": []}
        for o in outlines:
            if o.level in by_level:
                by_level[o.level].append(o)

        lines = ["## 大纲结构"]
        for vol in by_level["volume"]:
            lines.append(f"### {vol.title}")
            if vol.content:
                lines.append(f"  {vol.content}")
        for ch in by_level["chapter"]:
            lines.append(f"- {ch.title}")
            if ch.content:
                lines.append(f"  {ch.content}")
        return "\n".join(lines)

    async def _build_character_cards(self) -> str:
        """构建角色设定卡片"""
        result = await self.db.execute(
            select(Character).where(Character.book_id == self.book_id)
        )
        characters = result.scalars().all()

        if not characters:
            return "暂无角色设定。"

        cards = []
        for char in characters:
            card = [f"## {char.name}（{char.role_type}）"]
            if char.age:
                card.append(f"- 年龄：{char.age}")
            if char.gender:
                card.append(f"- 性别：{char.gender}")
            if char.personality:
                card.append(f"- 性格：{char.personality}")
            if char.appearance:
                card.append(f"- 外貌：{char.appearance}")
            if char.background:
                card.append(f"- 背景：{char.background}")
            if char.motivation:
                card.append(f"- 动机：{char.motivation}")
            if char.speech_style:
                card.append(f"- 说话风格：{char.speech_style}")
                if char.formality_level is not None:
                    card.append(f"  正式度：{char.formality_level}")
                if char.avg_sentence_len:
                    card.append(f"  平均句长：{char.avg_sentence_len}字")
                if char.favorite_words:
                    card.append(f"  常用词：{', '.join(char.favorite_words)}")
                if char.tone_words:
                    card.append(f"  语气词：{', '.join(char.tone_words)}")
                if char.forbidden_words:
                    card.append(f"  禁用词：{', '.join(char.forbidden_words)}")
            cards.append("\n".join(card))

        return "\n\n".join(cards)

    async def _build_detailed_scenes(self) -> str:
        """构建细纲场景信息"""
        result = await self.db.execute(
            select(DetailedOutline)
            .where(DetailedOutline.book_id == self.book_id)
            .order_by(DetailedOutline.scene_index)
        )
        scenes = result.scalars().all()

        if not scenes:
            return "暂无细纲信息。"

        scene_lines = ["## 本章场景规划"]
        for s in scenes:
            line = f"### 场景{s.scene_index}：{s.title}"
            if s.function:
                line += f"\n- 功能：{s.function}"
            if s.emotion:
                line += f"\n- 情感：{s.emotion}"
            if s.location:
                line += f"\n- 地点：{s.location}"
            if s.day_number:
                line += f"\n- 时间：第{s.day_number}天"
            if s.description:
                line += f"\n- 描述：{s.description}"
            if s.key_dialogues:
                line += f"\n- 关键对话：{s.key_dialogues}"
            if s.pleasure_types:
                line += f"\n- 爽点类型：{', '.join(s.pleasure_types)}"
            scene_lines.append(line)

        return "\n\n".join(scene_lines)

    async def _build_timeline_context(self) -> str:
        """构建时间线上下文"""
        from app.models.timeline import TimelineEvent

        result = await self.db.execute(
            select(TimelineEvent)
            .where(TimelineEvent.book_id == self.book_id)
            .order_by(TimelineEvent.day_number)
        )
        events = result.scalars().all()

        if not events:
            return "暂无时间线信息。"

        event_lines = ["## 故事时间线"]
        for e in events:
            line = f"- 第{e.day_number}天：{e.event_desc}"
            if e.location:
                line += f"（地点：{e.location}）"
            if e.season:
                line += f" [{e.season}]"
            event_lines.append(line)

        return "\n".join(event_lines)

    def build_user_message(self, action: str, context: dict, extra: dict | None = None) -> str:
        """构建发送给 AI 的用户消息"""
        parts = []

        # 作品信息
        parts.append(f"=== 作品信息 ===\n{context.get('book_info', '')}")

        # 前文摘要
        parts.append(f"\n=== 前文摘要 ===\n{context.get('previous_chapters', '')}")

        if action == "write_chapter":
            # 大纲
            parts.append(f"\n=== 大纲指引 ===\n{context.get('current_outline', '')}")
            # 角色
            parts.append(f"\n=== 角色设定 ===\n{context.get('characters', '')}")
            # 细纲
            parts.append(f"\n=== 场景规划 ===\n{context.get('detailed_scenes', '')}")
            # 时间线
            parts.append(f"\n=== 时间线 ===\n{context.get('timeline', '')}")

        if extra:
            if "plan" in extra:
                parts.append(f"\n=== 写作规划 ===\n{extra['plan']}")
            if "target_words" in extra:
                parts.append(f"\n目标字数：{extra['target_words']}字")
            if "content" in extra:
                parts.append(f"\n=== 待处理文本 ===\n{extra['content']}")

        return "\n".join(parts)