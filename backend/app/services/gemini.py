import logging
import os
from typing import Optional
from google import genai
from app.config import settings

logger = logging.getLogger("yojana_dvar")

class GeminiService:
    """
    Service wrapper for Google Gemini API Client (Ticket 4.1).
    Securely resolves GEMINI_API_KEY from environment or GCP Secret Manager.
    Handles missing keys or authentication errors gracefully without crashing.
    """

    def __init__(self):
        self.api_key: Optional[str] = None
        self.client: Optional[genai.Client] = None
        self.is_configured: bool = False
        self.model_name: str = settings.GEMINI_MODEL
        self._initialize()

    def _resolve_api_key(self) -> Optional[str]:
        """Resolves API key from environment variables or GCP Secret Manager."""
        # 1. Check direct environment variable / settings
        env_key = os.getenv("GEMINI_API_KEY", settings.GEMINI_API_KEY).strip()
        if env_key:
            return env_key

        # 2. Attempt fetching from GCP Secret Manager if project ID is available
        project_id = os.getenv("GCP_PROJECT_ID", settings.GCP_PROJECT_ID)
        secret_name = os.getenv("GEMINI_SECRET_NAME", settings.GEMINI_SECRET_NAME)

        if project_id and secret_name:
            try:
                from google.cloud import secretmanager
                client = secretmanager.SecretManagerServiceClient()
                secret_path = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
                response = client.access_secret_version(request={"name": secret_path})
                secret_value = response.payload.data.decode("UTF-8").strip()
                if secret_value:
                    logger.info("Successfully retrieved GEMINI_API_KEY from GCP Secret Manager.")
                    return secret_value
            except Exception as e:
                logger.debug(f"Secret Manager access skipped or unavailable: {e}")

        return None

    def _initialize(self):
        """Initializes genai.Client instance if key is available."""
        resolved_key = self._resolve_api_key()
        if not resolved_key:
            self.client = None
            self.is_configured = False
            logger.warning("GEMINI_API_KEY is not configured. Gemini explanation service will use fallback mode.")
            return

        try:
            self.api_key = resolved_key
            self.client = genai.Client(api_key=self.api_key)
            self.is_configured = True
            logger.info("Gemini API client initialized successfully.")
        except Exception as e:
            self.client = None
            self.is_configured = False
            logger.warning(f"Failed to initialize Gemini API client: {e}. Running in fallback mode.")

    def is_available(self) -> bool:
        """Returns True if Gemini client is initialized and ready for requests."""
        return self.is_configured and self.client is not None

    def get_client(self) -> Optional[genai.Client]:
        """Returns initialized genai.Client instance or None."""
        return self.client

    def get_model_name(self) -> str:
        """Returns configured Gemini model identifier."""
        return self.model_name

# Global GeminiService Singleton Instance
gemini_service = GeminiService()
