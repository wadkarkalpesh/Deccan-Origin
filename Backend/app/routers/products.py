"""
Deccan Origin — Products & Marketplace Catalog Router
Improved with async/await, strict validation constraints, and database service abstraction.
"""
import uuid
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.dependencies import get_current_user
from app.services import db
from app.exceptions import NotFoundException

router = APIRouter(prefix="/v1/products", tags=["Products Catalog"])

# ── Pydantic Models ───────────────────────────────────────────────────────────

class ProductCreateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    title: Optional[str] = Field(None, min_length=2, max_length=100)
    category: str = Field("fertilizers", pattern="^(bulkHarvest|fertilizers|bioPesticides|seeds|equipment)$")
    retailPrice: Optional[float] = Field(None, gt=0)
    price: Optional[float] = Field(None, gt=0)
    retailUnit: Optional[str] = Field("Kg", min_length=1)
    unit: Optional[str] = Field(None, min_length=1)
    sellerName: Optional[str] = Field("Malwa Organic Farmers Producer Co.", min_length=2)
    origin: Optional[str] = Field("Madhya Pradesh, India", min_length=2)
    description: Optional[str] = Field("100% Certified Organic Farm Input", min_length=5)
    bulkAvailable: bool = False
    bulkPricePerTon: Optional[float] = Field(None, ge=0)
    bulkMinTons: Optional[int] = Field(None, ge=1)
    certScheme: Optional[str] = Field(None, min_length=2)
    certNumber: Optional[str] = Field(None, min_length=2)
    certifiedOrganic: bool = True
    image: Optional[str] = None

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
@router.get("/")
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category (bulkHarvest, fertilizers, bioPesticides, seeds, equipment)"),
    certifiedType: Optional[str] = Query(None, description="Filter by certification type (NATIONAL, LOCAL_GOV)"),
    search: Optional[str] = Query(None, description="Full-text search across name, seller, origin"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    """List all products with optional filtering and pagination."""
    results = db.list_products(category=category, search=search)

    if certifiedType and certifiedType.upper() != "ALL":
        results = [p for p in results if p.get("certifiedType") == certifiedType]

    total = len(results)
    start = (page - 1) * limit
    paginated = results[start : start + limit]

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "products": paginated,
    }

@router.get("/commodity-trends")
async def get_commodity_trends():
    """Get live commodity price trends from APMC Mandis."""
    return {
        "success": True,
        "trends": db.mandi_prices,
    }

@router.get("/{product_id}")
async def get_product_by_id(product_id: str):
    """Get product detail by ID."""
    product = db.get_product(product_id)
    if not product:
        raise NotFoundException(f"Product with ID '{product_id}' not found.")
    return {"success": True, "product": product}

@router.post("")
@router.post("/")
async def create_product(req: ProductCreateRequest, current_user: dict = Depends(get_current_user)):
    """Create a new product listing (seller/farmer role)."""
    product_name = req.name or req.title or "Organic Bio-Input"
    resolved_price = req.retailPrice if req.retailPrice is not None else (req.price or 450.0)
    resolved_unit = req.retailUnit or req.unit or "Kg"
    product_id = f"prod-{uuid.uuid4().hex[:8]}"

    new_product = {
        "id": product_id,
        "name": product_name,
        "title": product_name,
        "category": req.category,
        "retailPrice": resolved_price,
        "price": resolved_price,
        "retailUnit": resolved_unit,
        "unit": resolved_unit,
        "sellerName": req.sellerName,
        "farmerId": current_user.get("id", "usr_demo"),
        "farmerName": current_user.get("name", "Deccan Farmer"),
        "origin": req.origin,
        "description": req.description,
        "bulkAvailable": req.bulkAvailable,
        "bulkPricePerTon": req.bulkPricePerTon or 0,
        "bulkMinTons": req.bulkMinTons or 1,
        "certifiedType": "NATIONAL",
        "certScheme": req.certScheme,
        "certNumber": req.certNumber,
        "certifiedOrganic": req.certifiedOrganic,
        "rating": 5.0,
        "reviewsCount": 0,
        "image": req.image or "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
        "inStock": True,
    }
    
    db.add_product(new_product)
    
    return {
        "success": True,
        "message": "Product listed successfully on Deccan Origin Marketplace",
        "productId": product_id,
        "product": new_product,
    }
