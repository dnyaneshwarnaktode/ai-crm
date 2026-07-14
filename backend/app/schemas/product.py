from pydantic import BaseModel


class ProductBase(BaseModel):
    product_name: str
    category: str | None = None
    description: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True