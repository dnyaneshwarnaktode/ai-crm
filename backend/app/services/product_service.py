from sqlalchemy.orm import Session

from app.models.product import Product


class ProductService:

    def __init__(self, db: Session):

        self.db = db

    def get_or_create(self, name: str):

        product = (

            self.db.query(Product)

            .filter(

                Product.product_name == name

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