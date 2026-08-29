import datetime
import logging
from typing import Optional, Dict, Any, List
import firebase_admin
from firebase_admin import firestore
from app.auth import init_firebase_admin

logger = logging.getLogger("yojana_dvar")

class FirestoreService:
    """
    Data access service for Firestore user subcollections (Ticket 5.2).
    Manages:
      - `users/{uid}/profiles/{profileId}`
      - `users/{uid}/bookmarks/{schemeId}`
    Includes resilient local fallback for offline development without live credentials.
    """

    def __init__(self):
        self.db = None
        self.is_live = False
        self._local_profiles: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._local_bookmarks: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._initialize()

    def _initialize(self):
        """Attempts to initialize live Firestore client; falls back to in-memory store."""
        init_firebase_admin()
        try:
            if firebase_admin._apps:
                self.db = firestore.client()
                self.is_live = True
                logger.info("Firestore client initialized successfully.")
            else:
                self.is_live = False
                logger.info("Firestore running in local fallback mode.")
        except Exception as e:
            self.is_live = False
            self.db = None
            logger.info(f"Firestore running in local fallback mode: {e}")

    def is_available(self) -> bool:
        """Returns True if connected to live Firestore database."""
        return self.is_live and self.db is not None

    def _now_iso(self) -> str:
        """Returns current timestamp in ISO 8601 format."""
        return datetime.datetime.now(datetime.timezone.utc).isoformat()

    # -------------------------------------------------------------------------
    # Profile Operations: users/{uid}/profiles/{profileId}
    # -------------------------------------------------------------------------

    def save_profile(self, uid: str, profile_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates or overwrites user demographic profile."""
        now = self._now_iso()
        record = {
            **profile_data,
            "profile_id": profile_id,
            "uid": uid,
            "created_at": profile_data.get("created_at", now),
            "updated_at": now
        }

        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("profiles").document(profile_id)
                doc_ref.set(record)
                return record
            except Exception as e:
                logger.warning(f"Firestore save_profile failed ({e}). Using local fallback store.")

        # Local fallback
        if uid not in self._local_profiles:
            self._local_profiles[uid] = {}
        self._local_profiles[uid][profile_id] = record
        return record

    def get_profile(self, uid: str, profile_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a specific demographic profile by ID."""
        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("profiles").document(profile_id)
                doc = doc_ref.get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.warning(f"Firestore get_profile failed ({e}). Checking local fallback store.")

        # Local fallback
        return self._local_profiles.get(uid, {}).get(profile_id)

    def list_profiles(self, uid: str) -> List[Dict[str, Any]]:
        """Lists all demographic profiles for a user."""
        if self.is_available():
            try:
                profiles_ref = self.db.collection("users").document(uid).collection("profiles")
                docs = profiles_ref.stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                logger.warning(f"Firestore list_profiles failed ({e}). Checking local fallback store.")

        # Local fallback
        user_profiles = self._local_profiles.get(uid, {})
        return list(user_profiles.values())

    def update_profile(self, uid: str, profile_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates specific fields of an existing demographic profile."""
        existing = self.get_profile(uid, profile_id)
        if not existing:
            return None

        now = self._now_iso()
        updated_record = {**existing, **updates, "updated_at": now}

        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("profiles").document(profile_id)
                doc_ref.update({**updates, "updated_at": now})
                return updated_record
            except Exception as e:
                logger.warning(f"Firestore update_profile failed ({e}). Using local fallback store.")

        # Local fallback
        if uid in self._local_profiles and profile_id in self._local_profiles[uid]:
            self._local_profiles[uid][profile_id] = updated_record
            return updated_record

        return updated_record

    def delete_profile(self, uid: str, profile_id: str) -> bool:
        """Deletes a demographic profile."""
        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("profiles").document(profile_id)
                doc_ref.delete()
                return True
            except Exception as e:
                logger.warning(f"Firestore delete_profile failed ({e}). Using local fallback store.")

        # Local fallback
        if uid in self._local_profiles and profile_id in self._local_profiles[uid]:
            del self._local_profiles[uid][profile_id]
            return True
        return False

    # -------------------------------------------------------------------------
    # Bookmark Operations: users/{uid}/bookmarks/{schemeId}
    # -------------------------------------------------------------------------

    def add_bookmark(self, uid: str, scheme_id: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Bookmarks a scheme for a user."""
        now = self._now_iso()
        bookmark = {
            "scheme_id": scheme_id,
            "uid": uid,
            "created_at": now,
            "metadata": metadata or {}
        }

        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("bookmarks").document(scheme_id)
                doc_ref.set(bookmark)
                return bookmark
            except Exception as e:
                logger.warning(f"Firestore add_bookmark failed ({e}). Using local fallback store.")

        # Local fallback
        if uid not in self._local_bookmarks:
            self._local_bookmarks[uid] = {}
        self._local_bookmarks[uid][scheme_id] = bookmark
        return bookmark

    def get_bookmark(self, uid: str, scheme_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single bookmarked scheme if exists."""
        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("bookmarks").document(scheme_id)
                doc = doc_ref.get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.warning(f"Firestore get_bookmark failed ({e}). Checking local fallback store.")

        # Local fallback
        return self._local_bookmarks.get(uid, {}).get(scheme_id)

    def is_bookmarked(self, uid: str, scheme_id: str) -> bool:
        """Checks if a scheme is bookmarked by user."""
        return self.get_bookmark(uid, scheme_id) is not None

    def list_bookmarks(self, uid: str) -> List[Dict[str, Any]]:
        """Lists all bookmarked schemes for a user."""
        if self.is_available():
            try:
                bookmarks_ref = self.db.collection("users").document(uid).collection("bookmarks")
                docs = bookmarks_ref.stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                logger.warning(f"Firestore list_bookmarks failed ({e}). Checking local fallback store.")

        # Local fallback
        user_bookmarks = self._local_bookmarks.get(uid, {})
        return list(user_bookmarks.values())

    def delete_bookmark(self, uid: str, scheme_id: str) -> bool:
        """Removes a scheme bookmark for a user."""
        if self.is_available():
            try:
                doc_ref = self.db.collection("users").document(uid).collection("bookmarks").document(scheme_id)
                doc_ref.delete()
                return True
            except Exception as e:
                logger.warning(f"Firestore delete_bookmark failed ({e}). Using local fallback store.")

        # Local fallback
        if uid in self._local_bookmarks and scheme_id in self._local_bookmarks[uid]:
            del self._local_bookmarks[uid][scheme_id]
            return True
        return False

# Global FirestoreService Singleton Instance
firestore_service = FirestoreService()
