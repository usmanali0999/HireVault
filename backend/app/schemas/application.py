from datetime import datetime
from pydantic import BaseModel, ConfigDict


class JobMini(BaseModel):
    id: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class CandidateMini(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    job_id: int
    candidate_id: int
    stage: str = "Applied"
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    stage: str
    notes: str | None = None


class ApplicationOut(BaseModel):
    id: int
    stage: str
    notes: str | None = None
    applied_at: datetime
    job: JobMini
    candidate: CandidateMini

    model_config = ConfigDict(from_attributes=True)