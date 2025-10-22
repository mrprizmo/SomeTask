import asyncio
import uuid
from typing import AsyncIterator

import pytest
from httpx import AsyncClient
from asgi_lifespan import LifespanManager


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
def make_email():
    def _make_email(prefix: str = "user") -> str:
        return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"

    return _make_email


@pytest.fixture(scope="session")
def app_instance():
    from app.main import app

    return app


@pytest.fixture
async def client(app_instance) -> AsyncIterator[AsyncClient]:
    async with LifespanManager(app_instance):
        async with AsyncClient(app=app_instance, base_url="http://testserver") as ac:
            yield ac
