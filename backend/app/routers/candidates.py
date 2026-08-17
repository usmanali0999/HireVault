from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.candidate import Candidate
from app.models.application import Application
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateOut

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=list[CandidateOut])
def get_candidates(db: Session = Depends(get_db)):
    return db.query(Candidate).order_by(Candidate.id.desc()).all()


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.post("/", response_model=CandidateOut, status_code=201)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    existing = db.query(Candidate).filter(Candidate.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    candidate = Candidate(**payload.model_dump())
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.put("/{candidate_id}", response_model=CandidateOut)
def update_candidate(candidate_id: int, payload: CandidateUpdate, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    email_owner = (
        db.query(Candidate)
        .filter(Candidate.email == payload.email, Candidate.id != candidate_id)
        .first()
    )
    if email_owner:
        raise HTTPException(status_code=400, detail="Email already exists")

    for key, value in payload.model_dump().items():
        setattr(candidate, key, value)

    db.commit()
    db.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    linked_application = db.query(Application).filter(Application.candidate_id == candidate_id).first()
    if linked_application:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete candidate because applications are linked to it"
        )

    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}