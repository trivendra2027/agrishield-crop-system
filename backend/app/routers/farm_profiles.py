from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from backend.app.db.mongodb import get_database
from backend.app.routers.auth import get_current_user
from backend.app.models.farm_profile import FarmProfileCreate, FarmProfileUpdate, FarmProfileResponse
from backend.app.services.farm_profile_service import FarmProfileService

router = APIRouter(prefix="/api/farms", tags=["Farm Profiles"])

@router.get("", response_model=List[FarmProfileResponse])
async def list_farms(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieve all farms for the logged-in user."""
    return await FarmProfileService.list_farms(db, current_user["id"])

@router.get("/archived", response_model=List[FarmProfileResponse])
async def list_archived_farms(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieve all archived farms for the logged-in user."""
    return await FarmProfileService.list_archived_farms(db, current_user["id"])

@router.get("/current", response_model=Optional[FarmProfileResponse])
async def get_current_farm(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieve the currently active farm profile."""
    return await FarmProfileService.get_active_farm(db, current_user["id"])

@router.get("/{farm_id}", response_model=FarmProfileResponse)
async def get_farm(
    farm_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieve details of a specific farm profile."""
    farm = await FarmProfileService.get_farm(db, farm_id, current_user["id"])
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found or access denied"
        )
    return farm

@router.post("", response_model=FarmProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_data: FarmProfileCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new farm profile and automatically make it active."""
    try:
        return await FarmProfileService.create_farm(db, current_user["id"], farm_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create farm: {str(e)}"
        )

@router.put("/{farm_id}", response_model=FarmProfileResponse)
async def update_farm(
    farm_id: str,
    farm_data: FarmProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update details of a specific farm profile."""
    farm = await FarmProfileService.update_farm(db, farm_id, current_user["id"], farm_data)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found or failed to update"
        )
    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(
    farm_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a farm profile."""
    deleted = await FarmProfileService.delete_farm(db, farm_id, current_user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found or delete failed"
        )
    return None

@router.post("/{farm_id}/unarchive")
async def unarchive_farm(
    farm_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Restore an archived farm profile."""
    success = await FarmProfileService.unarchive_farm(db, farm_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found or could not be restored"
        )
    return {"message": "Farm restored successfully", "active_farm_id": farm_id}

@router.post("/{farm_id}/select")
async def select_active_farm(
    farm_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Set a specific farm profile as active."""
    success = await FarmProfileService.set_active_farm(db, farm_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found or could not be selected"
        )
    return {"message": "Active farm updated successfully", "active_farm_id": farm_id}
