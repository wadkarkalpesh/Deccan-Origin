"""
Deccan Origin — Enterprise ERP Webhook Subscription Router
(SAP / Oracle / Odoo integration callbacks)
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/webhooks", tags=["ERP Webhooks"])

SUBSCRIPTIONS: list = []

class WebhookSubscribeRequest(BaseModel):
    callbackUrl: str
    events: List[str] = ["ORDER_CONFIRMED", "ESCROW_RELEASED", "SHIPMENT_DELIVERED"]
    erpSystem: Optional[str] = "SAP"
    secretKey: Optional[str] = None

@router.post("/subscribe")
def subscribe_webhook(req: WebhookSubscribeRequest, current_user: dict = Depends(get_current_user)):
    """Subscribe an ERP endpoint to receive Deccan Origin event callbacks."""
    sub_id = f"wh-{uuid.uuid4().hex[:10]}"
    subscription = {
        "id": sub_id,
        "subscriberId": current_user.get("id"),
        "callbackUrl": req.callbackUrl,
        "events": req.events,
        "erpSystem": req.erpSystem,
        "status": "ACTIVE",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    SUBSCRIPTIONS.append(subscription)
    return {
        "success": True,
        "subscriptionId": sub_id,
        "subscription": subscription,
        "message": "Webhook registered. ERP callbacks will be sent to your endpoint.",
    }

@router.get("/subscriptions")
def get_subscriptions(current_user: dict = Depends(get_current_user)):
    """List all webhook subscriptions for the authenticated user."""
    user_subs = [s for s in SUBSCRIPTIONS if s.get("subscriberId") == current_user.get("id")]
    return {"success": True, "subscriptions": user_subs, "total": len(user_subs)}
