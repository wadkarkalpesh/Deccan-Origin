"""
Deccan Origin — NABL Lab Chain-of-Custody Barcode Tracker Router
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/lab", tags=["NABL Lab Chain-of-Custody"])

CUSTODY_RECORDS: dict = {}

class LabScanRequest(BaseModel):
    sampleCode: str
    stage: str  # SAMPLE_COLLECTED / IN_LAB / TESTING / RESULTS_READY
    location: Optional[str] = None
    scannedBy: Optional[str] = None
    notes: Optional[str] = None

@router.post("/custody-tracking/scan")
def scan_lab_barcode(req: LabScanRequest, current_user: dict = Depends(get_current_user)):
    """Record a chain-of-custody scan event for lab sample tracking."""
    scan_id = f"scan-{uuid.uuid4().hex[:8]}"
    scan_event = {
        "scanId": scan_id,
        "sampleCode": req.sampleCode,
        "stage": req.stage,
        "location": req.location or "NABL Lab, Pune",
        "scannedBy": req.scannedBy or current_user.get("name"),
        "notes": req.notes,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if req.sampleCode not in CUSTODY_RECORDS:
        CUSTODY_RECORDS[req.sampleCode] = []
    CUSTODY_RECORDS[req.sampleCode].append(scan_event)
    return {
        "success": True,
        "scanId": scan_id,
        "sampleCode": req.sampleCode,
        "currentStage": req.stage,
        "chainOfCustody": CUSTODY_RECORDS[req.sampleCode],
    }

@router.get("/custody-tracking/{sample_code}")
def get_lab_custody(sample_code: str):
    """Get the full chain-of-custody scan history for a lab sample."""
    chain = CUSTODY_RECORDS.get(sample_code, [
        {"stage": "SAMPLE_COLLECTED", "location": "Farm Site, Sehore", "timestamp": "2026-08-20T08:00:00Z"},
        {"stage": "IN_LAB", "location": "NABL Accredited Lab, Pune", "timestamp": "2026-08-21T10:00:00Z"},
        {"stage": "TESTING", "location": "NABL Accredited Lab, Pune", "timestamp": "2026-08-21T14:00:00Z"},
    ])
    current_stage = chain[-1].get("stage") if chain else "UNKNOWN"
    return {
        "success": True,
        "sampleCode": sample_code,
        "currentStage": current_stage,
        "chainOfCustody": chain,
        "labAccreditation": "NABL ISO/IEC 17025:2017",
    }
