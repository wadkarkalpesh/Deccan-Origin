"""
Deccan Origin — Farmer Directory & Cluster Management Router
"""
from fastapi import APIRouter
from app.data.mock_data import PRODUCTS_DATA
from typing import Optional

router = APIRouter(prefix="/v1/farmers", tags=["Farmer Directory"])

# Build farmer profiles from product data
FARMERS = [
    {
        "id": "usr_farmer_01",
        "name": "Ramesh Patel",
        "state": "Madhya Pradesh",
        "district": "Sehore",
        "persona": "farmer",
        "landAcres": 10.5,
        "yearsOrganicCertified": 8,
        "certName": "Jaivik Bharat NPOP (APEDA)",
        "trustScore": 98,
        "verified": True,
        "productsCount": 2,
        "fpoMember": True,
        "fpoName": "Malwa Narmada Organic Farmers Producer Co. Ltd.",
        "profileImage": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "usr_farmer_04",
        "name": "Gurpreet Singh Dhillon",
        "state": "Punjab",
        "district": "Bathinda",
        "persona": "farmer",
        "landAcres": 25.0,
        "yearsOrganicCertified": 5,
        "certName": "APEDA NPOP & Punjab Organic Board",
        "trustScore": 95,
        "verified": True,
        "productsCount": 1,
        "fpoMember": True,
        "fpoName": "Malwa Progressive Organic Growers Society",
        "profileImage": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=80",
    },
    {
        "id": "usr_farmer_03",
        "name": "Savita Devi",
        "state": "Maharashtra",
        "district": "Satara",
        "persona": "farmer",
        "landAcres": 5.0,
        "yearsOrganicCertified": 6,
        "certName": "PGS-India Green Local Organic Seal",
        "trustScore": 97,
        "verified": True,
        "productsCount": 1,
        "fpoMember": True,
        "fpoName": "Krishna Valley Women Farmer Producer Co-op",
        "profileImage": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=200&auto=format&fit=crop&q=80",
    },
]

@router.get("")
@router.get("/")
def list_farmers(state: Optional[str] = None, search: Optional[str] = None):
    """Get farmer directory with optional state and search filtering."""
    farmers = list(FARMERS)
    if state:
        farmers = [f for f in farmers if state.lower() in f.get("state", "").lower()]
    if search:
        q = search.lower()
        farmers = [f for f in farmers if q in f.get("name", "").lower() or q in f.get("district", "").lower()]
    return {"success": True, "farmers": farmers, "total": len(farmers)}

@router.get("/{farmer_id}")
def get_farmer_profile(farmer_id: str):
    """Get detailed farmer profile with products and certifications."""
    farmer = next((f for f in FARMERS if f.get("id") == farmer_id), None)
    if not farmer:
        farmer = FARMERS[0]
    farmer_products = [p for p in PRODUCTS_DATA if p.get("farmerId") == farmer_id]
    return {"success": True, "farmer": farmer, "products": farmer_products}
