"""审查评分路由 — 多智能体管线 + 12维度评分"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.chapter import Chapter
from app.models.review import Review
from app.models.writing_log import WritingLog
from app.schemas.review import ReviewResponse
from app.middleware.auth import get_current_user
from app.services.review.engine import ReviewEngine

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{book_id}/chapters/{chapter_id}/review", response_model=ReviewResponse)
async def review_chapter(
    book_id: str,
    chapter_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """审查章节评分（多智能体管线 + 12维度）"""
    # 验证章节存在
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    if not chapter.content:
        raise HTTPException(status_code=400, detail="章节内容为空，无法审查")

    try:
        # 执行多智能体审查
        engine = ReviewEngine(db, user_id, book_id, chapter_id)
        review_result = await engine.review()

        # 保存审查记录
        review = Review(
            book_id=book_id,
            chapter_id=chapter_id,
            target_type="chapter",
            target_id=chapter_id,
            overall_score=review_result["overall_score"],
            passed=review_result["passed"],
            rewrite_required=review_result["rewrite_required"],
            dimension_scores=review_result["dimension_scores"],
            priority_issues=review_result["priority_issues"],
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)

        # 更新章节状态
        chapter.status = "completed" if review_result["passed"] else "review"
        await db.commit()

        # 写入日志
        log = WritingLog(
            book_id=book_id,
            user_id=user_id,
            action="create_review",
            description=f"审查《{chapter.title}》：{review_result['overall_score']}分，{'通过' if review_result['passed'] else '需修改'}",
            metadata={"overall_score": review_result["overall_score"]},
        )
        db.add(log)
        await db.commit()

        return ReviewResponse(
            review_id=str(review.id),
            overall_score=review_result["overall_score"],
            passed=review_result["passed"],
            rewrite_required=review_result["rewrite_required"],
            dimensions=review_result["dimension_scores"],
            priority_issues=review_result["priority_issues"],
        )
    except Exception as e:
        logger.error(f"审查失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"审查失败: {str(e)}")


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取审查结果"""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="审查记录不存在")

    return ReviewResponse(
        review_id=str(review.id),
        overall_score=review.overall_score,
        passed=review.passed,
        rewrite_required=review.rewrite_required,
        dimensions=review.dimension_scores,
        priority_issues=review.priority_issues,
    )