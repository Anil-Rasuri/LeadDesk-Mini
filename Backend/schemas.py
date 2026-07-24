from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

BudgetRange = Literal[
    "Below ₹25,000",
    "₹25,000 - ₹50,000",
    "₹50,000 - ₹1,00,000",
    "Above ₹1,00,000",
]
LeadStatus = Literal["New", "Contacted", "Closed"]


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    budget: BudgetRange
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("name", "message")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    budget: str
    message: str
    status: str
    created_at: datetime


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class StatusUpdate(BaseModel):
    status: LeadStatus
