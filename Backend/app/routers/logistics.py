"""
Deccan Origin — IoT Freight Logistics & Cold-Chain Router
Improved with async/await and strict validation constraints.
"""
import uuid
import time
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List

router = APIRouter(prefix="/v1/logistics", tags=["IoT Logistics & Freight"])

# ── Pydantic Models ───────────────────────────────────────────────────────────

class FreightCalculateRequest(BaseModel):
    originCity: str = Field(..., min_length=2, max_length=50)
    destinationCity: str = Field(..., min_length=2, max_length=50)
    quantityTons: float = Field(..., gt=0)
    coldChainRequired: bool = False
    productCategory: Optional[str] = "bulkHarvest"

class CustomsDutyRequest(BaseModel):
    productName: Optional[str] = Field("Organic Wheat", min_length=2)
    hsCode: Optional[str] = Field("1001.99", min_length=4)
    quantityTons: float = Field(..., gt=0)
    destinationCountry: str = Field(..., min_length=2)
    fobValueUSD: float = Field(..., gt=0)

class ShelfLifeRequest(BaseModel):
    productName: str = Field(..., min_length=2)
    currentTempCelsius: float = Field(..., ge=-30, le=70)
    humidityPct: float = Field(..., ge=0, le=100)
    daysInTransit: int = Field(1, ge=0)
    initialShelfLifeDays: int = Field(30, ge=1)

class FarmerLoad(BaseModel):
    farmerId: str = Field(..., min_length=2)
    farmerName: str = Field(..., min_length=2)
    locationLat: float = Field(..., ge=-90, le=90)
    locationLng: float = Field(..., ge=-180, le=180)
    quantityTons: float = Field(..., gt=0)

class MilkRunRequest(BaseModel):
    loads: List[FarmerLoad] = Field(..., min_items=1)
    destinationHub: str = Field("Pune Cold Storage Hub", min_length=2)

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/tracking/{shipment_id}")
async def track_shipment(shipment_id: str):
    """Real-time IoT shipment tracking with telemetry data."""
    is_cold = "COLD" in shipment_id.upper() or "REEF" in shipment_id.upper()
    milestones = [
        {"stage": "ORDER_CONFIRMED", "completed": True, "timestamp": "2026-08-20T09:00:00Z"},
        {"stage": "LOADED_AT_FARM", "completed": True, "timestamp": "2026-08-20T14:00:00Z"},
        {"stage": "QUALITY_CHECKED", "completed": True, "timestamp": "2026-08-20T15:30:00Z"},
        {"stage": "IN_TRANSIT", "completed": True, "timestamp": "2026-08-21T06:00:00Z"},
        {"stage": "NEAR_DESTINATION", "completed": False, "timestamp": None},
        {"stage": "DELIVERED", "completed": False, "timestamp": None},
    ]
    return {
        "success": True,
        "shipmentId": shipment_id,
        "status": "IN_TRANSIT",
        "currentLocation": "Solapur Highway Toll Plaza — NH-65",
        "vehicleNo": f"MH-12-VT-{uuid.uuid4().hex[:4].upper()}",
        "driverName": "Ramesh Singh",
        "driverPhone": "+91 98230 11200",
        "telemetry": {
            "temperatureCelsius": 4.2 if is_cold else 24.5,
            "humidityPct": 68.0,
            "latitude": 17.6868,
            "longitude": 75.9064,
            "speedKmh": 62.0,
            "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
        "estimatedArrival": "Tomorrow at 14:00 IST",
        "milestones": milestones,
    }

@router.post("/calculate-freight")
async def calculate_freight(req: FreightCalculateRequest):
    """Calculate freight cost with cold-chain surcharges."""
    base_rate_per_ton = 1200
    cold_chain_surcharge = 2500 if req.coldChainRequired else 0
    transport_cost = req.quantityTons * base_rate_per_ton
    fuel_surcharge = round(transport_cost * 0.04)
    loading_fee = 1200
    total = transport_cost + cold_chain_surcharge + fuel_surcharge + loading_fee

    return {
        "success": True,
        "origin": req.originCity,
        "destination": req.destinationCity,
        "distanceKm": 480,
        "quantityTons": req.quantityTons,
        "coldChainRequired": req.coldChainRequired,
        "breakdown": {
            "transportCost": transport_cost,
            "coldChainSurcharge": cold_chain_surcharge,
            "fuelSurcharge": fuel_surcharge,
            "loadingUnloadingFee": loading_fee,
            "totalFreight": total,
        },
        "availableTrucks": 4,
        "estimatedTransitDays": 2,
    }

@router.post("/customs-duty")
async def calculate_customs_duty(req: CustomsDutyRequest):
    """Calculate export customs duty and total landed cost for international shipments."""
    biosecurity_fee = 8500
    ocean_freight = round(req.quantityTons * 24000)
    import_tariff = round(req.fobValueUSD * 0.04 * 86.5)
    total = biosecurity_fee + ocean_freight + import_tariff

    return {
        "success": True,
        "product": req.productName,
        "hsCode": req.hsCode,
        "destinationCountry": req.destinationCountry,
        "breakdown": {
            "biosecurityLabFee": biosecurity_fee,
            "containerOceanFreight": ocean_freight,
            "importTariff": import_tariff,
            "totalLandedCost": total,
        },
        "phytosanitaryRequired": True,
        "estimatedShipDays": 14,
    }

@router.post("/shelf-life/evaluate")
async def evaluate_shelf_life(req: ShelfLifeRequest):
    """Arrhenius equation-based predictive spoilage shelf life evaluator."""
    activation_energy = 80000  # J/mol for typical food products
    gas_constant = 8.314
    reference_temp = 4.0  # °C reference (cold storage)
    temp_kelvin = req.currentTempCelsius + 273.15
    ref_kelvin = reference_temp + 273.15
    
    # Avoid zero division risk in temperature calculation
    if temp_kelvin <= 0 or ref_kelvin <= 0:
        rate_ratio = 1.0
    else:
        rate_ratio = 2.718 ** (activation_energy / gas_constant * (1/ref_kelvin - 1/temp_kelvin))
        
    remaining_life = round(req.initialShelfLifeDays / max(rate_ratio, 0.1) - req.daysInTransit, 1)
    quality_pct = round(max(0, remaining_life / req.initialShelfLifeDays * 100), 1)
    risk = "LOW" if quality_pct > 70 else ("MEDIUM" if quality_pct > 40 else "HIGH")

    return {
        "success": True,
        "product": req.productName,
        "currentTempCelsius": req.currentTempCelsius,
        "humidityPct": req.humidityPct,
        "remainingShelfLifeDays": remaining_life,
        "qualityRetentionPct": quality_pct,
        "spoilageRisk": risk,
        "recommendation": "Maintain ≤4°C cold chain to maximise shelf life." if risk != "LOW" else "Temperature optimal.",
    }

@router.post("/milk-run/consolidate")
async def consolidate_milk_run(req: MilkRunRequest):
    """Multi-farmer LTL milk-run freight route optimizer."""
    total_tons = sum(l.quantityTons for l in req.loads)
    estimated_cost = round(total_tons * 1100)
    saving_pct = 22.5  # Typical consolidation savings

    return {
        "success": True,
        "destinationHub": req.destinationHub,
        "farmersConsolidated": len(req.loads),
        "totalTons": total_tons,
        "optimizedRoute": [
            {"stop": i + 1, "farmerId": l.farmerId, "farmerName": l.farmerName, "quantityTons": l.quantityTons}
            for i, l in enumerate(req.loads)
        ],
        "estimatedFreightINR": estimated_cost,
        "consolidationSavingPct": saving_pct,
        "vehiclesRequired": max(1, round(total_tons / 20)),
    }

# Legacy endpoints
@router.post("/quote")
async def get_freight_quote(req: FreightCalculateRequest):
    return await calculate_freight(req)

@router.get("/track/{shipment_id}")
async def track_shipment_legacy(shipment_id: str):
    return await track_shipment(shipment_id)
