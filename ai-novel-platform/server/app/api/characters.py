"""角色管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.character import Character
from app.models.writing_log import WritingLog
from app.schemas.character import CharacterCreate, CharacterUpdate, CharacterResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/characters", response_model=list[CharacterResponse])
async def list_characters(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Character).where(Character.book_id == book_id).order_by(Character.created_at)
    )
    return [CharacterResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/{book_id}/characters", response_model=CharacterResponse, status_code=201)
async def create_character(
    book_id: str, data: CharacterCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    character = Character(
        book_id=book_id, name=data.name, age=data.age, gender=data.gender,
        role_type=data.role_type, appearance=data.appearance,
        personality=data.personality, background=data.background,
        motivation=data.motivation, speech_style=data.speech_style,
        formality_level=data.formality_level, avg_sentence_len=data.avg_sentence_len,
        favorite_words=data.favorite_words, forbidden_words=data.forbidden_words,
        tone_words=data.tone_words,
    )
    db.add(character)
    await db.commit()
    await db.refresh(character)

    # 写入日志
    log = WritingLog(
        book_id=book_id, user_id=user_id,
        action="create_character", description=f"创建角色：{character.name}"
    )
    db.add(log)
    await db.commit()

    return CharacterResponse.model_validate(character)


@router.put("/characters/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str, data: CharacterUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(character, key, value)
    await db.commit()
    await db.refresh(character)
    return CharacterResponse.model_validate(character)


@router.delete("/characters/{character_id}", status_code=204)
async def delete_character(
    character_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    await db.delete(character)
    await db.commit()