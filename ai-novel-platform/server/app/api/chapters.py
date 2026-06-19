"""章节管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.chapter import Chapter
from app.models.writing_log import WritingLog
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/chapters", response_model=list[ChapterResponse])
async def list_chapters(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Chapter).where(Chapter.book_id == book_id).order_by(Chapter.sort_order)
    )
    return [ChapterResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/{book_id}/chapters", response_model=ChapterResponse, status_code=201)
async def create_chapter(
    book_id: str, data: ChapterCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    # 计算排序
    result = await db.execute(
        select(Chapter).where(Chapter.book_id == book_id)
        .order_by(Chapter.sort_order.desc()).limit(1)
    )
    last = result.scalar_one_or_none()
    sort_order = (last.sort_order + 1) if last else 1

    chapter = Chapter(
        book_id=book_id, outline_id=data.outline_id,
        title=data.title, word_count_target=data.word_count_target or 2000,
        sort_order=data.sort_order or sort_order,
    )
    db.add(chapter)
    await db.commit()
    await db.refresh(chapter)

    # 写入日志
    log = WritingLog(
        book_id=book_id, user_id=user_id,
        action="create_chapter", description=f"创建章节《{chapter.title}》"
    )
    db.add(log)
    await db.commit()

    return ChapterResponse.model_validate(chapter)


@router.get("/chapters/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    chapter_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    return ChapterResponse.model_validate(chapter)


@router.put("/chapters/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(
    chapter_id: str, data: ChapterUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(chapter, key, value)
    await db.commit()
    await db.refresh(chapter)
    return ChapterResponse.model_validate(chapter)


@router.delete("/chapters/{chapter_id}", status_code=204)
async def delete_chapter(
    chapter_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    await db.delete(chapter)
    await db.commit()