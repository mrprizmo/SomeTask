from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, create_db_and_tables
from app.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создаем таблицы при запуске
    await create_db_and_tables()
    yield
    # Очистка при завершении
    await engine.dispose()


app = FastAPI(title="SomeTask API", description="", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты
app.include_router(auth_router, prefix="/auth", tags=["Auth"])


@app.get("/")
async def root():
    return {"message": "SomeTask API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
