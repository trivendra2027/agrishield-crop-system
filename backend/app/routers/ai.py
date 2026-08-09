from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.schemas import FarmingAssistantRequest, FarmingAssistantResponse, ChatRequest, ChatResponse
from backend.app.services.nvidia_service import nvidia_service
from backend.app.routers.auth import get_current_user
from backend.app.db.mongodb import get_database
from backend.app.services.farm_profile_service import FarmProfileService


router = APIRouter(prefix="/api/ai", tags=["AI Farming Assistant"])

@router.post("/farming-assistant", response_model=FarmingAssistantResponse)
async def get_farming_assistant_advice(
    req: FarmingAssistantRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Generate agronomic diagnosis advice using the NVIDIA NIM API.
    Input contains Crop, Disease status, and ML prediction confidence.
    """
    try:
        active_farm = await FarmProfileService.get_active_farm(db, current_user["id"])
        advice = await nvidia_service.generate_farming_advice(
            crop_name=req.crop_name,
            disease_name=req.disease_name,
            confidence=req.confidence,
            farm_profile=active_farm
        )
        return advice
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Farming Assistant service error: {str(e)}"
        )

@router.get("/test")
async def test_nvidia_api_connection():
    """
    Utility test endpoint to verify connections to the NVIDIA API catalog.
    """
    result = await nvidia_service.test_connection()
    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )
    return result

from backend.app.core.ai_security import validate_ai_prompt
from backend.app.core.rate_limiter import rate_limit, AI_CHAT_LIMIT

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit(AI_CHAT_LIMIT, 60))])
async def chat_with_farming_assistant(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Generic chat endpoint for the Smart Agricultural Assistant with Prompt Security Validation.
    Provides context-aware responses using the NVIDIA LLM.
    """
    # Validate prompt against injection and length limit
    sanitized_message = validate_ai_prompt(req.message)
    
    try:
        active_farm = await FarmProfileService.get_active_farm(db, current_user["id"])
        
        # Inject active farm details and user_role directly into chatbot context
        chat_context = req.context or {}
        chat_context["user_role"] = current_user.get("role", "farmer").lower()
        if active_farm:
            # Strip DB internals
            farm_info = {k: v for k, v in active_farm.items() if k not in ["id", "user_id", "created_at", "updated_at", "_id"]}
            chat_context["active_farm"] = farm_info

        # Fetch full scan history (up to 10 recent scans) for this user from MongoDB
        cursor = db.predictions.find({"user_id": str(current_user["id"])}).sort("created_at", -1).limit(10)
        history_records = await cursor.to_list(length=10)
        
        if history_records:
            scan_history_list = []
            for rec in history_records:
                scan_history_list.append({
                    "crop": rec.get("crop_name", "Unknown Crop"),
                    "disease": rec.get("disease_name", "Healthy"),
                    "confidence": f"{float(rec.get('confidence', 0.0)) * 100:.1f}%",
                    "severity": rec.get("disease_severity", "Unknown"),
                    "symptoms": rec.get("symptoms", "None"),
                    "organic_treatment": rec.get("organic_treatment", "None"),
                    "chemical_treatment": rec.get("chemical_treatment", "None"),
                    "date": rec.get("prediction_date", "N/A"),
                    "time": rec.get("prediction_time", "")
                })
            chat_context["full_scan_history"] = scan_history_list
            chat_context["latest_scan_result"] = scan_history_list[0]

        reply = await nvidia_service.chat_with_assistant(
            message=sanitized_message,
            history=req.history,
            context=chat_context
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Chat service error: {str(e)}"
        )

# ==============================================================
# Persistent Chat Session Endpoints
# ==============================================================

from backend.app.models.schemas import ChatSessionCreate, ChatSessionUpdate, ChatSessionResponse

@router.get("/chat/sessions", response_model=list[ChatSessionResponse])
async def get_chat_sessions(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieve all chat sessions for the current user."""
    cursor = db.ai_chat_sessions.find({"user_id": str(current_user["id"])}).sort("db_created_at", -1)
    sessions = await cursor.to_list(length=100)
    
    # Map MongoDB _id out
    result = []
    for s in sessions:
        if "_id" in s:
            del s["_id"]
        result.append(s)
    return result

@router.post("/chat/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session: ChatSessionCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Save a new chat session to the database."""
    session_dict = session.model_dump()
    session_dict["user_id"] = str(current_user["id"])
    session_dict["db_created_at"] = datetime.now(timezone.utc)
    
    # Upsert based on the frontend-generated ID
    await db.ai_chat_sessions.update_one(
        {"id": session.id, "user_id": str(current_user["id"])},
        {"$set": session_dict},
        upsert=True
    )
    return session_dict

@router.put("/chat/sessions/{session_id}", response_model=dict)
async def update_chat_session(
    session_id: str,
    update_data: ChatSessionUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update an existing chat session (e.g., append messages or change title)."""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        return {"status": "no_changes"}
        
    result = await db.ai_chat_sessions.update_one(
        {"id": session_id, "user_id": str(current_user["id"])},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    return {"status": "updated"}

@router.delete("/chat/sessions/{session_id}", response_model=dict)
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a specific chat session."""
    result = await db.ai_chat_sessions.delete_one({
        "id": session_id, 
        "user_id": str(current_user["id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    return {"status": "deleted"}
