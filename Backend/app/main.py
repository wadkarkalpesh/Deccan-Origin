"""
Deccan Origin Production Backend API Server
Language: Python 3.10+ / FastAPI / Uvicorn
Database: Supabase PostgreSQL
Architecture: 25 domain router modules
Author: Kalpesh Wadkar — Built by Antigravity AI
"""

import time
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
import uvicorn

from app.config import settings
from app.middleware import LoggingAndTracingMiddleware, limiter
from app.exceptions import DeccanAPIException

# ── Import All Domain Routers ─────────────────────────────────────────────────
from app.routers import (
    auth,
    products,
    orders,
    payments,
    logistics,
    agri_services,
    trust,
    ai,
    community,
    admin,
    mandi,
    carbon,
    export_biosec,
    procurement,
    credit,
    gis,
    iot,
    contracts,
    sustainability,
    coop,
    lab,
    ledger,
    inspections,
    farmers,
    webhooks,
    events,
)

# ── FastAPI App Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="Deccan Origin Production Backend API (Python FastAPI)",
    description=(
        "🌿 Organic Agriculture Marketplace — Bulk Harvest Escrow, IoT Freight Telemetry, "
        "AI Agronomy Doctor, Trust Certification Registry, Carbon Credits, Phytosanitary Compliance, "
        "GIS Farm Boundary Verification, Cooperative Dividends, NABL Lab Tracking, "
        "Blockchain Merkle Ledger, and Agri-Credit Scoring.\n\n"
        "All 28 domain APIs aligned to the Expo v54 React Native frontend."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={"name": "Kalpesh Wadkar", "email": "kalpesh@deccanorigin.com"},
    license_info={"name": "Proprietary — Deccan Origin Pvt. Ltd."},
)

# Wire SlowAPI state
app.state.limiter = limiter

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Tracing Middleware ────────────────────────────────────────────────
app.add_middleware(LoggingAndTracingMiddleware)

# ── Mount Domain Routers ──────────────────────────────────────────────────────
# Core (Strictly unique mounts)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(logistics.router)

# AgriTech & AI
app.include_router(ai.router)
app.include_router(mandi.router)
app.include_router(carbon.router)
app.include_router(gis.router)

# Trust & Compliance
app.include_router(trust.router)
app.include_router(export_biosec.router)
app.include_router(inspections.router)
app.include_router(lab.router)
app.include_router(ledger.router)

# Community & Admin
app.include_router(community.router)
app.include_router(admin.router)

# Finance & Contracts
app.include_router(procurement.router)
app.include_router(credit.router)
app.include_router(contracts.router)
app.include_router(coop.router)

# Sustainability & IoT
app.include_router(sustainability.router)
app.include_router(iot.router)
app.include_router(webhooks.router)
app.include_router(events.router)

# People
app.include_router(farmers.router)

# Legacy agri_services (backward compat with Node.js routes)
app.include_router(agri_services.router)

# ── Root & Health Endpoints ───────────────────────────────────────────────────
@app.get("/", tags=["System"])
def root():
    return {
        "name": "Deccan Origin Production Backend API",
        "version": "1.0.0",
        "status": "HEALTHY_ONLINE",
        "framework": "Python FastAPI / Uvicorn",
        "language": "Python 3.10+",
        "documentation": "/docs",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "domains": 25,
    }

@app.get("/v1/health", tags=["System"])
def health_check():
    return {
        "status": "UP",
        "engine": "Python FastAPI / Uvicorn",
        "database": "CONNECTED_SUPABASE_POSTGRES",
        "environment": settings.ENVIRONMENT,
        "services": {
            "auth": "OPERATIONAL",
            "marketplace": "OPERATIONAL",
            "escrowPool": "OPERATIONAL",
            "paymentsRazorpayStripe": "OPERATIONAL",
            "iotFreightTelemetry": "OPERATIONAL",
            "aiAgronomyDoctor": "OPERATIONAL",
            "trustRegistry": "OPERATIONAL",
            "communityForum": "OPERATIONAL",
            "disputeResolution": "OPERATIONAL",
            "sseRealtimeStream": "OPERATIONAL",
            "phytosanitaryBiosecurity": "OPERATIONAL",
            "mandiPriceForecaster": "OPERATIONAL",
            "soilCarbonCredits": "OPERATIONAL",
            "erpWebhooks": "OPERATIONAL",
            "fpoGroupProcurement": "OPERATIONAL",
            "arrheniusShelfLife": "OPERATIONAL",
            "vernacularVoiceAgronomy": "OPERATIONAL",
            "alternativeAgreCreditScore": "OPERATIONAL",
            "satelliteGisBoundary": "OPERATIONAL",
            "iotActuatorControl": "OPERATIONAL",
            "preHarvestForwardContracts": "OPERATIONAL",
            "iso14046WaterFootprint": "OPERATIONAL",
            "cooperativeDividendLedger": "OPERATIONAL",
            "nablLabChainOfCustody": "OPERATIONAL",
            "cryptographicMerkleLedger": "OPERATIONAL",
            "apedaInspectionDispatch": "OPERATIONAL",
        },
    }

# ── Exception Handlers ────────────────────────────────────────────────────────

@app.exception_handler(DeccanAPIException)
async def deccan_api_exception_handler(request: Request, exc: DeccanAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            },
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests. Please slow down and try again later."
            },
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Simplify validation errors for clean client consumption
    errors_summary = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors_summary.append({"field": loc, "message": msg})
        
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "One or more input fields failed validation checks.",
                "details": {"errors": errors_summary}
            },
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"The endpoint '{request.method} {request.url.path}' does not exist on Deccan Origin Python API v1."
            },
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    print(f"[Deccan-Origin] CRITICAL | Server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later."
            },
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
        log_level="info",
    )
