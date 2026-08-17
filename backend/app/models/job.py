from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    employment_type = Column(String(50), nullable=False, default="Full-time")
    status = Column(String(50), nullable=False, default="Open")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="job")