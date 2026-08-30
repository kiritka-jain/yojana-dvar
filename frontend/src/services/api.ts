export interface ProfileInput {
  state: string;
  age: number;
  gender: string;
  caste: string;
  income: number;
  residence: string;
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
  match_score?: number;
  match_reasons?: string[];
}

export interface MatchResponse {
  match_id: string;
  count: number;
  schemes: SchemeMatchResult[];
  execution_time_ms: number;
}

export interface DemoPersona {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  avatar: string;
  description: string;
  profile: ProfileInput;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export async function explainSchemeEligibility(request: ExplainRequest): Promise<ExplainResponse> {
  const response = await fetch(`${API_BASE_URL}/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI explanation request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function fetchDemoPersonas(): Promise<DemoPersona[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/personas`);
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn("Could not fetch remote personas, using fallback:", err);
  }

  // Fallback personas if backend is unreachable
  return [
    {
      id: "priya",
      name: "Priya Sharma",
      title: "19yo Student in Karnataka",
      subtitle: "OBC Category • Higher Education Seeker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      description: "19-year-old student from Karnataka seeking scholarships.",
      profile: {
        state: "Karnataka",
        age: 19,
        gender: "Female",
        caste: "OBC",
        income: 180000,
        residence: "Urban",
        life_stage: "student",
        is_bpl: false,
        has_disability: false,
        limit: 10
      }
    },
    {
      id: "sunita",
      name: "Sunita Devi",
      title: "26yo Pregnant Mother in Bihar",
      subtitle: "SC Category • BPL Household • Maternal Care",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita",
      description: "26-year-old expecting mother eligible for maternity aid.",
      profile: {
        state: "Bihar",
        age: 26,
        gender: "Female",
        caste: "SC",
        income: 48000,
        residence: "Rural",
        life_stage: "maternal",
        is_bpl: true,
        has_disability: false,
        limit: 10
      }
    },
    {
      id: "lakshmi",
      name: "Lakshmi Ammal",
      title: "42yo Micro-Entrepreneur in Tamil Nadu",
      subtitle: "General Category • Business Loan Seeker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi",
      description: "42-year-old entrepreneur looking for business loans.",
      profile: {
        state: "Tamil Nadu",
        age: 42,
        gender: "Female",
        caste: "General",
        income: 220000,
        residence: "Urban",
        life_stage: "entrepreneur",
        is_bpl: false,
        has_disability: false,
        limit: 10
      }
    }
  ];
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

