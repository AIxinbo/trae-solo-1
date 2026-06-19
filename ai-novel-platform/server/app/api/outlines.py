"""大纲管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.outline import Outline
from app.models.writing_log import WritingLog
from app.schemas.outline import OutlineCreate, OutlineUpdate, OutlineResponse, OutlineTreeResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/outlines", response_model=list[OutlineTreeResponse])
async def get_outline_tree(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Outline).where(Outline.book_id == book_id).order_by(Outline.sort_order)
    )
    return [OutlineTreeResponse.model_validate(o) for o in result.scalars().all()]


@router.post("/{book_id}/outlines", response_model=OutlineResponse, status_code=201)
async def create_outline(
    book_id: str, data: OutlineCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if data.parent_id:
        result = await db.execute(
            select(Outline).where(Outline.id == data.parent_id, Outline.book_id == book_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="父节点不存在")

    if data.sort_order is not None:
        sort_order = data.sort_order
    else:
        result = await db.execute(
            select(Outline)
            .where(Outline.book_id == book_id, Outline.parent_id == data.parent_id)
            .order_by(Outline.sort_order.desc())
            .limit(1)
        )
        last = result.scalar_one_or_none()
        sort_order = (last.sort_order + 1) if last else 0

    outline = Outline(
        book_id=book_id, parent_id=data.parent_id, level=data.level,
        title=data.title, content=data.content or "", sort_order=sort_order,
    )
    db.add(outline)
    await db.commit()
    await db.refresh(outline)
    return OutlineResponse.model_validate(outline)


@router.put("/outlines/{outline_id}", response_model=OutlineResponse)
async def update_outline(
    outline_id: str, data: OutlineUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Outline).where(Outline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="大纲节点不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(outline, key, value)
    await db.commit()
    await db.refresh(outline)
    return OutlineResponse.model_validate(outline)


@router.delete("/outlines/{outline_id}", status_code=204)
async def delete_outline(
    outline_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Outline).where(Outline.id == outline_id))
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(status_code=404, detail="大纲节点不存在")
    await db.delete(outline)
    await db.commit()


@router.put("/outlines/reorder")
async def reorder_outlines(
    items: list[dict], user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    for item in items:
        result = await db.execute(select(Outline).where(Outline.id == item["id"]))
        outline = result.scalar_one_or_none()
        if outline:
            outline.sort_order = item.get("sort_order", outline.sort_order)
            if "parent_id" in item:
                outline.parent_id = item["parent_id"]
    await db.commit()
    return {"status": "ok"}