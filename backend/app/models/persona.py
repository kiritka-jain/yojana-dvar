from pydantic import BaseModel, Field
from app.models.profile import ProfileInput

class Persona(BaseModel):
    """Demo persona model for 1-click presentation testing."""
    id: str = Field(description="Persona unique identifier slug")
    name: str = Field(description="Full name of persona")
    title: str = Field(description="Short descriptive title")
    subtitle: str = Field(description="Category and tag summary")
    avatar: str = Field(description="Avatar image URL")
    description: str = Field(description="Detailed narrative background")
    profile: ProfileInput = Field(description="Demographic profile object")
