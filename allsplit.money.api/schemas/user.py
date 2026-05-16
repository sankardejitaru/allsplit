from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10)

class UserResponse(BaseModel):
    mobile: str
    is_verified: bool