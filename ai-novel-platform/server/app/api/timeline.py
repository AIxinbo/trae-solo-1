"""时间线管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.timeline import TimelineEvent, CharStateLog
from app.models.writing_log import WritingLog
from app.schemas.timeline import (
    TimelineEventCreate, TimelineEventUpdate, TimelineEventResponse,
    CharStateLogCreate, CharStateLogResponse,
)
from app.middleware.auth import get_current_user

router = APIRouter()


# ========== 时间线事件 ==========

@router.get("/{book_id}/timeline", response_model=list[TimelineEventResponse])
async def list_timeline_events(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TimelineEvent).where(TimelineEvent.book_id == book_id).order_by(TimelineEvent.day_number)
    )
    return [TimelineEventResponse.model_validate(e) for e in result.scalars().all()]


@router.post("/{book_id}/timeline", response_model=TimelineEventResponse, status_code=201)
async def create_timeline_event(
    book_id: str, data: TimelineEventCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    event = TimelineEvent(book_id=book_id, **data.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)

    log = WritingLog(book_id=book_id, user_id=user_id,
                     action="create_timeline", description=f"添加时间线事件：第{event.day_number}天")
    db.add(log)
    await db.commit()

    return TimelineEventResponse.model_validate(event)


@router.put("/timeline/{event_id}", response_model=TimelineEventResponse)
async def update_timeline_event(
    event_id: str, data: TimelineEventUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TimelineEvent).where(TimelineEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="时间线事件不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return TimelineEventResponse.model_validate(event)


@router.delete("/timeline/{event_id}", status_code=204)
async def delete_timeline_event(
    event_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TimelineEvent).where(TimelineEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="时间线事件不存在")
    await db.delete(event)
    await db.commit()


# ========== 角色状态日志 ==========

@router.get("/characters/{character_id}/state-logs", response_model=list[CharStateLogResponse])
async def list_char_state_logs(
    character_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CharStateLog).where(CharStateLog.character_id == character_id)
        .order_by(CharStateLog.chapter_number)
    )
    return [CharStateLogResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/characters/{character_id}/state-logs", response_model=CharStateLogResponse, status_code=201)
async def create_char_state_log(
    character_id: str, data: CharStateLogCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    log = CharStateLog(character_id=character_id, **data.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return CharStateLogResponse.model_validate(log)