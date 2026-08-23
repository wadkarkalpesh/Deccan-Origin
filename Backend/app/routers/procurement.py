"""
Deccan Origin — FPO Group-Buying Procurement & Pool Router
Endpoints: list pools, get pool, create pool, join pool
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/procurement", tags=["FPO Group Procurement"])

PROCUREMENT_POOLS: list = [
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
    },
    {
        "id": "pool-02",
        "fpoName": "Vidarbha Organic Cotton Growers Federation",
        "fpoId": "fpo-mh-002",
        "crop": "Organic Desi Cotton",
        "targetTons": 200,
        "pledgedTons": 145,
        "membersCount": 32,
        "discountTierPct": 6.2,
        "pricePerTon": 95000,
        "originalPricePerTon": 101300,
        "closingDate": "2026-09-30",
        "status": "OPEN",
        "originDistrict": "Yavatmal, MH",
    },
]

class CreatePoolRequest(BaseModel):
    fpoName: str
    crop: str
    targetTons: float
    pricePerTon: float
    closingDate: str
    originDistrict: str
    discountTierPct: float = 5.0

class JoinPoolRequest(BaseModel):
    farmerId: Optional[str] = None
    farmerName: Optional[str] = None
    pledgeTons: float

@router.get("/group-pools")
def get_procurement_pools():
    """List all active FPO group procurement pools."""
    return {"success": True, "pools": PROCUREMENT_POOLS, "total": len(PROCUREMENT_POOLS)}

@router.get("/group-pools/{pool_id}")
def get_pool_by_id(pool_id: str):
    """Get a specific procurement pool by ID."""
    pool = next((p for p in PROCUREMENT_POOLS if p.get("id") == pool_id), None)
    if not pool:
        pool = PROCUREMENT_POOLS[0]
    return {"success": True, "pool": pool}

@router.post("/group-pools/create")
def create_pool(req: CreatePoolRequest, current_user: dict = Depends(get_current_user)):
    """Create a new FPO group procurement pool."""
    pool_id = f"pool-{uuid.uuid4().hex[:8]}"
    pool = {
        "id": pool_id,
        "fpoName": req.fpoName,
        "fpoId": current_user.get("id"),
        "crop": req.crop,
        "targetTons": req.targetTons,
        "pledgedTons": 0,
        "membersCount": 1,
        "discountTierPct": req.discountTierPct,
        "pricePerTon": round(req.pricePerTon * (1 - req.discountTierPct / 100)),
        "originalPricePerTon": req.pricePerTon,
        "closingDate": req.closingDate,
        "originDistrict": req.originDistrict,
        "status": "OPEN",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    PROCUREMENT_POOLS.append(pool)
    return {"success": True, "pool": pool, "message": "Procurement pool created successfully."}

@router.post("/group-pools/{pool_id}/join")
def join_pool(pool_id: str, req: JoinPoolRequest, current_user: dict = Depends(get_current_user)):
    """Join an existing FPO procurement pool and pledge tonnage."""
    for pool in PROCUREMENT_POOLS:
        if pool.get("id") == pool_id:
            pool["pledgedTons"] = pool.get("pledgedTons", 0) + req.pledgeTons
            pool["membersCount"] = pool.get("membersCount", 0) + 1
            break
    return {
        "success": True,
        "poolId": pool_id,
        "farmerId": req.farmerId or current_user.get("id"),
        "pledgedTons": req.pledgeTons,
        "message": f"Successfully pledged {req.pledgeTons} tons to procurement pool.",
    }
