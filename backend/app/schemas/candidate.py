from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CandidateBase(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    years_experience: int = 0
    current_company: str | None = None
    skills: str | None = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(CandidateBase):
    pass


class CandidateOut(CandidateBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)