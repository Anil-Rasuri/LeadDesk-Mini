import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_admin, hash_password, verify_password
from database import Base, SessionLocal, engine, get_db
from models import Admin, Lead
from schemas import AdminLogin, LeadCreate, LeadResponse, StatusUpdate, TokenResponse

load_dotenv()


def seed_admin() -> None:
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "")

    if not admin_email or not admin_password:
        print("Admin was not seeded: ADMIN_EMAIL or ADMIN_PASSWORD is missing.")
        return

    if len(admin_password) < 8:
        raise RuntimeError("ADMIN_PASSWORD must contain at least 8 characters.")

    db = SessionLocal()
    try:
        existing_admin = db.query(Admin).filter(Admin.email == admin_email).first()
        if existing_admin is None:
            db.add(Admin(email=admin_email, password_hash=hash_password(admin_password)))
            db.commit()
            print(f"Admin account created for {admin_email}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_admin()
    yield


app = FastAPI(
    title="LeadDesk Mini API",
    description="Lead capture and admin management API built for Digital Heroes",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_urls = os.getenv("FRONTEND_URLS", "http://localhost:5173")
allowed_origins = [url.strip().rstrip("/") for url in frontend_urls.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "LeadDesk Mini API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(
        name=payload.name,
        email=str(payload.email).lower(),
        budget=payload.budget,
        message=payload.message,
        status="New",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@app.post("/api/admin/login", response_model=TokenResponse)
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == str(payload.email).lower()).first()
    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return TokenResponse(access_token=create_access_token(admin.id))


@app.get("/api/admin/me")
def admin_profile(admin: Admin = Depends(get_current_admin)):
    return {"id": admin.id, "email": admin.email}


@app.get("/api/admin/leads", response_model=list[LeadResponse])
def list_leads(
    search: str = Query(default="", max_length=100),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    query = db.query(Lead)
    search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(Lead.name.ilike(search_term), Lead.email.ilike(search_term)))
    return query.order_by(Lead.created_at.desc()).all()


@app.patch("/api/admin/leads/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return lead
