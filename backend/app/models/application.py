from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    stage = Column(String(50), nullable=False, default="Applied")
    notes = Column(String(255), nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")