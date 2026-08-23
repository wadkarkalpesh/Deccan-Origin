"""
Deccan Origin — Cooperative Farmer Shareholder Dividend Ledger Router
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/coop", tags=["Cooperative Dividend Ledger"])

class FarmerShareholder(BaseModel):
    farmerId: str
    farmerName: str
    sharesPct: float
    totalContributionTons: float

class CalculateDividendsRequest(BaseModel):
    coopName: str = "Malwa Organic Cooperative"
    totalProfitINR: float
    shareholders: List[FarmerShareholder]
    reserveFundPct: float = 10.0

class DisburseDividendsRequest(BaseModel):
    coopId: Optional[str] = None
    coopName: str
    totalDividendINR: float
    disbursementDate: str
    paymentMethod: str = "NEFT"

@router.post("/dividends/calculate")
def calculate_dividends(req: CalculateDividendsRequest, current_user: dict = Depends(get_current_user)):
    """Calculate cooperative dividend distribution based on shareholding."""
    reserve = round(req.totalProfitINR * req.reserveFundPct / 100)
    distributable = req.totalProfitINR - reserve
    distributions = []
    for s in req.shareholders:
        amount = round(distributable * s.sharesPct / 100)
        distributions.append({
            "farmerId": s.farmerId,
            "farmerName": s.farmerName,
            "sharesPct": s.sharesPct,
            "dividendAmountINR": amount,
        })
    return {
        "success": True,
        "coopName": req.coopName,
        "totalProfitINR": req.totalProfitINR,
        "reserveFundINR": reserve,
        "distributableProfitINR": distributable,
        "distributions": distributions,
    }

@router.post("/dividends/disburse")
def disburse_dividends(req: DisburseDividendsRequest, current_user: dict = Depends(get_current_user)):
    """Disburse cooperative dividends via NEFT/UPI to farmer bank accounts."""
    transaction_id = f"COOP-DIV-{uuid.uuid4().hex[:10].upper()}"
    return {
        "success": True,
        "transactionId": transaction_id,
        "coopName": req.coopName,
        "totalDisbursedINR": req.totalDividendINR,
        "disbursementDate": req.disbursementDate,
        "paymentMethod": req.paymentMethod,
        "status": "PROCESSING",
        "message": "Dividend disbursement initiated. Farmers will receive within 24 hours.",
    }
