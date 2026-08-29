from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.models.profile import ProfileInput

class ProfileSaveRequest(BaseModel):
    """Request payload for saving a user demographic profile."""
    profile: ProfileInput = Field(description="Demographic profile data")
    profile_id: str = Field(default="default", description="Identifier for this profile (default: 'default')")

class BookmarkCreateRequest(BaseModel):
    """Request payload for bookmarking a scheme."""
    scheme_id: str = Field(description="Scheme identifier slug (e.g. pmmvy-central)")

class BookmarkItem(BaseModel):
    """Bookmarked scheme with embedded catalog metadata."""
    scheme_id: str
    uid: str
    created_at: str
    metadata: Optional[Dict[str, Any]] = None
    scheme: Optional[Dict[str, Any]] = None

class BookmarksListResponse(BaseModel):
    """List response of saved scheme bookmarks."""
    count: int
    bookmarks: List[BookmarkItem]
