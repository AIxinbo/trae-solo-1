"""模型配置路由 — 用户在客户端配置第三方大模型"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.model_config import UserModelConfig
from app.schemas.model_config import ModelConfigCreate, ModelConfigUpdate, ModelConfigResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/model-configs", response_model=list[ModelConfigResponse])
async def list_model_configs(
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserModelConfig).where(UserModelConfig.user_id == user_id)
        .order_by(UserModelConfig.sort_order)
    )
    return [ModelConfigResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/model-configs", response_model=ModelConfigResponse, status_code=201)
async def create_model_config(
    data: ModelConfigCreate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    # 计算排序
    result = await db.execute(
        select(UserModelConfig).where(UserModelConfig.user_id == user_id)
        .order_by(UserModelConfig.sort_order.desc()).limit(1)
    )
    last = result.scalar_one_or_none()
    sort_order = (last.sort_order + 1) if last else 1

    config = UserModelConfig(user_id=user_id, sort_order=sort_order, **data.model_dump())
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return ModelConfigResponse.model_validate(config)


@router.put("/model-configs/{config_id}", response_model=ModelConfigResponse)
async def update_model_config(
    config_id: str, data: ModelConfigUpdate,
    user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserModelConfig).where(UserModelConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="模型配置不存在")
    if str(config.user_id) != user_id:
        raise HTTPException(status_code=403, detail="无权操作此配置")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(config, key, value)
    await db.commit()
    await db.refresh(config)
    return ModelConfigResponse.model_validate(config)


@router.delete("/model-configs/{config_id}", status_code=204)
async def delete_model_config(
    config_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserModelConfig).where(UserModelConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="模型配置不存在")
    if str(config.user_id) != user_id:
        raise HTTPException(status_code=403, detail="无权操作此配置")
    await db.delete(config)
    await db.commit()