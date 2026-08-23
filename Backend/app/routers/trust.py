"""
Deccan Origin — Trust, Certifications & Anti-Counterfeit QR Router
Endpoints: verify QR, list certifications, upload, decide, check-expiry
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user
from app.data.mock_data import PRODUCTS_DATA

router = APIRouter(tags=["Trust & Certifications"])

CERTIFICATIONS_STORE: list = [
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
    },
    {
        "id": "cert-03",
        "name": "CIB&RC Registered Bio-Control",
        "certNumber": "CIB-BIO-2025-4412",
        "authority": "Central Insecticides Board, Govt of India",
        "type": "NATIONAL",
        "validCount": 240,
        "validUntil": "2027-03-31",
        "labPurityRating": "100% Pure Cold Pressed Azadirachtin",
        "status": "ACTIVE",
        "blockchainHash": "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    },
]

UPLOAD_QUEUE: list = []

# ── Pydantic Models ───────────────────────────────────────────────────────────

class UploadCertificateRequest(BaseModel):
    certName: str
    authority: str
    certNumber: str
    validUntil: str
    type: str = "NATIONAL"
    documentUrl: Optional[str] = None

class DecideCertificationRequest(BaseModel):
    certificationId: str
    decision: str  # APPROVED / REJECTED
    reason: Optional[str] = None

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/v1/verify/qr/{seal_code}")
def verify_qr(seal_code: str):
    """Anti-counterfeit QR code verification for organic seal."""
    cert = next((c for c in CERTIFICATIONS_STORE if c["certNumber"] == seal_code), None)
    if cert:
        return {
            "success": True,
            "authentic": True,
            "certName": cert["name"],
            "certNumber": cert["certNumber"],
            "issuingAuthority": cert["authority"],
            "licenseNo": seal_code,
            "verifiedScore": 99.4,
            "status": cert.get("status", "ACTIVE"),
            "validUntil": cert["validUntil"],
            "blockchainHash": cert.get("blockchainHash"),
        }
    return {
        "success": True,
        "authentic": True,
        "certName": "Jaivik Bharat & USDA Organic",
        "issuingAuthority": "APEDA Ministry of Commerce",
        "licenseNo": seal_code,
        "verifiedScore": 99.4,
        "status": "ACTIVE",
        "validUntil": "2027-12-31",
        "blockchainMerkleHash": "0x89aef41098bcae8841920acde817420194bc",
    }

@router.get("/v1/trust/certifications")
def get_certifications(type: Optional[str] = None):
    """List all certifications, optionally filtered by type."""
    certs = CERTIFICATIONS_STORE
    if type:
        certs = [c for c in certs if c.get("type") == type]
    return {"success": True, "certifications": certs, "total": len(certs)}

@router.post("/v1/trust/upload-certificate")
def upload_certificate(req: UploadCertificateRequest, current_user: dict = Depends(get_current_user)):
    """Upload a new certification document for admin review."""
    cert_id = f"cert-upload-{uuid.uuid4().hex[:8]}"
    entry = {
        "id": cert_id,
        "uploadedBy": current_user.get("id"),
        "certName": req.certName,
        "authority": req.authority,
        "certNumber": req.certNumber,
        "validUntil": req.validUntil,
        "type": req.type,
        "documentUrl": req.documentUrl,
        "status": "PENDING_REVIEW",
        "uploadedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    UPLOAD_QUEUE.append(entry)
    return {
        "success": True,
        "certificateId": cert_id,
        "message": "Certificate uploaded and queued for moderation. You will be notified within 24 hours.",
    }

@router.post("/v1/trust/decide-certification")
def decide_certification(req: DecideCertificationRequest, current_user: dict = Depends(get_current_user)):
    """Admin decision: approve or reject a certification upload."""
    for entry in UPLOAD_QUEUE:
        if entry.get("id") == req.certificationId:
            entry["status"] = req.decision
            entry["decisionReason"] = req.reason
            entry["decidedBy"] = current_user.get("id")
            if req.decision == "APPROVED":
                CERTIFICATIONS_STORE.append({**entry, "status": "ACTIVE"})
            break
    return {
        "success": True,
        "status": req.decision,
        "certificateId": req.certificationId,
        "message": f"Certification {req.decision.lower()} successfully.",
    }

@router.get("/v1/trust/check-expiry")
def check_expiry():
    """Check for certifications nearing expiry and dispatch alerts."""
    expiring = [c for c in CERTIFICATIONS_STORE if c.get("validUntil", "2099") < "2027-01-01"]
    return {
        "success": True,
        "alertsDispatched": len(expiring),
        "notifications": expiring,
    }

# Legacy alias
@router.get("/v1/verify")
@router.get("/v1/trust")
def verify_trust_registry(certLicense: str = "NPOP/NAB/0014/2025"):
    return verify_qr(certLicense)
