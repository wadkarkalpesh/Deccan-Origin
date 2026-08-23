"""
Deccan Origin — Production-Grade Database Persistence Layer
Supports Supabase PostgreSQL integration with a local in-memory fallback for development.
"""
from typing import List, Dict, Any, Optional
import time
import uuid
from supabase import create_client, Client
from app.config import settings

# Load initial static mock data for fallback/development
from app.data.mock_data import PRODUCTS_DATA, USERS_DB as INITIAL_USERS_DB, MANDI_PRICES_DATA

class DatabaseService:
    def __init__(self):
        self.supabase_client: Optional[Client] = None
        self.use_supabase = False

        # Verify if Supabase URL and Key are set to real values (not placeholders)
        has_real_url = settings.SUPABASE_URL and "xyz-deccan-origin" not in settings.SUPABASE_URL
        has_real_key = settings.SUPABASE_KEY and "anon-key" not in settings.SUPABASE_KEY and "your-supabase" not in settings.SUPABASE_KEY

        if has_real_url and has_real_key:
            try:
                self.supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                self.use_supabase = True
                print("[Deccan-Origin] INFO | Supabase PostgreSQL Database Client connected successfully.")
            except Exception as e:
                print(f"[Deccan-Origin] WARNING | Failed to connect to Supabase: {e}. Falling back to in-memory database.")
        else:
            print("[Deccan-Origin] INFO | Using in-memory fallback database. Set real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist data.")

        # In-memory collections (used when self.use_supabase is False)
        self._products: List[Dict[str, Any]] = list(PRODUCTS_DATA)
        self._users: Dict[str, Dict[str, Any]] = {k.lower(): dict(v) for k, v in INITIAL_USERS_DB.items()}
        self._orders: List[Dict[str, Any]] = []
        self._messages: Dict[str, List[Dict[str, Any]]] = {}
        self.mandi_prices: List[Dict[str, Any]] = list(MANDI_PRICES_DATA)
        
        # Certifications
        self.certifications: List[Dict[str, Any]] = [
            {
                "id": "cert-01",
                "name": "Jaivik Bharat NPOP Standard",
                "certNumber": "NPOP/NAB/0014/2025",
                "authority": "APEDA Ministry of Commerce",
                "type": "NATIONAL",
                "validCount": 1420,
                "validUntil": "2027-12-31",
                "labPurityRating": "100% Pesticide-Residue Free (0.00 ppm)",
                "status": "ACTIVE",
                "blockchainHash": "0x89aef41098bcae8841920acde817420194bc",
            },
            {
                "id": "cert-02",
                "name": "PGS-India Green Local Organic",
                "certNumber": "PGS-IND-MH-8841",
                "authority": "Ministry of Agriculture",
                "type": "LOCAL_GOV",
                "validCount": 890,
                "validUntil": "2027-06-30",
                "labPurityRating": "Zero Chemical Additives",
                "status": "ACTIVE",
                "blockchainHash": "0x7c2ef11098abcd8841920ecba817420011ab",
            }
        ]
        self.cert_uploads: List[Dict[str, Any]] = []
        self.carbon_credits: List[Dict[str, Any]] = []
        self.procurement_pools: List[Dict[str, Any]] = [
            {
                "id": "pool-01",
                "fpoName": "Malwa Narmada Organic Farmers Producer Co. Ltd.",
                "fpoId": "fpo-mh-001",
                "crop": "Organic Sharbati Wheat",
                "targetTons": 500,
                "pledgedTons": 380,
                "membersCount": 48,
                "discountTierPct": 8.5,
                "pricePerTon": 38430,
                "originalPricePerTon": 42000,
                "closingDate": "2026-09-15",
                "status": "OPEN",
                "originDistrict": "Sehore, MP",
            }
        ]
        self.bookings: List[Dict[str, Any]] = []
        self.posts: List[Dict[str, Any]] = [
            {
                "id": "post-01",
                "author": "Dr. Anita Roy",
                "authorId": "usr_expert_01",
                "persona": "agronomist",
                "title": "Bio-Fertilizer Application Timing during Monsoon",
                "content": "When should we apply Jeevamrutha during heavy monsoon months? Sharing my experience.",
                "category": "Agronomy",
                "tags": ["fertilizer", "monsoon"],
                "upvotes": 42,
                "repliesCount": 15,
                "isExpertAnswer": True,
                "createdAt": "2026-08-18T08:30:00Z",
                "answers": [],
            }
        ]
        self.forward_contracts: List[Dict[str, Any]] = []
        self.inspections: List[Dict[str, Any]] = []

    # --- User Operations ---
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            try:
                res = self.supabase_client.table("users").select("*").eq("email", email.lower()).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase get_user_by_email failed: {e}")
        return self._users.get(email.lower())

    def create_user(self, email: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        email_lower = email.lower()
        if self.use_supabase:
            try:
                # Upsert query
                self.supabase_client.table("users").upsert({
                    "email": email_lower,
                    **user_data
                }).execute()
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase create_user failed: {e}")
        self._users[email_lower] = user_data
        return user_data

    # --- Product Operations ---
    def list_products(self, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.use_supabase:
            try:
                query = self.supabase_client.table("products").select("*")
                if category and category.lower() not in ("all", ""):
                    query = query.eq("category", category)
                
                res = query.execute()
                products_list = res.data or []
                
                if search:
                    q = search.lower()
                    products_list = [
                        p for p in products_list
                        if q in p.get("name", "").lower()
                        or q in p.get("sellerName", "").lower()
                        or q in p.get("origin", "").lower()
                        or q in p.get("description", "").lower()
                    ]
                return products_list
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase list_products failed: {e}")

        # Fallback to local memory lists
        res = self._products
        if category and category.lower() not in ("all", ""):
            res = [p for p in res if p.get("category") == category]
        if search:
            q = search.lower()
            res = [
                p for p in res
                if q in p.get("name", "").lower()
                or q in p.get("sellerName", "").lower()
                or q in p.get("origin", "").lower()
                or q in p.get("description", "").lower()
            ]
        return res

    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            try:
                res = self.supabase_client.table("products").select("*").eq("id", product_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase get_product failed: {e}")
        return next((p for p in self._products if p.get("id") == product_id), None)

    def add_product(self, product: Dict[str, Any]):
        if self.use_supabase:
            try:
                self.supabase_client.table("products").insert(product).execute()
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase add_product failed: {e}")
        self._products.append(product)

    # --- Order Operations ---
    def create_order(self, order: Dict[str, Any]):
        if self.use_supabase:
            try:
                self.supabase_client.table("orders").insert(order).execute()
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase create_order failed: {e}")
        self._orders.append(order)

    def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            try:
                res = self.supabase_client.table("orders").select("*").eq("buyerId", user_id).execute()
                return res.data or []
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase get_user_orders failed: {e}")
        return [o for o in self._orders if o.get("buyerId") == user_id]

    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            try:
                res = self.supabase_client.table("orders").select("*").eq("id", order_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase get_order failed: {e}")
        return next((o for o in self._orders if o.get("id") == order_id), None)

    def update_order_status(self, order_id: str, status: str, escrow_status: str) -> bool:
        updated = False
        if self.use_supabase:
            try:
                res = self.supabase_client.table("orders").update({
                    "status": status,
                    "escrowStatus": escrow_status
                }).eq("id", order_id).execute()
                if res.data:
                    updated = True
            except Exception as e:
                print(f"[Deccan-Origin] ERROR | Supabase update_order_status failed: {e}")
        
        for o in self._orders:
            if o.get("id") == order_id:
                o["status"] = status
                o["escrowStatus"] = escrow_status
                updated = True
        return updated

# Global database instance
db = DatabaseService()
