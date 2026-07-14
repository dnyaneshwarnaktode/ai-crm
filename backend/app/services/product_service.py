from sqlalchemy.orm import Session

from app.models.product import Product


class ProductService:

    def __init__(self, db: Session):

        self.db = db

    def get_or_create(self, name: str):
        from sqlalchemy import func
        product = (
            self.db.query(Product)
            .filter(
                func.lower(Product.product_name) == name.lower()
            )
            .first()
        )

        if product:
            return product

        product = Product(
            product_name=name
        )

        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product