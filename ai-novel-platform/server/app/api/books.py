"""项目管理路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book
from app.models.writing_log import WritingLog
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[BookResponse])
async def list_books(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book).where(Book.user_id == user_id).order_by(Book.updated_at.desc())
    )
    return [BookResponse.model_validate(b) for b in result.scalars().all()]


@router.post("/", response_model=BookResponse, status_code=201)
async def create_book(
    data: BookCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    book = Book(
        user_id=user_id,
        title=data.title,
        genre=data.genre,
        style=data.style,
        synopsis=data.synopsis or "",
        target_platform=data.target_platform or "",
        world_setting=data.world_setting or "",
        word_count_target=data.word_count_target or 0,
        ai_config=data.ai_config or {},
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)

    # 写入历程日志
    log = WritingLog(
        book_id=book.id, user_id=user_id,
        action="create_book", description=f"创建项目《{book.title}》"
    )
    db.add(log)
    await db.commit()

    return BookResponse.model_validate(book)


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Book).where(Book.id == book_id, Book.user_id == user_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")
    return BookResponse.model_validate(book)


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str, data: BookUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Book).where(Book.id == book_id, Book.user_id == user_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(book, key, value)
    await db.commit()
    await db.refresh(book)
    return BookResponse.model_validate(book)


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Book).where(Book.id == book_id, Book.user_id == user_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="项目不存在")
    await db.delete(book)
    await db.commit()