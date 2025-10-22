from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
import secrets
from typing import Optional

from app.models.user import User
from app.models.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.auth import AuthResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TaskManagerService:
    """Сервис для управления задачами аутентификации"""

    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Создание нового пользователя"""
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise ValueError("Пользователь с таким email уже существует")

        # Хешируем пароль
        hashed_password = pwd_context.hash(user_data.password)

        # Создаем пользователя
        user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role,
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, login_data: UserLogin
    ) -> Optional[User]:
        """Аутентификация пользователя"""
        result = await db.execute(select(User).where(User.email == login_data.email))
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not pwd_context.verify(login_data.password, user.hashed_password):
            return None

        return user

    @staticmethod
    async def create_token(db: AsyncSession, user_id: int) -> str:
        """Создание вечного токена для пользователя"""
        # Генерируем случайный токен
        token_value = secrets.token_urlsafe(32)

        # Создаем запись токена
        token = Token(token=token_value, user_id=user_id)

        db.add(token)
        await db.commit()

        return token_value

    @staticmethod
    async def get_user_by_token(db: AsyncSession, token: str) -> Optional[User]:
        """Получение пользователя по токену"""
        result = await db.execute(select(Token).where(Token.token == token))
        token_obj = result.scalar_one_or_none()

        if not token_obj:
            return None

        return token_obj.user

    @staticmethod
    async def logout_user(db: AsyncSession, token: str) -> bool:
        """Выход пользователя (удаление токена)"""
        result = await db.execute(select(Token).where(Token.token == token))
        token_obj = result.scalar_one_or_none()

        if token_obj:
            await db.delete(token_obj)
            await db.commit()
            return True

        return False

    @staticmethod
    def create_auth_response(user: User, token: str) -> AuthResponse:
        """Создание ответа для аутентификации"""
        return AuthResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            token=token,
        )
