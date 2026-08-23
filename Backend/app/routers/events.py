"""
Deccan Origin — Server-Sent Events (SSE) Real-Time Stream Router
Emits live events: price updates, IoT telemetry, order status changes
"""
import asyncio
import json
import time
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/v1/events", tags=["Real-Time SSE Stream"])

async def event_generator():
    """Generate periodic SSE events for live updates."""
    events = [
        {"type": "MANDI_PRICE_UPDATE", "crop": "Sharbati Wheat", "pricePerTon": 42000, "change": "+2.4%"},
        {"type": "IOT_TELEMETRY", "containerId": "CONT-REEFER-9921", "tempC": 4.2, "humidityPct": 68.0},
        {"type": "ORDER_STATUS", "orderId": "ORD-2026-9041", "status": "IN_TRANSIT"},
        {"type": "ESCROW_ALERT", "orderId": "ORD-2026-9041", "escrowStatus": "HELD_IN_ESCROW_POOL"},
        {"type": "SYSTEM_HEALTH", "status": "UP", "version": "1.0.0"},
    ]
    event_index = 0
    while True:
        payload = {
            **events[event_index % len(events)],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "sequenceNo": event_index + 1,
        }
        yield {"event": "deccan_update", "data": json.dumps(payload)}
        event_index += 1
        await asyncio.sleep(5)

@router.get("/stream")
async def event_stream():
    """
    Server-Sent Events stream for real-time platform updates.
    Connect with: EventSource('http://localhost:8000/v1/events/stream')
    """
    return EventSourceResponse(event_generator())
