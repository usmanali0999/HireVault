from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.job import Job
from app.models.application import Application
from app.schemas.job import JobCreate, JobUpdate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/", response_model=list[JobOut])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.id.desc()).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/", response_model=JobOut, status_code=201)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in payload.model_dump().items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    linked_application = db.query(Application).filter(Application.job_id == job_id).first()
    if linked_application:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete job because applications are linked to it"
        )

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}