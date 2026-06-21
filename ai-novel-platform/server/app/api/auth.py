"""认证路由 — 注册 / 登录"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
from datetime import datetime, timedelta
import bcrypt
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名或邮箱已存在")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode(),
        nickname=data.username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not bcrypt.checkpw(data.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))