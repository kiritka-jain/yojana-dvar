import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SchemeCard, parseLifeStageTags } from '../components/schemes/SchemeCard';
import { 
  matchSchemes, 
  searchSchemes
} from '../services/api';
import type { SchemeMatchResult, MatchResponse, ProfileInput } from '../services/api';
import type { TranslationDictionary } from '../i18n/translations';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  Sparkles, 
  RotateCcw, 
  X, 
  BookmarkCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STATES_ONLY_DATA, UNION_TERRITORIES_DATA } from '../constants/states';

export type CategoryFilterType = 'all' | 'education' | 'maternity' | 'business' | 'pension';

export const normalizeCategoryParam = (param: string | null): CategoryFilterType => {
  if (!param) return 'all';
  const p = param.toLowerCase().trim();
  if (['education', 'scholarship', 'scholarships', 'student', 'students', 'kanya'].includes(p)) return 'education';
  if (['maternity', 'maternal', 'mother', 'mothers', 'pregnant', 'pregnancy', 'health', 'infant', 'child'].includes(p)) return 'maternity';
  if (['business', 'entrepreneur', 'entrepreneurship', 'shg', 'startup', 'startups', 'credit', 'financial', 'livelihood'].includes(p)) return 'business';
  if (['pension', 'pensions', 'senior', 'elderly', 'widow', 'widows', 'social_security'].includes(p)) return 'pension';
  return 'all';
};

export const matchesState = (scheme: SchemeMatchResult, selectedState: string): boolean => {
  if (!selectedState || selectedState.toLowerCase() === 'all') return true;

  const schemeState = (scheme.state || '').trim().toLowerCase();
  const isCentral = !schemeState || schemeState === 'all' || schemeState === 'all india';

  if (selectedState.toLowerCase() === 'central') {
    return isCentral;
  }

  // Central schemes are available nationwide across all states
  if (isCentral) return true;

  // Exact state match
  if (schemeState === selectedState.toLowerCase()) return true;

  // Check eligible_states array / JSON string if present
  if (scheme.eligible_states) {
    try {
      const eligible = typeof scheme.eligible_states === 'string'
        ? JSON.parse(scheme.eligible_states)
        : scheme.eligible_states;
      if (Array.isArray(eligible)) {
        if (eligible.some((st: string) => st.toLowerCase() === 'all' || st.toLowerCase() === selectedState.toLowerCase())) {
          return true;
        }
      }
    } catch {
      // fallback
    }
  }

  return false;
};

export const matchesCategory = (scheme: SchemeMatchResult, category: CategoryFilterType): boolean => {
  if (category === 'all') return true;

  const tags = parseLifeStageTags(scheme.life_stage_tags).map((t) => t.toLowerCase());
  const cat = (scheme.category || '').toLowerCase();
  const name = scheme.name.toLowerCase();
  const benefits = (scheme.benefits || '').toLowerCase();

  switch (category) {
    case 'education':
      return (
        tags.some((t) => ['student', 'education', 'single_girl_child', 'higher_education', 'youth', 'scholarship'].includes(t)) ||
        cat.includes('education') ||
        cat.includes('girl child') ||
        cat.includes('scholarship') ||
        cat.includes('skill') ||
        name.includes('scholarship') ||
        name.includes('शिक्षा') ||
        name.includes('छात्रवृत्ति') ||
        name.includes('sukanya') ||
        name.includes('udaan') ||
        name.includes('pragati') ||
        name.includes('kanya') ||
        name.includes('kanyashree')
      );
    case 'maternity':
      return (
        tags.some((t) => ['maternal', 'mother', 'pregnant', 'infant', 'lactating', 'child_care'].includes(t)) ||
        cat.includes('maternity') ||
        cat.includes('health') ||
        cat.includes('child development') ||
        name.includes('matru') ||
        name.includes('janani') ||
        name.includes('मातृत्व') ||
        name.includes('गर्भवती') ||
        name.includes('पोषण') ||
        name.includes('स्वास्थ्य') ||
        name.includes('chiranjeevi') ||
        benefits.includes('pregnant') ||
        benefits.includes('maternity') ||
        benefits.includes('health')
      );
    case 'business':
      return (
        tags.some((t) => ['entrepreneur', 'business', 'shg', 'livelihood', 'self_help', 'startup', 'credit'].includes(t)) ||
        cat.includes('business') ||
        cat.includes('entrepreneurship') ||
        cat.includes('financial') ||
        cat.includes('employment') ||
        cat.includes('banking') ||
        cat.includes('housing') ||
        cat.includes('shelter') ||
        cat.includes('transportation') ||
        cat.includes('travel') ||
        name.includes('stand up') ||
        name.includes('mudra') ||
        name.includes('mahila samman') ||
        name.includes('samriddhi') ||
        name.includes('utkarsh') ||
        name.includes('shakti') ||
        name.includes('cheyutha') ||
        name.includes('उद्यम') ||
        name.includes('स्वरोजगार') ||
        benefits.includes('loan') ||
        benefits.includes('subsidy') ||
        benefits.includes('financial assistance') ||
        benefits.includes('employment') ||
        benefits.includes('hostel')
      );
    case 'pension':
      return (
        tags.some((t) => ['senior', 'elderly', 'widow', 'destitute', 'social_security', 'pension'].includes(t)) ||
        cat.includes('pension') ||
        cat.includes('social security') ||
        cat.includes('social welfare') ||
        name.includes('pension') ||
        name.includes('widow') ||
        name.includes('indira gandhi') ||
        name.includes('ladli behna') ||
        name.includes('ladki bahin') ||
        name.includes('samman') ||
        name.includes('griha') ||
        name.includes('gruha') ||
        name.includes('orunodoi') ||
        name.includes('पेंशन') ||
        name.includes('विधवा') ||
        name.includes('वृद्धा') ||
        benefits.includes('pension')
      );
    default:
      return true;
  }
};

const CATEGORY_ITEMS: { id: CategoryFilterType; labelKey: keyof TranslationDictionary }[] = [
  { id: 'all', labelKey: 'filterCategoryAll' },
  { id: 'education', labelKey: 'filterCategoryEducation' },
  { id: 'maternity', labelKey: 'filterCategoryMaternity' },
  { id: 'business', labelKey: 'filterCategoryBusiness' },
  { id: 'pension', labelKey: 'filterCategoryPension' },
];

const SchemeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card animate-pulse space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-cream-200 rounded-md w-1/3"></div>
          <div className="h-6 bg-cream-200 rounded-md w-4/5"></div>
        </div>
        <div className="w-12 h-6 bg-cream-200 rounded-full"></div>
      </div>
      <div className="h-16 bg-cream-100 rounded-2xl"></div>
      <div className="space-y-2">
        <div className="h-3 bg-cream-200 rounded w-full"></div>
        <div className="h-3 bg-cream-200 rounded w-5/6"></div>
      </div>
      <div className="pt-4 border-t border-cream-100 flex justify-between items-center">
        <div className="h-8 bg-cream-200 rounded-xl w-24"></div>
        <div className="h-8 bg-cream-200 rounded-xl w-28"></div>
      </div>
    </div>
  );
};

const PAGE_SIZE = 9;

export const Results: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const locationState = location.state as { matchData?: MatchResponse; profile?: ProfileInput } | undefined;

  const initialCategory = normalizeCategoryParam(searchParams.get('category'));
  const initialSearch = searchParams.get('q') || '';
  const initialState = searchParams.get('state') || locationState?.profile?.state || 'all';
  const rawScope = searchParams.get('scope');
  const initialScope: 'all' | 'central' | 'state' = rawScope === 'central' || rawScope === 'state' ? rawScope : 'all';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [schemes, setSchemes] = useState<SchemeMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(!locationState?.matchData);

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>(initialCategory);
  const [selectedScope, setSelectedScope] = useState<'all' | 'central' | 'state'>(initialScope);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [searchFilter, setSearchFilter] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Toast Notification State for Bookmarks
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search input for silky-smooth UI rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  // Sync state when URL searchParams changes externally (navigation, browser back/forward, chips)
  useEffect(() => {
    const cat = normalizeCategoryParam(searchParams.get('category'));
    const q = searchParams.get('q') || '';
    const st = searchParams.get('state') || locationState?.profile?.state || 'all';
    const rawSc = searchParams.get('scope');
    const sc: 'all' | 'central' | 'state' = rawSc === 'central' || rawSc === 'state' ? rawSc : 'all';
    const pg = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    setSelectedCategory((prev) => (prev !== cat ? cat : prev));
    setSearchFilter((prev) => (prev !== q ? q : prev));
    setDebouncedSearch((prev) => (prev !== q ? q : prev));
    setSelectedState((prev) => (prev !== st ? st : prev));
    setSelectedScope((prev) => (prev !== sc ? sc : prev));
    setCurrentPage((prev) => (prev !== pg ? pg : prev));
  }, [searchParams, locationState?.profile?.state]);

  // Reflect active filter state into URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (debouncedSearch.trim()) {
      params.set('q', debouncedSearch.trim());
    }
    if (selectedState !== 'all') {
      params.set('state', selectedState);
    }
    if (selectedScope !== 'all') {
      params.set('scope', selectedScope);
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();
    if (currentQuery !== newQuery) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, debouncedSearch, selectedState, selectedScope, currentPage, searchParams, setSearchParams]);

  // Reset page to 1 whenever non-pagination filters change
  const prevFiltersRef = useRef({ selectedCategory, selectedScope, selectedState, debouncedSearch });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.selectedCategory !== selectedCategory ||
      prev.selectedScope !== selectedScope ||
      prev.selectedState !== selectedState ||
      prev.debouncedSearch !== debouncedSearch
    ) {
      prevFiltersRef.current = { selectedCategory, selectedScope, selectedState, debouncedSearch };
      setCurrentPage(1);
    }
  }, [selectedCategory, selectedScope, selectedState, debouncedSearch]);

  useEffect(() => {
    if (locationState?.matchData?.schemes) {
      setSchemes(locationState.matchData.schemes);
      setLoading(false);
      return;
    }

    const loadDefaultSchemes = async () => {
      setLoading(true);
      try {
        const searchRes = await searchSchemes('', '', '', 100);
        setSchemes(searchRes.schemes);
      } catch (searchErr) {
        console.error("Failed to load catalog schemes via search, trying fallback:", searchErr);
        try {
          const defaultProfile: ProfileInput = {
            state: 'all',
            age: 25,
            gender: 'Female',
            caste: 'General',
            income: 150000,
            residence: 'All',
            life_stage: 'all',
            is_bpl: false,
            has_disability: false,
            limit: 50
          };
          const res = await matchSchemes(defaultProfile);
          setSchemes(res.schemes);
        } catch (fallbackErr) {
          console.error("Failed to load fallback schemes:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDefaultSchemes();
  }, [locationState]);

  // Compute counts for each category chip dynamically under active scope, state & search filters
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilterType, number> = {
      all: 0,
      education: 0,
      maternity: 0,
      business: 0,
      pension: 0,
    };

    const scopeAndStateFiltered = schemes.filter((s) => {
      // Scope filter (Central vs State)
      const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
      if (selectedScope === 'central' && !isCentral) return false;
      if (selectedScope === 'state' && isCentral) return false;

      // State filter (Central + Selected State schemes)
      if (!matchesState(s, selectedState)) return false;

      // Search within results
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matches =
          s.name.toLowerCase().includes(query) ||
          s.benefits.toLowerCase().includes(query) ||
          s.ministry.toLowerCase().includes(query) ||
          (s.category && s.category.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });

    counts.all = scopeAndStateFiltered.length;
    counts.education = scopeAndStateFiltered.filter((s) => matchesCategory(s, 'education')).length;
    counts.maternity = scopeAndStateFiltered.filter((s) => matchesCategory(s, 'maternity')).length;
    counts.business = scopeAndStateFiltered.filter((s) => matchesCategory(s, 'business')).length;
    counts.pension = scopeAndStateFiltered.filter((s) => matchesCategory(s, 'pension')).length;

    return counts;
  }, [schemes, selectedScope, selectedState, debouncedSearch]);

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Scope filter (Central vs State)
      const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
      if (selectedScope === 'central' && !isCentral) return false;
      if (selectedScope === 'state' && isCentral) return false;

      // State filter
      if (!matchesState(s, selectedState)) {
        return false;
      }

      // Category filter
      if (!matchesCategory(s, selectedCategory)) {
        return false;
      }

      // Search within results
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matches =
          s.name.toLowerCase().includes(query) ||
          s.benefits.toLowerCase().includes(query) ||
          s.ministry.toLowerCase().includes(query) ||
          (s.category && s.category.toLowerCase().includes(query));
        if (!matches) return false;
      }

      return true;
    });
  }, [schemes, selectedScope, selectedState, selectedCategory, debouncedSearch]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredSchemes.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredSchemes.length);
  const paginatedSchemes = useMemo(() => {
    return filteredSchemes.slice(startIndex, endIndex);
  }, [filteredSchemes, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSelectedScope('all');
    setSelectedState('all');
    setSelectedCategory('all');
    setSearchFilter('');
    setDebouncedSearch('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const isFiltered = selectedScope !== 'all' || selectedState !== 'all' || selectedCategory !== 'all' || debouncedSearch.trim() !== '';

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
      
      {/* Scroll Anchor */}
      <div ref={catalogTopRef} id="results-catalog-anchor" className="scroll-mt-6" />

      {/* Toast Notification */}
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

      {/* Top Back Action */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link 
          to="/find" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('resultsRefineProfile')}</span>
        </Link>
      </div>

      {/* Main Results Title Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {t('resultsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5">
          {t('resultsSubtitle')}
        </p>
      </div>

      {/* 1-Row Horizontal Category Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cream-300 shadow-card mb-8 space-y-4">
        
        {/* Top Controls Row: Search Input + State Selector + Scope Pill Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t('searchInResults')}
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-cream-50 rounded-2xl border border-cream-300 text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all font-medium"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter('');
                    setDebouncedSearch('');
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] text-charcoal-500 hover:text-charcoal-900 p-1.5 rounded-full hover:bg-cream-200 transition-colors flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* State Filter Dropdown (28 States + 8 UTs) */}
            <div className="relative sm:max-w-[210px] w-full">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label={t('filterStateLabel')}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm bg-cream-50 rounded-2xl border border-cream-300 text-charcoal-900 font-semibold focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all cursor-pointer truncate"
              >
                <option value="all">📍 {t('filterStateAll')}</option>
                <option value="central">🏛️ {t('filterScopeCentral')}</option>
                <optgroup label={t('filterOptgroupStates')}>
                  {STATES_ONLY_DATA.map((st) => (
                    <option key={st.value} value={st.value}>
                      {language === 'hi' ? st.labelHi : st.labelEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t('filterOptgroupUTs')}>
                  {UNION_TERRITORIES_DATA.map((ut) => (
                    <option key={ut.value} value={ut.value}>
                      {language === 'hi' ? ut.labelHi : ut.labelEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Scope Pill Toggle (All | Central | State) */}
          <div className="inline-flex items-center p-1 bg-cream-100 rounded-2xl border border-cream-200/80 shadow-xs self-start lg:self-auto w-full sm:w-auto">
            {(['all', 'central', 'state'] as const).map((sc) => {
              const isActive = selectedScope === sc;
              return (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setSelectedScope(sc)}
                  className={`flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-saffron-800 shadow-xs ring-1 ring-black/5 font-extrabold'
                      : 'text-charcoal-700 hover:text-charcoal-900'
                  }`}
                >
                  <span>
                    {sc === 'all'
                      ? t('filterScopeAll')
                      : sc === 'central'
                      ? `🏛️ ${t('filterScopeCentral')}`
                      : `📍 ${t('filterScopeState')}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Row Horizontal Scrollable Category Filter Bar */}
        <div className="pt-3 border-t border-cream-200">
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none scroll-smooth touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
            role="tablist"
            aria-label="Scheme Categories"
          >
            {CATEGORY_ITEMS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group min-h-[44px] sm:min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-saffron-500 text-white shadow-sm font-black scale-102 ring-2 ring-saffron-500/30'
                      : 'bg-cream-100/90 text-charcoal-800 hover:bg-cream-200 hover:text-charcoal-900 border border-cream-300 active:scale-98'
                  }`}
                >
                  <span>{t(cat.labelKey)}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-black tracking-tight transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-cream-200 text-charcoal-700 group-hover:bg-cream-300 group-hover:text-charcoal-900'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Results Header Count & Reset Action */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-charcoal-900 flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-xl bg-saffron-100 text-saffron-800 font-black text-sm sm:text-base border border-saffron-200">
            {loading ? '...' : filteredSchemes.length}
          </span>
          <span>{t('resultsFoundCount')}</span>
        </h2>

        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-saffron-700 hover:text-saffron-900 hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl bg-saffron-50 border border-saffron-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('emptyResetFilters')}</span>
          </button>
        )}
      </div>

      {/* Matched Schemes Grid */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 animate-pulse">
            <Sparkles className="w-4 h-4 text-saffron-600 animate-spin" />
            <span>
              {language === 'hi'
                ? 'आपकी पात्रता की गणना की जा रही है...'
                : 'Calculating eligible schemes for your profile...'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SchemeCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="space-y-8">
          {/* Schemes Card Grid (Paginated) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSchemes.map((scheme) => (
              <SchemeCard 
                key={scheme.scheme_id} 
                scheme={scheme} 
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cream-300 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Summary showing X - Y of Z schemes */}
              <div className="text-xs sm:text-sm text-charcoal-600 font-medium">
                {t('paginationShowing')} <span className="font-bold text-charcoal-900">{startIndex + 1}</span>–<span className="font-bold text-charcoal-900">{endIndex}</span> {t('paginationOf')} <span className="font-bold text-charcoal-900">{filteredSchemes.length}</span> {t('paginationSchemes')}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="min-h-[40px] px-3 sm:px-4 py-2 rounded-2xl border border-cream-300 bg-cream-50 hover:bg-cream-100 disabled:opacity-40 disabled:pointer-events-none text-charcoal-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('paginationPrev')}</span>
                </button>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] min-h-[40px] rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-saffron-500 text-white shadow-sm ring-2 ring-saffron-500/30 scale-105 font-black'
                          : 'bg-cream-50 text-charcoal-700 hover:bg-cream-200 border border-cream-200'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="min-h-[40px] px-3 sm:px-4 py-2 rounded-2xl border border-cream-300 bg-cream-50 hover:bg-cream-100 disabled:opacity-40 disabled:pointer-events-none text-charcoal-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95"
                  aria-label="Next Page"
                >
                  <span className="hidden sm:inline">{t('paginationNext')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      ) : (
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
              className="px-6 py-3 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98"
            >
              {t('emptyResetFilters')}
            </button>
            <Link
              to="/find"
              className="px-6 py-3 rounded-2xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 font-semibold text-xs sm:text-sm transition-colors"
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
