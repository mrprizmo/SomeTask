from pydantic import BaseModel, EmailStr, validator


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

    @validator("password")
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

    @validator("role")
    def valid_role(cls, v):
        if v not in ["student", "teacher"]:
            raise ValueError('Role must be either "student" or "teacher"')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
