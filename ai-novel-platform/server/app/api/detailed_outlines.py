"""细纲管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.detailed_outline import DetailedOutline
from app.models.writing_log import WritingLog
from app.schemas.detailed_outline import (
    DetailedOutlineCreate, DetailedOutlineUpdate, DetailedOutlineResponse
)
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/detailed-outlines", response_model=list[DetailedOutlineResponse])
async def list_detailed_outlines(
    book_id: str, chapter_id: str = None,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    query = select(DetailedOutline).where(DetailedOutline.book_id == book_id)
    if chapter_id:
        query = query.where(DetailedOutline.chapter_id == chapter_id)
    query = query.order_by(DetailedOutline.scene_index)
    result = await db.execute(query)
    return [DetailedOutlineResponse.model_validate(o) for o in result.scalars().all()]


@router.post("/{book_id}/detailed-outlines", response_model=DetailedOutlineResponse, status_code=201)
async def create_detailed_outline(
    book_id: str, data: DetailedOutlineCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(DetailedOutline)
        .where(DetailedOutline.book_id == book_id, DetailedOutline.chapter_id == data.chapter_id)
        .order_by(DetailedOutline.scene_index.desc())
        .limit(1)
    )
    last = result.scalar_one_or_none()
    scene_index = (last.scene_index + 1) if last else 1

    outline = DetailedOutline(
        book_id=book_id, chapter_id=data.chapter_id, scene_index=scene_index,
        title=data.title, function=data.function, emotion=data.emotion,
        word_count_target=data.word_count_target or 0,
        characters=data.characters or [], location=data.location or "",
        day_number=data.day_number or 0, description=data.description or "",
        key_dialogues=data.key_dialogues or "", pleasure_types=data.pleasure_types or [],
    )
    db.add(outline)
    await db.commit()
    await db.refresh(outline)
    return DetailedOutlineResponse.model_validate(outline)


@router.put("/detailed-outlines/{outline_id}", response_model=DetailedOutlineResponse)
async def update_detailed_outline(
    outline_id: str, data: DetailedOutlineUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DetailedOutline).where(DetailedOutline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="细纲不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(outline, key, value)
    await db.commit()
    await db.refresh(outline)
    return DetailedOutlineResponse.model_validate(outline)


@router.delete("/detailed-outlines/{outline_id}", status_code=204)
async def delete_detailed_outline(
    outline_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DetailedOutline).where(DetailedOutline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="细纲不存在")
    await db.delete(outline)
    await db.commit()


@router.put("/detailed-outlines/reorder")
async def reorder_detailed_outlines(
    items: list[dict], user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    for item in items:
        result = await db.execute(select(DetailedOutline).where(DetailedOutline.id == item["id"]))
        scene = result.scalar_one_or_none()
        if scene:
            scene.scene_index = item.get("scene_index", scene.scene_index)
    await db.commit()
    return {"status": "ok"}