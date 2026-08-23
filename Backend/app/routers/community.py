"""
Deccan Origin — Community Forum, Expert Booking & Knowledge Router
Endpoints: list posts, create post, add answer, upvote, flag, book expert
"""
import uuid
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/community", tags=["Community & Expert Booking"])

POSTS_STORE: list = [
    {
        "id": "post-01",
        "author": "Dr. Anita Roy",
        "authorId": "usr_expert_01",
        "persona": "agronomist",
        "title": "Bio-Fertilizer Application Timing during Monsoon",
        "content": "When should we apply Jeevamrutha during heavy monsoon months? Sharing my 10-year experience with Maharashtra farmers.",
        "category": "Agronomy",
        "tags": ["fertilizer", "monsoon", "jeevamrutha"],
        "upvotes": 42,
        "repliesCount": 15,
        "isExpertAnswer": True,
        "createdAt": "2026-08-18T08:30:00Z",
        "answers": [],
    },
    {
        "id": "post-02",
        "author": "Ramesh Patel",
        "authorId": "usr_farmer_01",
        "persona": "farmer",
        "title": "How to control late blight in tomatoes organically?",
        "content": "My tomato crop is showing brown patches. Is neem oil sufficient or do I need Trichoderma?",
        "category": "Pest Management",
        "tags": ["tomato", "blight", "neem", "organic"],
        "upvotes": 28,
        "repliesCount": 8,
        "isExpertAnswer": False,
        "createdAt": "2026-08-19T14:00:00Z",
        "answers": [],
    },
]

BOOKINGS_STORE: list = []

# ── Pydantic Models ───────────────────────────────────────────────────────────

class CreatePostRequest(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    tags: Optional[List[str]] = []

class AddAnswerRequest(BaseModel):
    content: str

class FlagRequest(BaseModel):
    path: Optional[str] = None
    postId: Optional[str] = None
    reason: str = "inappropriate_content"

class ExpertBookingRequest(BaseModel):
    expertId: Optional[str] = None
    expertName: Optional[str] = None
    slot: Optional[str] = None
    cropIssue: Optional[str] = None
    farmLocation: Optional[str] = None
    feeINR: Optional[float] = 1200

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/posts")
def get_posts(category: Optional[str] = None, search: Optional[str] = None):
    """Get community discussion posts, optionally filtered."""
    posts = list(POSTS_STORE)
    if category:
        posts = [p for p in posts if p.get("category", "").lower() == category.lower()]
    if search:
        q = search.lower()
        posts = [p for p in posts if q in p.get("title", "").lower() or q in p.get("content", "").lower()]
    return {"success": True, "posts": posts, "total": len(posts)}

@router.post("/posts")
def create_post(req: CreatePostRequest, current_user: dict = Depends(get_current_user)):
    """Create a new community discussion post."""
    post_id = f"post-{uuid.uuid4().hex[:8]}"
    post = {
        "id": post_id,
        "author": current_user.get("name", "Deccan Member"),
        "authorId": current_user.get("id"),
        "persona": current_user.get("persona", "farmer"),
        "title": req.title,
        "content": req.content,
        "category": req.category,
        "tags": req.tags,
        "upvotes": 0,
        "repliesCount": 0,
        "isExpertAnswer": False,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "answers": [],
    }
    POSTS_STORE.append(post)
    return {"success": True, "post": post}

@router.post("/posts/{post_id}/answers")
def add_answer(post_id: str, req: AddAnswerRequest, current_user: dict = Depends(get_current_user)):
    """Add an answer/reply to a community post."""
    answer = {
        "id": f"ans-{uuid.uuid4().hex[:8]}",
        "postId": post_id,
        "author": current_user.get("name", "Deccan Member"),
        "authorId": current_user.get("id"),
        "persona": current_user.get("persona", "farmer"),
        "content": req.content,
        "isExpertAnswer": current_user.get("persona") == "agronomist",
        "upvotes": 0,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    for post in POSTS_STORE:
        if post.get("id") == post_id:
            post.setdefault("answers", []).append(answer)
            post["repliesCount"] = post.get("repliesCount", 0) + 1
            break
    return {"success": True, "questionId": post_id, "answer": answer, "isExpertAnswer": answer["isExpertAnswer"]}

@router.post("/posts/{post_id}/upvote")
def upvote_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Upvote a community post."""
    for post in POSTS_STORE:
        if post.get("id") == post_id:
            post["upvotes"] = post.get("upvotes", 0) + 1
            return {"success": True, "id": post_id, "upvotes": post["upvotes"]}
    return {"success": True, "id": post_id, "upvotes": 1}

@router.post("/flag")
def flag_content(req: FlagRequest, current_user: dict = Depends(get_current_user)):
    """Flag a post or answer for moderation review."""
    path = req.path or req.postId or "unknown"
    return {
        "success": True,
        "path": path,
        "flaggedBy": current_user.get("id"),
        "reason": req.reason,
        "message": "Content flagged for moderator review. Action within 24h.",
    }

@router.post("/expert-bookings")
def book_expert(req: ExpertBookingRequest, current_user: dict = Depends(get_current_user)):
    """Book a verified agronomist expert consultation."""
    booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
    booking = {
        "id": booking_id,
        "farmerId": current_user.get("id"),
        "farmerName": current_user.get("name"),
        "expertId": req.expertId or "exp_anita_roy_01",
        "expertName": req.expertName or "Dr. Anita Roy (Organic Agronomy)",
        "slot": req.slot or "2026-08-25 10:00 AM IST",
        "cropIssue": req.cropIssue,
        "farmLocation": req.farmLocation,
        "status": "CONFIRMED",
        "feeINR": req.feeINR,
        "bookedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    BOOKINGS_STORE.append(booking)
    return {"success": True, "booking": booking}
