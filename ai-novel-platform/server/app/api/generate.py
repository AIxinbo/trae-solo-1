"""AI 生成 API — 章节生成、大纲生成、角色生成"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.chapter import Chapter, ChapterVersion
from app.models.writing_log import WritingLog
from app.middleware.auth import get_current_user
from app.schemas.generate import (
    GenerateChapterRequest,
    GenerateOutlineRequest,
    GenerateCharactersRequest,
    GenerateResponse,
)
from app.services.generator.engine import GenerationEngine

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{book_id}/generate-chapter", response_model=GenerateResponse)
async def generate_chapter(
    book_id: str,
    req: GenerateChapterRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """多智能体管线生成章节正文"""
    # 验证章节存在
    result = await db.execute(select(Chapter).where(Chapter.id == req.chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    try:
        engine = GenerationEngine(db, user_id, book_id, req.chapter_id)
        result_data = await engine.generate_chapter(target_words=req.target_words)

        # 保存生成的正文
        chapter.content = result_data["content"]
        chapter.word_count = result_data["final_words"]
        chapter.status = "writing"
        await db.commit()

        # 保存版本快照
        version = ChapterVersion(
            chapter_id=req.chapter_id,
            version_number=1,
            content=result_data["content"],
            summary=f"AI 自动生成，{result_data['final_words']}字",
        )
        db.add(version)

        # 写入日志
        log = WritingLog(
            book_id=book_id,
            user_id=user_id,
            action="ai_generate",
            description=f"AI 生成章节《{chapter.title}》，{result_data['final_words']}字",
            metadata={"plan": result_data.get("plan")},
        )
        db.add(log)
        await db.commit()

        return GenerateResponse(
            success=True,
            message=f"生成完成，{result_data['final_words']}字",
            data={
                "content": result_data["content"],
                "plan": result_data.get("plan"),
                "word_count": result_data["final_words"],
            },
        )
    except Exception as e:
        logger.error(f"章节生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")


@router.post("/{book_id}/generate-chapter-stream")
async def generate_chapter_stream(
    book_id: str,
    req: GenerateChapterRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """流式生成章节，SSE 实时推送各阶段状态"""
    result = await db.execute(select(Chapter).where(Chapter.id == req.chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    engine = GenerationEngine(db, user_id, book_id, req.chapter_id)

    async def event_stream():
        final_content = ""
        final_words = 0
        final_plan = None

        async for event in engine.generate_chapter_stream(target_words=req.target_words):
            if event["stage"] == "done":
                final_content = event["content"]
                final_words = event["final_words"]
                final_plan = event.get("plan")

            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

        # 保存到数据库
        if final_content:
            chapter.content = final_content
            chapter.word_count = final_words
            chapter.status = "writing"
            await db.commit()

            version = ChapterVersion(
                chapter_id=req.chapter_id,
                version_number=1,
                content=final_content,
                summary=f"AI 自动生成，{final_words}字",
            )
            db.add(version)

            log = WritingLog(
                book_id=book_id,
                user_id=user_id,
                action="ai_generate",
                description=f"AI 生成章节《{chapter.title}》，{final_words}字",
                metadata={"plan": final_plan},
            )
            db.add(log)
            await db.commit()

        yield f"data: {json.dumps({'stage': 'saved', 'message': '已保存到数据库'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/{book_id}/generate-outline", response_model=GenerateResponse)
async def generate_outline(
    book_id: str,
    req: GenerateOutlineRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI 生成大纲"""
    try:
        engine = GenerationEngine(db, user_id, book_id)
        result = await engine.generate_outline()

        # 写入日志
        log = WritingLog(
            book_id=book_id,
            user_id=user_id,
            action="ai_generate_outline",
            description="AI 生成大纲",
            metadata={"volumes_count": len(result.get("volumes", []))},
        )
        db.add(log)
        await db.commit()

        return GenerateResponse(
            success=True,
            message="大纲生成完成",
            data=result,
        )
    except Exception as e:
        logger.error(f"大纲生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")


@router.post("/{book_id}/generate-characters", response_model=GenerateResponse)
async def generate_characters(
    book_id: str,
    req: GenerateCharactersRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI 生成角色"""
    try:
        engine = GenerationEngine(db, user_id, book_id)
        result = await engine.generate_characters()

        log = WritingLog(
            book_id=book_id,
            user_id=user_id,
            action="ai_generate_characters",
            description="AI 生成角色",
            metadata={"characters_count": len(result.get("characters", []))},
        )
        db.add(log)
        await db.commit()

        return GenerateResponse(
            success=True,
            message="角色生成完成",
            data=result,
        )
    except Exception as e:
        logger.error(f"角色生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")