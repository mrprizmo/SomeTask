from pydantic import BaseModel


class AuthResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    token: str

    class Config:
        from_attributes = True
