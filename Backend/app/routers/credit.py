"""
Deccan Origin — Alternative Eco Agri-Credit Rating Router
Endpoints: farmer credit score, loan offers
"""
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/credit", tags=["Agri-Credit & Kisan Finance"])

class FarmerScoreRequest(BaseModel):
    farmerId: Optional[str] = None
    landAcres: float = 5.0
    yearsOrganicCertified: int = 3
    annualYieldTons: float = 10.0
    fpoMember: bool = True
    repaymentHistoryScore: Optional[float] = None  # 0-100

@router.post("/farmer-score")
def get_farmer_credit_score(req: FarmerScoreRequest, current_user: dict = Depends(get_current_user)):
    """
    Alternative eco agri-credit score using satellite data, organic certification,
    FPO membership, and yield history — no traditional CIBIL required.
    """
    # Scoring model
    land_score = min(req.landAcres * 2, 30)
    cert_score = min(req.yearsOrganicCertified * 5, 25)
    yield_score = min(req.annualYieldTons * 1.5, 20)
    fpo_score = 15 if req.fpoMember else 0
    history_score = req.repaymentHistoryScore or 75
    repayment_contribution = history_score * 0.1

    total_score = round(land_score + cert_score + yield_score + fpo_score + repayment_contribution)
    total_score = min(total_score, 100)

    grade = "AAA" if total_score >= 85 else ("AA" if total_score >= 75 else ("A" if total_score >= 65 else "B"))
    max_loan = round(req.landAcres * 75000)

    return {
        "success": True,
        "farmerId": req.farmerId or current_user.get("id"),
        "ecoAgroCreditScore": total_score,
        "creditGrade": grade,
        "eligible": total_score >= 50,
        "maxLoanAmountINR": max_loan,
        "subsidizedInterestRate": "4.0% per annum (Kisan Credit Scheme)",
        "bankPartners": ["State Bank of India", "NABARD", "Bank of Maharashtra", "Cooperative Bank of Maharashtra"],
        "scoreBreakdown": {
            "landOwnership": round(land_score),
            "organicCertification": round(cert_score),
            "yieldHistory": round(yield_score),
            "fpoMembership": fpo_score,
            "repaymentHistory": round(repayment_contribution),
        },
    }

@router.get("/loan-offers/{farmer_id}")
def get_loan_offers(farmer_id: str):
    """Get pre-approved loan offers for a certified organic farmer."""
    return {
        "success": True,
        "farmerId": farmer_id,
        "offers": [
            {
                "id": f"loan-{uuid.uuid4().hex[:8]}",
                "bank": "State Bank of India",
                "scheme": "Kisan Credit Card (KCC)",
                "maxAmountINR": 375000,
                "interestRatePct": 4.0,
                "tenureMonths": 12,
                "collateralRequired": False,
                "processingFeePct": 0.5,
            },
            {
                "id": f"loan-{uuid.uuid4().hex[:8]}",
                "bank": "NABARD",
                "scheme": "Organic Farmer Development Fund",
                "maxAmountINR": 500000,
                "interestRatePct": 3.0,
                "tenureMonths": 24,
                "collateralRequired": False,
                "processingFeePct": 0,
            },
        ],
    }

# Legacy alias
@router.get("/eligibility")
def check_kisan_credit_eligibility(landAcres: float = 5.0):
    max_loan = landAcres * 75000
    return {
        "success": True,
        "eligible": True,
        "maxLoanAmountINR": max_loan,
        "subsidizedInterestRate": "4.0% per annum (Kisan Credit Scheme)",
        "bankPartners": ["State Bank of India", "NABARD", "Bank of Maharashtra"],
    }
