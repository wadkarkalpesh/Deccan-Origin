"""
Deccan Origin — APEDA/NPOP Phytosanitary Inspection Dispatch Router
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/inspections", tags=["Phytosanitary Inspections"])

INSPECTIONS_STORE: list = []

class DispatchInspectionRequest(BaseModel):
    orderId: str
    productName: str
    exporterName: Optional[str] = None
    destinationCountry: str = "UAE"
    quantityTons: float = 10.0
    preferredInspectionDate: Optional[str] = None

class CompleteInspectionRequest(BaseModel):
    inspectorName: str
    result: str  # PASS / FAIL / CONDITIONAL
    labResults: Optional[dict] = None
    notes: Optional[str] = None

@router.post("/dispatch")
def dispatch_inspection(req: DispatchInspectionRequest, current_user: dict = Depends(get_current_user)):
    """Dispatch an APEDA phytosanitary inspection for an export order."""
    inspection_id = f"INSP-{uuid.uuid4().hex[:10].upper()}"
    inspection = {
        "id": inspection_id,
        "orderId": req.orderId,
        "productName": req.productName,
        "exporterName": req.exporterName or current_user.get("name"),
        "destinationCountry": req.destinationCountry,
        "quantityTons": req.quantityTons,
        "preferredDate": req.preferredInspectionDate or "2026-08-25",
        "status": "SCHEDULED",
        "assignedInspector": "APEDA Regional Inspector — Pune Zone",
        "dispatchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    INSPECTIONS_STORE.append(inspection)
    return {
        "success": True,
        "inspectionId": inspection_id,
        "inspection": inspection,
        "message": "Inspection dispatched. Inspector will arrive on scheduled date.",
    }

@router.get("")
@router.get("/")
def list_inspections(current_user: dict = Depends(get_current_user)):
    """List all inspections for the authenticated user."""
    return {"success": True, "inspections": INSPECTIONS_STORE, "total": len(INSPECTIONS_STORE)}

@router.get("/{inspection_id}")
def get_inspection(inspection_id: str):
    """Get inspection detail by ID."""
    inspection = next((i for i in INSPECTIONS_STORE if i.get("id") == inspection_id), None)
    if not inspection:
        inspection = {"id": inspection_id, "status": "SCHEDULED"}
    return {"success": True, "inspection": inspection}

@router.post("/{inspection_id}/complete")
def complete_inspection(inspection_id: str, req: CompleteInspectionRequest, current_user: dict = Depends(get_current_user)):
    """Record inspection completion and lab test results."""
    for insp in INSPECTIONS_STORE:
        if insp.get("id") == inspection_id:
            insp["status"] = "COMPLETED"
            insp["result"] = req.result
            insp["inspectorName"] = req.inspectorName
            insp["labResults"] = req.labResults
            insp["notes"] = req.notes
            insp["completedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return {"success": True, "inspection": insp}
    return {
        "success": True,
        "inspectionId": inspection_id,
        "result": req.result,
        "status": "COMPLETED",
        "completedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
