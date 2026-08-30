import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SchemeCard, parseLifeStageTags } from '../components/schemes/SchemeCard';
import { 
  matchSchemes, 
  searchSchemes
} from '../services/api';
import type { SchemeMatchResult, MatchResponse, ProfileInput } from '../services/api';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  Filter,
  CheckCircle2,
  X,
  BookmarkCheck,
  Edit3
} from 'lucide-react';

// Skeleton Loading Card component for animated placeholder states
const SchemeCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-xs animate-pulse flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header row: score pill + scope + bookmark skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-cream-200 rounded-full" />
            <div className="h-5 w-20 bg-cream-100 rounded-full" />
          </div>
          <div className="w-8 h-8 bg-cream-200 rounded-xl" />
        </div>

        {/* Title skeleton (2 lines) */}
        <div className="space-y-1.5 pt-1">
          <div className="h-5 bg-cream-200 rounded-md w-4/5" />
          <div className="h-5 bg-cream-200 rounded-md w-3/5" />
        </div>

        {/* Ministry line skeleton */}
        <div className="h-3.5 bg-cream-100 rounded-md w-1/2" />

        {/* Life stage tag pills skeleton */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 bg-cream-200 rounded-md" />
          <div className="h-5 w-20 bg-cream-200 rounded-md" />
        </div>

        {/* Benefits box skeleton */}
        <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-2">
          <div className="h-3 bg-cream-200 rounded w-1/4" />
          <div className="h-3.5 bg-cream-200 rounded w-full" />
          <div className="h-3.5 bg-cream-200 rounded w-4/5" />
        </div>
      </div>

      {/* Footer action buttons skeleton */}
      <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-cream-200 rounded-lg" />
          <div className="h-7 w-20 bg-cream-100 rounded-lg" />
        </div>
        <div className="h-5 w-20 bg-cream-200 rounded" />
      </div>
    </div>
  );
};

export const Results: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  // Navigation State from Discovery Form (/find)
  const locationState = location.state as { matchData?: MatchResponse; profile?: ProfileInput } | undefined;

  const [schemes, setSchemes] = useState<SchemeMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(!locationState?.matchData);
  const [executionTime, setExecutionTime] = useState<number>(locationState?.matchData?.execution_time_ms ?? 0.25);
  const [userProfile, setUserProfile] = useState<ProfileInput | undefined>(locationState?.profile);

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | 'central' | 'state'>('all');
  const [selectedLifeStage, setSelectedLifeStage] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'ministry'>('score');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Toast Notification State for Bookmarks
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If navigated directly without state, run a default match so the page is never blank
  useEffect(() => {
    if (locationState?.matchData?.schemes) {
      setSchemes(locationState.matchData.schemes);
      setExecutionTime(locationState.matchData.execution_time_ms || 0.25);
      setUserProfile(locationState.profile);
      setLoading(false);
      return;
    }

    // Default fetch for demo/direct visits
    const loadDefaultSchemes = async () => {
      setLoading(true);
      try {
        const defaultProfile: ProfileInput = {
          state: 'Uttar Pradesh',
          age: 26,
          gender: 'Female',
          caste: 'General',
          income: 100000,
          residence: 'All',
          life_stage: 'maternal',
          is_bpl: false,
          has_disability: false,
          limit: 15
        };
        setUserProfile(defaultProfile);
        const res = await matchSchemes(defaultProfile);
        setSchemes(res.schemes);
        setExecutionTime(res.execution_time_ms);
      } catch {
        // Fallback to searchSchemes
        try {
          const searchRes = await searchSchemes();
          setSchemes(searchRes.schemes);
        } catch (searchErr) {
          console.error("Failed to load fallback schemes:", searchErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDefaultSchemes();
  }, [locationState]);

  // Extract unique categories from current schemes
  const categories = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [schemes]);

  // Filter & Sort Logic
  const filteredSchemes = useMemo(() => {
    return schemes
      .filter((s) => {
        // Minimum score filter
        const score = s.match_score ?? 80;
        if (score < minScore) return false;

        // Category filter
        if (selectedCategory !== 'all' && s.category !== selectedCategory) {
          return false;
        }

        // Scope filter (Central vs State)
        const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
        if (selectedScope === 'central' && !isCentral) return false;
        if (selectedScope === 'state' && isCentral) return false;

        // Life Stage filter
        if (selectedLifeStage !== 'all') {
          const tags = parseLifeStageTags(s.life_stage_tags).map((t) => t.toLowerCase());
          if (!tags.includes(selectedLifeStage.toLowerCase())) {
            return false;
          }
        }

        // Search within results
        if (searchFilter.trim()) {
          const query = searchFilter.toLowerCase();
          const matches =
            s.name.toLowerCase().includes(query) ||
            s.benefits.toLowerCase().includes(query) ||
            s.ministry.toLowerCase().includes(query) ||
            (s.category && s.category.toLowerCase().includes(query));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.match_score ?? 80) - (a.match_score ?? 80);
        }
        if (sortBy === 'ministry') {
          return (a.ministry || '').localeCompare(b.ministry || '');
        }
        return a.name.localeCompare(b.name);
      });
  }, [schemes, selectedCategory, selectedScope, selectedLifeStage, minScore, sortBy, searchFilter]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedScope('all');
    setSelectedLifeStage('all');
    setMinScore(0);
    setSortBy('score');
    setSearchFilter('');
  };

  const isFiltered = selectedCategory !== 'all' || selectedScope !== 'all' || selectedLifeStage !== 'all' || minScore > 0 || searchFilter.trim() !== '';

  // Handle bookmark change toast
  const handleBookmarkChange = (_schemeId: string, isSaved: boolean, schemeName: string) => {
    const text = isSaved 
      ? `"${schemeName.substring(0, 30)}..." ${t('toastBookmarkSaved')}`
      : t('toastBookmarkRemoved');
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative">
      
      {/* Toast Notification Container */}
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

      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link 
          to="/find" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('resultsRefineProfile')}</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-charcoal-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 font-bold border border-forest-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            9-Rule Engine
          </span>
          <span className="inline-flex items-center gap-1 text-charcoal-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            {t('resultsExecutionTime')} <strong className="text-charcoal-800">{executionTime} ms</strong>
          </span>
        </div>
      </div>

      {/* Profile Context Summary Bar (If arrived from /find) */}
      {userProfile && (
        <div className="mb-8 p-4 rounded-2xl bg-cream-100/90 border border-saffron-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 flex-wrap text-xs text-charcoal-700">
            <span className="font-bold text-saffron-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              {t('resultsProfileSummary')}:
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800">
              📍 {userProfile.state}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800">
              👤 {userProfile.age} {language === 'hi' ? 'वर्ष' : 'Yrs'} • {userProfile.gender}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800">
              🏷️ {userProfile.caste}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-forest-700">
              ₹{userProfile.income.toLocaleString('en-IN')}/yr
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800 capitalize">
              🌱 {userProfile.life_stage}
            </span>
            {userProfile.is_bpl && (
              <span className="bg-saffron-500 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                BPL
              </span>
            )}
            {userProfile.has_disability && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                PwD
              </span>
            )}
          </div>

          <Link
            to="/find"
            className="text-xs font-bold text-saffron-700 hover:text-saffron-900 inline-flex items-center gap-1 hover:underline whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रोफ़ाइल बदलें' : 'Refine Inputs'}</span>
          </Link>
        </div>
      )}

      {/* Main Results Title Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {t('resultsTitle')}
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 mt-1.5">
          {t('resultsSubtitle')}
        </p>
      </div>

      {/* Filter & Sort Controls Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-card mb-8 space-y-4">
        
        {/* Row 1: Search within results + Scope Toggles + Sort */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Keyword Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t('searchInResults')}
              className="w-full pl-10 pr-8 py-2.5 text-sm bg-cream-50 rounded-xl border border-cream-300 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-saffron-500"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Filter Buttons (All / Central / State) */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl w-full lg:w-auto">
            {(['all', 'central', 'state'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScope(sc)}
                className={`flex-1 lg:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedScope === sc
                    ? 'bg-white text-saffron-800 shadow-xs ring-1 ring-black/5'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {sc === 'all'
                  ? t('filterScopeAll')
                  : sc === 'central'
                  ? t('filterScopeCentral')
                  : t('filterScopeState')}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-semibold text-charcoal-500 whitespace-nowrap hidden sm:inline">
              {t('sortLabel')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'ministry')}
              className="w-full lg:w-auto py-2.5 px-3 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-saffron-500"
            >
              <option value="score">{t('sortHighestMatch')}</option>
              <option value="name">{t('sortNameAsc')}</option>
              <option value="ministry">{t('sortMinistryAsc')}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Life Stage Quick Filter Pills */}
        <div className="pt-3 border-t border-cream-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal-700 flex items-center gap-1 mr-1">
            <span>🌱</span>
            <span>{t('filterLifeStage')}:</span>
          </span>

          {[
            { id: 'all', label: t('filterLifeStageAll') },
            { id: 'student', label: language === 'hi' ? '🎓 छात्रा' : '🎓 Student' },
            { id: 'maternal', label: language === 'hi' ? '🤱 मातृत्व' : '🤱 Maternal' },
            { id: 'entrepreneur', label: language === 'hi' ? '💼 उद्यमी' : '💼 Business' },
            { id: 'senior', label: language === 'hi' ? '👵 वरिष्ठ' : '👵 Senior' },
          ].map((ls) => (
            <button
              key={ls.id}
              onClick={() => setSelectedLifeStage(ls.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedLifeStage === ls.id
                  ? 'bg-saffron-500 text-white shadow-xs'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {ls.label}
            </button>
          ))}

          {/* Min Score Quick Filter */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-charcoal-500">
            <span className="font-semibold">{language === 'hi' ? 'पात्रता:' : 'Min Match:'}</span>
            {[0, 80, 90].map((s) => (
              <button
                key={s}
                onClick={() => setMinScore(s)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  minScore === s
                    ? 'bg-forest-600 text-white'
                    : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
                }`}
              >
                {s === 0 ? 'All' : `${s}%+`}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Category Filter Chips (if multiple exist) */}
        {categories.length > 0 && (
          <div className="pt-2 border-t border-cream-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-charcoal-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-saffron-600" />
              {t('filterCategory')}:
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-charcoal-800 text-white font-bold'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              {t('filterAllCategories')}
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
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

      {/* Results Header Count & Reset Action */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-charcoal-900 flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-saffron-100 text-saffron-800 font-black text-sm sm:text-base border border-saffron-200">
            {loading ? '...' : filteredSchemes.length}
          </span>
          <span>{t('resultsFoundCount')}</span>
        </h2>

        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-saffron-700 hover:text-saffron-900 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-md bg-saffron-50 border border-saffron-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('emptyResetFilters')}</span>
          </button>
        )}
      </div>

      {/* Main Content: Skeleton Loading Grid, Matched Schemes Grid, or Empty State */}
      {loading ? (
        /* Skeleton Loading Animations: 6-Card Animated Placeholder Grid */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 animate-pulse">
            <Sparkles className="w-4 h-4 text-saffron-600 animate-spin" />
            <span>
              {language === 'hi'
                ? '9-नियम इंजन द्वारा 100+ योजनाओं की पात्रता जांची जा रही है...'
                : 'Matching 100+ schemes with 9-rule deterministic engine...'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SchemeCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      ) : filteredSchemes.length > 0 ? (
        /* Matched Schemes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard 
              key={scheme.scheme_id} 
              scheme={scheme} 
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-cream-300 shadow-card text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-saffron-50 border border-saffron-200 text-saffron-600 mx-auto flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-charcoal-900">
              {t('emptyResultsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-md mx-auto">
              {t('emptyResultsDesc')}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98"
            >
              {t('emptyResetFilters')}
            </button>
            <Link
              to="/find"
              className="px-5 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 font-semibold text-xs sm:text-sm transition-colors"
            >
              {t('emptyBackToWizard')}
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default Results;
