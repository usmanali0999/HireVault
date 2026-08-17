from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.candidate import Candidate
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("/", response_model=list[ApplicationOut])
def get_applications(stage: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.candidate)
    )

    if stage:
        query = query.filter(Application.stage == stage)

    return query.order_by(Application.id.desc()).all()


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = (
        db.query(Application)
        .options(joinedload(Application.job), joinedload(Application.candidate))
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


@router.post("/", response_model=ApplicationOut, status_code=201)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    application = Application(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)

    application = (
        db.query(Application)
        .options(joinedload(Application.job), joinedload(Application.candidate))
        .filter(Application.id == application.id)
        .first()
    )

    return application


@router.put("/{application_id}", response_model=ApplicationOut)
def update_application(application_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.stage = payload.stage
    application.notes = payload.notes

    db.commit()
    db.refresh(application)

    application = (
        db.query(Application)
        .options(joinedload(Application.job), joinedload(Application.candidate))
        .filter(Application.id == application_id)
        .first()
    )

    return application


@router.delete("/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}