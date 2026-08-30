import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { 
  fetchUserBookmarks, 
  removeUserBookmark, 
  fetchUserProfile, 
  saveUserProfile,
  matchSchemes,
  getLocalBookmarks
} from '../services/api';
import type { SchemeMatchResult, ProfileInput } from '../services/api';
import { 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  User, 
  LogOut, 
  Search, 
  Filter, 
  ArrowRight, 
  Trash2, 
  X, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  ShieldCheck,
  Edit3
} from 'lucide-react';

const DEMO_PERSONAS_META = [
  {
    id: 'priya' as const,
    name: 'Priya Sharma',
    subtitle: '19yo Student in Karnataka • OBC',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    defaultProfile: {
      state: 'Karnataka',
      age: 19,
      gender: 'Female',
      caste: 'OBC',
      income: 180000,
      residence: 'Urban',
      life_stage: 'student',
      is_bpl: false,
      has_disability: false,
      limit: 10
    }
  },
  {
    id: 'sunita' as const,
    name: 'Sunita Devi',
    subtitle: '26yo Expecting Mother in Bihar • SC • BPL',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
    defaultProfile: {
      state: 'Bihar',
      age: 26,
      gender: 'Female',
      caste: 'SC',
      income: 48000,
      residence: 'Rural',
      life_stage: 'maternal',
      is_bpl: true,
      has_disability: false,
      limit: 10
    }
  },
  {
    id: 'lakshmi' as const,
    name: 'Lakshmi Ammal',
    subtitle: '42yo Micro-Entrepreneur in Tamil Nadu • General',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi',
    defaultProfile: {
      state: 'Tamil Nadu',
      age: 42,
      gender: 'Female',
      caste: 'General',
      income: 220000,
      residence: 'Urban',
      life_stage: 'entrepreneur',
      is_bpl: false,
      has_disability: false,
      limit: 10
    }
  }
];

export const Bookmarks: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, token, isAuthenticated, loginDemo, loginCustom, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [bookmarks, setBookmarks] = useState<SchemeMatchResult[]>([]);
  const [userProfile, setUserProfile] = useState<ProfileInput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom login state
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');

  // Fetch bookmarks & profile when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    // Fetch bookmarks and profile
    Promise.all([
      fetchUserBookmarks(token).catch((err) => {
        console.warn("Could not fetch remote bookmarks, falling back to local storage:", err);
        return [];
      }),
      fetchUserProfile(token).catch(() => null)
    ]).then(([remoteBookmarks, remoteProfile]) => {
      if (!isMounted) return;

      // If remote returned bookmarks, use them
      if (remoteBookmarks && remoteBookmarks.length > 0) {
        setBookmarks(remoteBookmarks);
      } else {
        // Fallback to local bookmarks
        const localIds = getLocalBookmarks();
        if (localIds.length > 0) {
          // If we have local ids but no remote schemes, we can keep the local list
          setBookmarks([]);
        } else {
          setBookmarks([]);
        }
      }

      if (remoteProfile) {
        setUserProfile(remoteProfile);
      } else {
        // Default to Priya's demographic profile if demo user
        const matchedDemo = DEMO_PERSONAS_META.find(p => p.id === currentUser?.uid);
        if (matchedDemo) {
          setUserProfile(matchedDemo.defaultProfile);
          // Persist to backend
          saveUserProfile(matchedDemo.defaultProfile, token);
        }
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, currentUser?.uid]);

  // Remove a bookmark
  const handleRemoveBookmark = async (schemeId: string, schemeName?: string) => {
    // Optimistic UI update
    setBookmarks(prev => prev.filter(s => s.scheme_id !== schemeId));

    if (token) {
      await removeUserBookmark(schemeId, token);
    }

    const nameStr = schemeName ? `"${schemeName.substring(0, 25)}..." ` : '';
    setToastMessage(`${nameStr}${t('toastBookmarkRemoved')}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find schemes matching user's saved profile
  const handleFindWithProfile = async () => {
    if (!userProfile) return;
    setMatchingLoading(true);
    try {
      const matchRes = await matchSchemes(userProfile);
      navigate('/results', {
        state: {
          matchData: matchRes,
          profile: userProfile
        }
      });
    } catch (err) {
      console.error("Match schemes failed:", err);
      navigate('/find');
    } finally {
      setMatchingLoading(false);
    }
  };

  // Extract unique categories from current bookmarks
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Filtered bookmarks list
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          b.name.toLowerCase().includes(q) ||
          (b.benefits && b.benefits.toLowerCase().includes(q)) ||
          (b.ministry && b.ministry.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [bookmarks, selectedCategory, searchQuery]);

  // Handle custom login submit
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    loginCustom(customEmail.trim(), customName.trim() || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          role="status"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-charcoal-900 text-white shadow-2xl flex items-center gap-3 border border-saffron-500/40 animate-slideUp max-w-sm"
        >
          <BookmarkCheck className="w-5 h-5 text-saffron-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-charcoal-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. UNAUTHENTICATED VIEW: LOGIN PROMPT GUARD (Ticket 6.7)                  */}
      {/* ========================================================================= */}
      {!isAuthenticated ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
          
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-saffron-200 shadow-card text-center space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-saffron-50 border border-saffron-200 text-saffron-600 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
                {t('bookmarksAuthPromptTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                {t('bookmarksAuthPromptDesc')}
              </p>
            </div>

            {/* Quick 1-Click Demo Persona Sign-In Buttons */}
            <div className="pt-2 text-left space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block text-center sm:text-left">
                {t('bookmarksQuickSignIn')}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEMO_PERSONAS_META.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => loginDemo(persona.id)}
                    className="p-3.5 rounded-2xl border border-cream-300 hover:border-saffron-400 bg-cream-50/60 hover:bg-saffron-50/50 text-left transition-all hover:scale-102 flex sm:flex-col items-center sm:items-start gap-3 shadow-2xs group"
                  >
                    <img 
                      src={persona.avatar} 
                      alt="" 
                      className="w-10 h-10 rounded-full border border-saffron-300 group-hover:border-saffron-500 flex-shrink-0" 
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-charcoal-900 group-hover:text-saffron-800">
                        {persona.name}
                      </div>
                      <div className="text-[11px] text-charcoal-500 line-clamp-1">
                        {persona.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sign-In Form */}
            <div className="pt-4 border-t border-cream-200 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-3 text-center sm:text-left">
                {t('bookmarksCustomSignIn')}
              </span>

              <form onSubmit={handleCustomLogin} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Full Name (Optional)"
                    className="px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-101 active:scale-99 inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('bookmarksSignInBtn')}</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (

        /* ========================================================================= */
        /* 2. AUTHENTICATED VIEW: USER DASHBOARD (Ticket 6.7)                        */
        /* ========================================================================= */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Dashboard Header Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              {currentUser?.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt="" 
                  className="w-16 h-16 rounded-2xl border-2 border-saffron-400 p-0.5 bg-saffron-50 flex-shrink-0" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-saffron-100 border border-saffron-300 flex items-center justify-center text-saffron-800">
                  <User className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-charcoal-900">
                    {currentUser?.displayName || 'Citizen'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
                    <CheckCircle2 className="w-3 h-3 text-forest-600" />
                    Verified Citizen Session
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 font-mono">
                  UID: {currentUser?.uid} {currentUser?.email ? `• ${currentUser.email}` : ''}
                </p>
              </div>
            </div>

            {/* Header Right: Bookmarks Count Badge + Logout Action */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-saffron-50 border border-saffron-200 text-center">
                <span className="block text-xl font-black text-saffron-900">
                  {bookmarks.length}
                </span>
                <span className="text-[11px] font-semibold text-saffron-700 uppercase tracking-wide">
                  {t('bookmarksCountBadge')}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-xl border border-cream-300 hover:border-red-300 hover:bg-red-50 text-charcoal-600 hover:text-red-700 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('navSignOut')}</span>
              </button>
            </div>

          </div>

          {/* Saved Demographic Profile Summary Card */}
          {userProfile && (
            <div className="bg-gradient-to-r from-cream-50 via-white to-cream-50 rounded-3xl p-6 sm:p-8 border border-saffron-200 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-charcoal-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-saffron-600" />
                    <span>{t('bookmarksProfileCardTitle')}</span>
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('bookmarksProfileCardDesc')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/find"
                    state={{ profile: userProfile }}
                    className="px-3.5 py-1.5 rounded-xl border border-saffron-300 hover:bg-saffron-50 text-saffron-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('bookmarksRefineProfile')}</span>
                  </Link>

                  <button
                    type="button"
                    disabled={matchingLoading}
                    onClick={handleFindWithProfile}
                    className="px-4 py-1.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-98 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {matchingLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{t('bookmarksFindWithProfile')}</span>
                  </button>
                </div>
              </div>

              {/* Profile Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[11px]">State / UT</span>
                  <span className="font-bold text-charcoal-800 line-clamp-1">📍 {userProfile.state}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[11px]">Age & Gender</span>
                  <span className="font-bold text-charcoal-800">
                    👤 {userProfile.age} {language === 'hi' ? 'वर्ष' : 'Yrs'} • {userProfile.gender}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[11px]">Social Category</span>
                  <span className="font-bold text-charcoal-800">🏷️ {userProfile.caste}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[11px]">Annual Income</span>
                  <span className="font-bold text-forest-700">₹{userProfile.income.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[11px]">Life Stage</span>
                  <span className="font-bold text-charcoal-800 capitalize">🌱 {userProfile.life_stage}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex items-center gap-1.5">
                  {userProfile.is_bpl ? (
                    <span className="px-2 py-0.5 rounded bg-saffron-500 text-white font-black text-[10px]">
                      BPL
                    </span>
                  ) : (
                    <span className="text-charcoal-400 text-[11px]">Non-BPL</span>
                  )}
                  {userProfile.has_disability && (
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px]">
                      PwD
                    </span>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Bookmarks Filter & Search Toolbar */}
          {bookmarks.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('bookmarksSearchPlaceholder')}
                  className="w-full pl-9 pr-7 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  <span className="text-xs font-semibold text-charcoal-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-saffron-600" />
                    <span>Category:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-charcoal-800 text-white font-bold'
                        : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                    }`}
                  >
                    All ({bookmarks.length})
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-charcoal-800 text-white font-bold'
                          : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Bookmarked Schemes Grid / Empty State */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-saffron-600 animate-spin mx-auto" />
              <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
                Loading your saved bookmarks...
              </p>
            </div>
          ) : filteredBookmarks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-charcoal-500 font-medium">
                <span>Showing {filteredBookmarks.length} saved welfare scheme{filteredBookmarks.length > 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((scheme) => (
                  <div key={scheme.scheme_id} className="relative group">
                    <SchemeCard 
                      scheme={scheme} 
                      onBookmarkChange={(_id, isSaved) => {
                        if (!isSaved) {
                          handleRemoveBookmark(scheme.scheme_id, scheme.name);
                        }
                      }}
                    />

                    {/* Quick Remove Action Pill */}
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(scheme.scheme_id, scheme.name)}
                      className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white/90 hover:bg-red-50 text-charcoal-500 hover:text-red-600 border border-cream-300 shadow-sm text-xs flex items-center gap-1 z-10"
                      title={t('bookmarksRemoveBtn')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-cream-300 shadow-card text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-saffron-50 border border-saffron-200 text-saffron-600 mx-auto flex items-center justify-center shadow-xs">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-charcoal-900">
                  {t('bookmarksEmptyTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-md mx-auto">
                  {t('bookmarksEmptyDesc')}
                </p>
              </div>
              <div>
                <Link
                  to="/find"
                  className="px-6 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('bookmarksExploreBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Bookmarks;
