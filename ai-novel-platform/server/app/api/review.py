"""审查评分路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.chapter import Chapter
from app.models.review import Review
from app.models.writing_log import WritingLog
from app.schemas.review import ReviewRequest, ReviewResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/chapter", response_model=ReviewResponse)
async def review_chapter(
    data: ReviewRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """审查章节评分（12维度）"""
    result = await db.execute(select(Chapter).where(Chapter.id == data.chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 标记为待审查
    chapter.status = "review"
    await db.commit()

    # TODO: Step 5 实现完整的多智能体审查逻辑
    # 当前返回占位结果
    review = Review(
        book_id=chapter.book_id,
        chapter_id=chapter.id,
        target_type="chapter",
        target_id=chapter.id,
        overall_score=80,
        passed=True,
        rewrite_required=False,
        dimension_scores={"placeholder": {"score": 80, "issues": [], "suggestions": "待实现"}},
        priority_issues=[],
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewResponse(
        review_id=str(review.id),
        overall_score=review.overall_score,
        passed=review.passed,
        rewrite_required=review.rewrite_required,
        dimensions=review.dimension_scores,
        priority_issues=review.priority_issues,
    )