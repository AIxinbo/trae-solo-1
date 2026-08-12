"""路由汇总"""
from fastapi import APIRouter
from app.api.chat import router as chat_router
from app.api.tactics import router as tactics_router
from app.api.players import router as players_router
from app.api.video import router as video_router

api_router = APIRouter()
api_router.include_router(chat_router)
api_router.include_router(tactics_router)
api_router.include_router(players_router)
api_router.include_router(video_router)
