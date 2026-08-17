from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.models import job, candidate, application
from app.routers import jobs, candidates, applications

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireVault API",
    version="1.0.0",
    description="Recruitment and hiring pipeline management system"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "HireVault API is running",
        "docs": "/docs"
    }


app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(applications.router)