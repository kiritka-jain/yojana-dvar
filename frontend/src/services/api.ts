export interface ProfileInput {
  state: string;
  age: number;
  gender: string;
  caste: string;
  income: number;
  residence: string;
  marital_status?: string;
  life_stage: string;
  occupation?: string;
  education?: string;
  is_bpl: boolean;
  has_disability: boolean;
  limit?: number;
}

export interface SchemeMatchResult {
  scheme_id: string;
  name: string;
  description: string;
  ministry: string;
  department?: string;
  state: string;
  category: string;
  beneficiary_type?: string;
  benefits: string;
  eligibility_text: string;
  documents_required: string;
  application_process: string;
  apply_url: string;
  official_url: string;
  age_min?: number;
  age_max?: number;
  gender?: string;
  caste_categories?: string;
  income_max?: number;
  residence?: string;
  eligible_states?: string;
  requires_bpl?: boolean;
  requires_disability?: boolean;
  life_stage_tags?: string;
  is_active?: boolean;
  name_hi?: string;
  ministry_hi?: string;
  category_hi?: string;
  benefits_hi?: string;
  description_hi?: string;
  application_process_hi?: string;
  documents_required_hi?: string;
  eligibility_text_hi?: string;
  match_score?: number;
  match_reasons?: string[];
}

export interface MatchResponse {
  match_id: string;
  count: number;
  schemes: SchemeMatchResult[];
  execution_time_ms: number;
}


export interface ExplainRequest {
  scheme_id: string;
  profile: ProfileInput;
  language: string; // 'en' or 'hi'
}

export interface ExplainResponse {
  scheme_id: string;
  language: string;
  summary: string;
  key_benefits: string[];
  documents_required: string[];
  next_steps: string;
  disclaimer: string;
  is_fallback: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function matchSchemes(profile: ProfileInput): Promise<MatchResponse> {
  const response = await fetch(`${API_BASE_URL}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Scheme matching request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function searchSchemes(q = '', state = '', category = '', limit = 20): Promise<{ count: number; schemes: SchemeMatchResult[] }> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (state) params.set('state', state);
  if (category) params.set('category', category);
  params.set('limit', String(limit));

  const response = await fetch(`${API_BASE_URL}/schemes/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scheme search results (${response.status})`);
  }
  return response.json();
}

export async function getSchemeById(schemeId: string): Promise<SchemeMatchResult> {
  const response = await fetch(`${API_BASE_URL}/schemes/${encodeURIComponent(schemeId)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scheme details for ${schemeId} (${response.status})`);
  }
  return response.json();
}

export async function explainSchemeEligibility(
  request: ExplainRequest,
  signal?: AbortSignal
): Promise<ExplainResponse> {
  const response = await fetch(`${API_BASE_URL}/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI explanation request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}


// ----------------------------------------------------------------------------
// Local Bookmark Management
// ----------------------------------------------------------------------------

const BOOKMARKS_STORAGE_KEY = 'yojana_saved_bookmarks';

export function getLocalBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLocalBookmarked(schemeId: string): boolean {
  const bookmarks = getLocalBookmarks();
  return bookmarks.includes(schemeId);
}

export function toggleLocalBookmark(schemeId: string): boolean {
  const bookmarks = getLocalBookmarks();
  const index = bookmarks.indexOf(schemeId);
  let isSaved = false;

  if (index >= 0) {
    bookmarks.splice(index, 1);
    isSaved = false;
  } else {
    bookmarks.push(schemeId);
    isSaved = true;
  }

  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  // Dispatch custom window event so all UI components update reactively
  window.dispatchEvent(new Event('yojana_bookmarks_updated'));
  return isSaved;
}

// ----------------------------------------------------------------------------
// Backend User Profile & Bookmarks API (Ticket 5.3 & 6.7)
// ----------------------------------------------------------------------------

export async function fetchUserBookmarks(token: string): Promise<SchemeMatchResult[]> {
  const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user bookmarks (${response.status})`);
  }

  const data = await response.json();
  // data.bookmarks contains enriched bookmark items
  return (data.bookmarks || []).map((b: any) => b.scheme || {
    scheme_id: b.scheme_id,
    name: b.metadata?.name || b.scheme_id,
    category: b.metadata?.category || 'General',
    ministry: b.metadata?.ministry || 'Government of India',
    benefits: 'Verified government entitlement',
    state: 'All India',
    match_score: 95
  });
}

export async function addUserBookmark(schemeId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ scheme_id: schemeId }),
  });

  return response.ok;
}

export async function removeUserBookmark(schemeId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/user/bookmarks/${encodeURIComponent(schemeId)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.ok;
}

export async function fetchUserProfile(token: string): Promise<ProfileInput | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.profile || null;
    }
  } catch (err) {
    console.warn("Could not fetch remote user profile:", err);
  }
  return null;
}

export async function saveUserProfile(profile: ProfileInput, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_id: 'default', profile }),
    });

    return response.ok;
  } catch (err) {
    console.warn("Failed to save remote profile:", err);
    return false;
  }
}

export const USER_PROFILE_STORAGE_KEY = 'yojana_active_user_profile';

export function getStoredUserProfile(): ProfileInput | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUserProfile(profile: ProfileInput): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed to save profile in localStorage:", e);
  }
}

