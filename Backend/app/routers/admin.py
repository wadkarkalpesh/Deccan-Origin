"""
Deccan Origin — Admin Oversight, Disputes & Platform Config Router
Endpoints: overview, platform-config, moderation-queue, audit-logs, disputes, resolve
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/admin", tags=["Admin Oversight"])

PLATFORM_CONFIG: list = [
    {"id": "cfg-01", "key": "escrow_hold_days", "value": "7", "description": "Days escrow is held before auto-release"},
    {"id": "cfg-02", "key": "commission_rate_pct", "value": "0", "description": "Platform commission (0% = zero commission model)"},
    {"id": "cfg-03", "key": "min_bulk_order_tons", "value": "5", "description": "Minimum bulk tonnage for B2B escrow"},
    {"id": "cfg-04", "key": "otp_expiry_seconds", "value": "300", "description": "OTP session expiry in seconds"},
]

AUDIT_LOGS: list = [
    {"id": "aud-101", "action": "APPROVE_ORGANIC_CERTIFICATE", "targetType": "CERTIFICATION", "targetId": "cert-01", "performedBy": "admin_01", "timestamp": "2026-01-16T10:00:00Z"},
    {"id": "aud-102", "action": "RELEASE_ESCROW", "targetType": "ORDER", "targetId": "ORD-2026-9041", "performedBy": "admin_01", "timestamp": "2026-08-21T15:30:00Z"},
]

DISPUTES_STORE: list = [
    {
        "id": "disp-901",
        "orderId": "ORD-2026-9041",
        "claimType": "Moisture Level Variance",
        "claimedBy": "Ananya Sharma (Buyer)",
        "escrowStatus": "FROZEN_PENDING_RETEST",
        "status": "SAMPLE_IN_TRANSIT_TO_LAB",
        "filedAt": "2026-08-21T10:00:00Z",
    },
]

MODERATION_QUEUE: list = []

# ── Pydantic Models ───────────────────────────────────────────────────────────

class UpdateConfigRequest(BaseModel):
    value: str
    description: Optional[str] = None

class ResolveDisputeRequest(BaseModel):
    resolution: str  # BUYER_REFUND / SELLER_PAID / SPLIT_ESCROW / ARBITRATION
    notes: Optional[str] = None
    escrowReleaseTarget: Optional[str] = "SELLER"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/overview")
def get_admin_overview(current_user: dict = Depends(get_current_user)):
    """Platform-wide GMV, farmer metrics, and escrow holdings overview."""
    return {
        "success": True,
        "metrics": {
            "totalMonthlyRevenueINR": 1245000,
            "totalTonnageDispatched": 48.5,
            "activeEscrowPoolINR": 842000,
            "verifiedFarmersCount": 3840,
            "activeFposCount": 24,
            "verifiedSellersCount": 142,
            "activeProductsCount": 7,
            "gmvTotalINR": 14580000,
            "openDisputesCount": len([d for d in DISPUTES_STORE if d.get("status") != "RESOLVED"]),
        },
    }

@router.get("/platform-config")
def get_platform_config(current_user: dict = Depends(get_current_user)):
    """Get all platform configuration parameters."""
    return {"success": True, "platformConfig": PLATFORM_CONFIG}

@router.put("/platform-config/{config_id}")
def update_platform_config(config_id: str, req: UpdateConfigRequest, current_user: dict = Depends(get_current_user)):
    """Update a specific platform configuration value."""
    for cfg in PLATFORM_CONFIG:
        if cfg["id"] == config_id:
            cfg["value"] = req.value
            if req.description:
                cfg["description"] = req.description
            cfg["updatedBy"] = current_user.get("id")
            cfg["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return {"success": True, "config": cfg}
    return {"success": False, "error": "Config key not found"}

@router.get("/moderation-queue")
def get_moderation_queue(current_user: dict = Depends(get_current_user)):
    """Get pending certifications and flagged content for moderation."""
    return {
        "success": True,
        "totalItems": len(MODERATION_QUEUE),
        "queue": MODERATION_QUEUE,
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Get admin audit trail of all platform actions."""
    return {"success": True, "auditLogs": AUDIT_LOGS[-limit:], "total": len(AUDIT_LOGS)}

@router.get("/disputes")
def get_disputes(current_user: dict = Depends(get_current_user)):
    """Get all open and resolved disputes."""
    return {"success": True, "disputes": DISPUTES_STORE, "total": len(DISPUTES_STORE)}

@router.post("/disputes/{dispute_id}/resolve")
def resolve_dispute(dispute_id: str, req: ResolveDisputeRequest, current_user: dict = Depends(get_current_user)):
    """Resolve an escrow dispute with admin decision."""
    for d in DISPUTES_STORE:
        if d.get("id") == dispute_id:
            d["status"] = "RESOLVED"
            d["resolution"] = req.resolution
            d["escrowStatus"] = f"RELEASED_TO_{req.escrowReleaseTarget}"
            d["resolvedBy"] = current_user.get("id")
            d["resolvedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            d["notes"] = req.notes
            break

    log = {
        "id": f"aud-{uuid.uuid4().hex[:6]}",
        "action": "RESOLVE_DISPUTE",
        "targetType": "DISPUTE",
        "targetId": dispute_id,
        "performedBy": current_user.get("id", "admin"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    AUDIT_LOGS.append(log)

    return {
        "success": True,
        "dispute": {"id": dispute_id, "status": "RESOLVED", "resolution": req.resolution},
        "message": "Dispute resolved and escrow settlement dispatched.",
    }
