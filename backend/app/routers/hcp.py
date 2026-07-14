from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hcp import HCP
from app.schemas.hcp import HCPCreate, HCPResponse

router = APIRouter(
    prefix="/hcp",
    tags=["HCP"],
)


@router.get("/")
def list_hcps(db: Session = Depends(get_db)):
    """List all Healthcare Professionals."""
    hcps = db.query(HCP).order_by(HCP.name.asc()).all()
    return [
        {
            "id": h.id,
            "name": h.name,
            "specialization": h.specialization,
            "hospital": h.hospital,
            "city": h.city,
            "email": h.email,
            "phone": h.phone,
        }
        for h in hcps
    ]


@router.get("/{hcp_id}")
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    """Get a single HCP by ID."""
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return HCPResponse.model_validate(hcp)


@router.post("/", response_model=HCPResponse, status_code=201)
def create_hcp(payload: HCPCreate, db: Session = Depends(get_db)):
    """Create a new HCP record."""
    existing = db.query(HCP).filter(HCP.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="HCP with this name already exists")
    hcp = HCP(**payload.model_dump())
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return HCPResponse.model_validate(hcp)