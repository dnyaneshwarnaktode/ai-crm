from pydantic import BaseModel


class HCPBase(BaseModel):

    name: str

    specialization: str | None = None

    hospital: str | None = None

    city: str | None = None

    email: str | None = None

    phone: str | None = None


class HCPCreate(HCPBase):
    pass


class HCPResponse(HCPBase):

    id: int

    class Config:
        from_attributes = True