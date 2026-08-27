# Firebase Setup & Infrastructure Guide (Ticket 1.3)

This guide documents the Firebase Authentication, Cloud Firestore database schema, security rules, and Firebase Hosting setup for **Yojana Dvar**.

---

## 1. Firebase Authentication Configuration

Yojana Dvar utilizes **Firebase Auth** for citizen account access and bookmark persistence.

### Required Sign-In Providers
In the Firebase Console -> **Authentication** -> **Sign-in method**:
1. **Email/Password**: Enabled.
2. **Phone OTP**: Enabled (allows quick OTP verification for Indian phone numbers).

---

## 2. Cloud Firestore Database Setup

- **Database Instance Location**: `asia-south1` (Mumbai).
- **Mode**: Production Mode (restricted by security rules).

### Subcollection Schema Overview

```
users/{uid}                              -> User account root
├── profiles/{profileId}                 -> Saved demographic profiles
├── bookmarks/{schemeId}                 -> Saved scheme bookmarks
└── match_history/{matchId}              -> Anonymized query match logs
```

---

## 3. Firestore Security Rules (`firestore.rules`)

Security rules enforce **strict user data isolation** so users can only read or write their own documents:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /profiles/{profileId} {
        allow read, write: if isOwner(userId);
      }

      match /bookmarks/{schemeId} {
        allow read, write: if isOwner(userId);
      }

      match /match_history/{matchId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## 4. Firebase Hosting Configuration (`firebase.json`)

`firebase.json` routes all non-static requests to `/index.html` for single-page application (SPA) routing:

```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 5. Deployment Commands

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Add Project Alias
firebase use --add YOUR_PROJECT_ID --alias default

# 3. Deploy Firestore Rules & Indexes
firebase deploy --only firestore

# 4. Deploy Hosting (after frontend build)
cd frontend && npm run build && cd ..
firebase deploy --only hosting
```
