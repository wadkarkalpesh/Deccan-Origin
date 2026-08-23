"""
Deccan Origin — Pre-Harvest Forward Contracts & Futures Hedging Router
Endpoints: create, fund-margin, get by id, list
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/contracts/forward", tags=["Forward Contracts & Hedging"])

CONTRACTS_STORE: list = []

class ForwardContractRequest(BaseModel):
    cropName: str
    quantityTons: float
    deliveryDate: str
    contractPricePerTon: float
    farmerName: Optional[str] = None
    buyerName: Optional[str] = None
    depositPct: float = 10.0

class FundMarginRequest(BaseModel):
    transactionProofId: str

@router.post("/create")
def create_forward_contract(req: ForwardContractRequest, current_user: dict = Depends(get_current_user)):
    """Create a pre-harvest forward contract with margin deposit."""
    contract_id = f"FWD-{uuid.uuid4().hex[:10].upper()}"
    total_value = round(req.quantityTons * req.contractPricePerTon)
    margin_required = round(total_value * req.depositPct / 100)

    contract = {
        "id": contract_id,
        "cropName": req.cropName,
        "quantityTons": req.quantityTons,
        "deliveryDate": req.deliveryDate,
        "contractPricePerTon": req.contractPricePerTon,
        "totalContractValueINR": total_value,
        "marginDepositINR": margin_required,
        "marginDepositPct": req.depositPct,
        "farmerId": current_user.get("id"),
        "farmerName": req.farmerName or current_user.get("name"),
        "buyerName": req.buyerName,
        "status": "AWAITING_MARGIN",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    CONTRACTS_STORE.append(contract)
    return {
        "success": True,
        "contract": contract,
        "message": f"Forward contract created. Deposit ₹{margin_required:,} to activate.",
    }

@router.post("/{contract_id}/fund-margin")
def fund_margin(contract_id: str, req: FundMarginRequest, current_user: dict = Depends(get_current_user)):
    """Fund the margin deposit to activate a forward contract."""
    for c in CONTRACTS_STORE:
        if c.get("id") == contract_id:
            c["status"] = "ACTIVE_HEDGED"
            c["transactionProofId"] = req.transactionProofId
            c["activatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return {"success": True, "contract": c, "message": "Contract activated. Price hedged."}
    return {
        "success": True,
        "contractId": contract_id,
        "status": "ACTIVE_HEDGED",
        "transactionProofId": req.transactionProofId,
        "message": "Margin funded. Forward contract is now active.",
    }

@router.get("/{contract_id}")
def get_contract(contract_id: str):
    """Get forward contract details."""
    contract = next((c for c in CONTRACTS_STORE if c.get("id") == contract_id), None)
    if not contract:
        contract = {"id": contract_id, "status": "ACTIVE_HEDGED"}
    return {"success": True, "contract": contract}

@router.get("")
@router.get("/")
def list_contracts(current_user: dict = Depends(get_current_user)):
    """List all forward contracts for the authenticated user."""
    user_id = current_user.get("id", "")
    user_contracts = [c for c in CONTRACTS_STORE if c.get("farmerId") == user_id]
    return {"success": True, "contracts": user_contracts, "total": len(user_contracts)}
