"""
Deccan Origin — IoT Actuator Control & Cold Storage Telemetry Router
Endpoints: send-command, get-status
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/iot/actuators", tags=["IoT Actuator Control"])

CONTAINER_STATES: dict = {
    "CONT-REEFER-9921": {
        "containerId": "CONT-REEFER-9921",
        "type": "REFRIGERATED_CONTAINER",
        "temperatureCelsius": 4.2,
        "humidityPct": 68.0,
        "compressorStatus": "RUNNING",
        "doorStatus": "CLOSED",
        "powerStatus": "ON_GRID",
        "lastUpdated": "2026-08-22T18:00:00Z",
    }
}

class ActuatorCommandRequest(BaseModel):
    containerId: str = "CONT-REEFER-9921"
    commandType: str  # SET_TEMP, SET_HUMIDITY, TOGGLE_COMPRESSOR, LOCK_DOOR
    payload: Optional[Dict[str, Any]] = {}

@router.post("/send-command")
def send_actuator_command(req: ActuatorCommandRequest, current_user: dict = Depends(get_current_user)):
    """Send IoT control command to refrigerated container actuator."""
    command_id = f"cmd-{uuid.uuid4().hex[:10]}"
    container = CONTAINER_STATES.setdefault(req.containerId, {
        "containerId": req.containerId,
        "temperatureCelsius": 4.0,
        "humidityPct": 68.0,
        "compressorStatus": "RUNNING",
        "doorStatus": "CLOSED",
    })

    # Apply command
    if req.commandType == "SET_TEMP":
        container["temperatureCelsius"] = req.payload.get("targetTempC", container["temperatureCelsius"])
    elif req.commandType == "SET_HUMIDITY":
        container["humidityPct"] = req.payload.get("targetHumidityPct", container["humidityPct"])
    elif req.commandType == "TOGGLE_COMPRESSOR":
        container["compressorStatus"] = "STOPPED" if container.get("compressorStatus") == "RUNNING" else "RUNNING"
    elif req.commandType == "LOCK_DOOR":
        container["doorStatus"] = "LOCKED"

    container["lastUpdated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    return {
        "success": True,
        "commandId": command_id,
        "containerId": req.containerId,
        "commandType": req.commandType,
        "payload": req.payload,
        "acknowledged": True,
        "executedAt": container["lastUpdated"],
        "currentState": container,
    }

@router.get("/{container_id}/status")
def get_container_status(container_id: str):
    """Get current IoT telemetry status of a refrigerated container."""
    container = CONTAINER_STATES.get(container_id, {
        "containerId": container_id,
        "type": "REFRIGERATED_CONTAINER",
        "temperatureCelsius": 4.2,
        "humidityPct": 68.0,
        "compressorStatus": "RUNNING",
        "doorStatus": "CLOSED",
        "powerStatus": "ON_GRID",
        "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    return {"success": True, "status": container}
