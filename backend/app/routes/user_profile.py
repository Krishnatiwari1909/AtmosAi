from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.dynamo_service import save_user_profile, get_user_profile

router = APIRouter(
    prefix="/user-profile",
    tags=["User Profile"],
)

from typing import List, Optional, Union, Any, Dict
from pydantic import ConfigDict

class UserProfileRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    user_id: Optional[str] = "guest_123"
    name: Optional[str] = "User"
    age: Optional[Union[str, int]] = "25"
    activities: Optional[List[str]] = ["Walking"]
    sensitivities: Optional[List[str]] = []
    commute: Optional[str] = "Public transit"
    gear: Optional[List[str]] = []

@router.post("")
async def sync_profile(profile: UserProfileRequest):
    """Sync user profile to AWS DynamoDB."""
    # Attempt to sync to DynamoDB
    success = save_user_profile(profile.user_id, profile.model_dump())
    
    # Return 200 OK whether it synced or fell back to local storage
    return {
        "status": "success", 
        "dynamodb_synced": success,
        "message": "Saved to AWS DynamoDB" if success else "Saved to LocalStorage (DynamoDB Fallback)"
    }

@router.get("/{user_id}")
async def fetch_profile(user_id: str):
    """Fetch user profile from AWS DynamoDB."""
    profile = get_user_profile(user_id)
    if profile:
        return {"status": "success", "data": profile, "source": "dynamodb"}
    
    # If not found or AWS is disabled, raise 404 to let frontend fallback to LocalStorage
    raise HTTPException(status_code=404, detail="Profile not found in DynamoDB or AWS keys missing")


profile_alias_router = APIRouter(
    prefix="/profile",
    tags=["Profile Alias"],
)

@profile_alias_router.post("")
async def sync_profile_alias(profile: UserProfileRequest):
    return await sync_profile(profile)

@profile_alias_router.get("/{user_id}")
async def fetch_profile_alias(user_id: str):
    return await fetch_profile(user_id)

