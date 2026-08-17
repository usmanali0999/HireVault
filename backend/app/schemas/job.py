from datetime import datetime
from pydantic import BaseModel, ConfigDict


class JobBase(BaseModel):
    title: str
    department: str
    location: str
    employment_type: str = "Full-time"
    status: str = "Open"
    description: str | None = None


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class JobOut(JobBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)