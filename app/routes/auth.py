from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.schemas.user import UserCreate, UserLogin
from app.schemas.auth import AuthResponse
from app.services.task_manager import TaskManagerService
from app.utils.database import get_db

router = APIRouter()


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user_data: UserCreate, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    """
    Регистрация нового пользователя
    """
    try:
        # Создаем пользователя
        user = await TaskManagerService.create_user(db, user_data)

        # Создаем токен для пользователя
        token = await TaskManagerService.create_token(db, user.id)

        # Формируем ответ
        return TaskManagerService.create_auth_response(user, token)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/login", response_model=AuthResponse)
async def login_user(
    login_data: UserLogin, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    """
    Вход пользователя в систему
    """
    # Аутентифицируем пользователя
    user = await TaskManagerService.authenticate_user(db, login_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Создаем токен для пользователя
    token = await TaskManagerService.create_token(db, user.id)

    # Формируем ответ
    return TaskManagerService.create_auth_response(user, token)
