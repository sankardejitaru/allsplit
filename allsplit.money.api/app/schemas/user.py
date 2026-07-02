from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    mobile: str
    is_verified: bool


class ProfileGetRequest(BaseModel):
    mobile: str = Field(..., min_length=10)


class ProfileUpdateRequest(BaseModel):
    mobile: str = Field(..., min_length=10)
    firstname: str = Field(..., min_length=1, max_length=50)
    lastname: str = Field(default="", max_length=50)
