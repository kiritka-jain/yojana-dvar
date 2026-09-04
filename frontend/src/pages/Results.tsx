import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  CheckCircle2,
  X,
  BookmarkCheck,
  Edit3
} from 'lucide-react';

export type CategoryFilterType = 'all' | 'education' | 'maternity' | 'business' | 'pension';

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
        name.includes('pragati')
      );
    case 'maternity':
      return (
        tags.some((t) => ['maternal', 'mother', 'pregnant', 'maternity', 'nutrition'].includes(t)) ||
        cat.includes('maternal') ||
        cat.includes('child health') ||
        cat.includes('nutrition') ||
        name.includes('matru') ||
        name.includes('मातृत्व') ||
        name.includes('पोषण') ||
        name.includes('pmmvy') ||
        name.includes('janani') ||
        benefits.includes('गर्भवती') ||
        benefits.includes('maternity') ||
        benefits.includes('lactating')
      );
    case 'business':
      return (
        tags.some((t) => ['entrepreneur', 'business', 'working_women', 'housing', 'shg', 'loan', 'employment'].includes(t)) ||
        tags.includes('entrepreneur') ||
        cat.includes('entrepreneur') ||
        cat.includes('loan') ||
        cat.includes('employment') ||
        cat.includes('business') ||
        cat.includes('shg') ||
        cat.includes('safe housing') ||
        name.includes('mudra') ||
        name.includes('stand up') ||
        name.includes('shg') ||
        name.includes('उद्यम') ||
        name.includes('स्वरोजगार') ||
        name.includes('ऋण') ||
        name.includes('hostel') ||
        name.includes('working women') ||
        name.includes('pmegp')
      );
    case 'pension':
      return (
        tags.some((t) => ['senior', 'pension', 'widow', 'elderly', 'social_security', 'disability'].includes(t)) ||
        cat.includes('pension') ||
        cat.includes('social security') ||
        cat.includes('social empowerment') ||
        name.includes('pension') ||
        name.includes('पेंशन') ||
        name.includes('वृद्धावस्था') ||
        name.includes('विधवा') ||
        name.includes('सुरक्षा') ||
        name.includes('ignwps') ||
        name.includes('igndps') ||
        name.includes('ignoaps') ||
        name.includes('atal pension')
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
    <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-xs animate-pulse flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-cream-200 rounded-full" />
            <div className="h-5 w-20 bg-cream-100 rounded-full" />
          </div>
          <div className="w-8 h-8 bg-cream-200 rounded-xl" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-5 bg-cream-200 rounded-md w-4/5" />
          <div className="h-5 bg-cream-200 rounded-md w-3/5" />
        </div>

        <div className="h-3.5 bg-cream-100 rounded-md w-1/2" />

        <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-2">
          <div className="h-3 bg-cream-200 rounded w-1/4" />
          <div className="h-3.5 bg-cream-200 rounded w-full" />
          <div className="h-3.5 bg-cream-200 rounded w-4/5" />
        </div>
      </div>

      <div className="pt-3 border-t border-cream-200">
        <div className="h-10 w-full bg-cream-200 rounded-2xl" />
      </div>
    </div>
  );
};

export const Results: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const locationState = location.state as { matchData?: MatchResponse; profile?: ProfileInput } | undefined;

  const [schemes, setSchemes] = useState<SchemeMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(!locationState?.matchData);
  const [userProfile, setUserProfile] = useState<ProfileInput | undefined>(locationState?.profile);

  // Filter & Sort State (Single Horizontal Chip Bar)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | 'central' | 'state'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Toast Notification State for Bookmarks
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (locationState?.matchData?.schemes) {
      setSchemes(locationState.matchData.schemes);
      setUserProfile(locationState.profile);
      setLoading(false);
      return;
    }

    const loadDefaultSchemes = async () => {
      setLoading(true);
      try {
        const defaultProfile: ProfileInput = {
          state: 'Uttar Pradesh',
          age: 26,
          gender: 'Female',
          caste: 'General',
          income: 120000,
          residence: 'All',
          life_stage: 'maternal',
          is_bpl: false,
          has_disability: false,
          limit: 15
        };
        setUserProfile(defaultProfile);
        const res = await matchSchemes(defaultProfile);
        setSchemes(res.schemes);
      } catch {
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

  // Compute counts for each category chip under current scope & search filters
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilterType, number> = {
      all: 0,
      education: 0,
      maternity: 0,
      business: 0,
      pension: 0,
    };

    const scopeAndSearchFiltered = schemes.filter((s) => {
      const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
      if (selectedScope === 'central' && !isCentral) return false;
      if (selectedScope === 'state' && isCentral) return false;

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
    });

    counts.all = scopeAndSearchFiltered.length;
    counts.education = scopeAndSearchFiltered.filter((s) => matchesCategory(s, 'education')).length;
    counts.maternity = scopeAndSearchFiltered.filter((s) => matchesCategory(s, 'maternity')).length;
    counts.business = scopeAndSearchFiltered.filter((s) => matchesCategory(s, 'business')).length;
    counts.pension = scopeAndSearchFiltered.filter((s) => matchesCategory(s, 'pension')).length;

    return counts;
  }, [schemes, selectedScope, searchFilter]);

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Scope filter (Central vs State)
      const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
      if (selectedScope === 'central' && !isCentral) return false;
      if (selectedScope === 'state' && isCentral) return false;

      // Category filter
      if (!matchesCategory(s, selectedCategory)) {
        return false;
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
    });
  }, [schemes, selectedScope, selectedCategory, searchFilter]);

  const handleResetFilters = () => {
    setSelectedScope('all');
    setSelectedCategory('all');
    setSearchFilter('');
  };

  const isFiltered = selectedScope !== 'all' || selectedCategory !== 'all' || searchFilter.trim() !== '';

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

      {/* Profile Context Summary Bar */}
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
              👤 {userProfile.age} {language === 'hi' ? 'वर्ष' : 'Yrs'}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800">
              🏷️ {userProfile.caste}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-cream-300 font-semibold text-charcoal-800 capitalize">
              🌱 {userProfile.life_stage}
            </span>
            {userProfile.is_bpl && (
              <span className="bg-saffron-500 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                BPL
              </span>
            )}
          </div>

          <Link
            to="/find"
            className="text-xs font-bold text-saffron-700 hover:text-saffron-900 inline-flex items-center gap-1 hover:underline whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('wizardEdit')}</span>
          </Link>
        </div>
      )}

      {/* Main Results Title Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {t('resultsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5">
          {t('resultsSubtitle')}
        </p>
      </div>

      {/* 1-Row Horizontal Category Filter Bar (myScheme Style) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cream-300 shadow-card mb-8 space-y-4">
        
        {/* Top Controls Row: Search Input + Scope Pill Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                onClick={() => setSearchFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] text-charcoal-500 hover:text-charcoal-900 p-1.5 rounded-full hover:bg-cream-200 transition-colors flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scope Pill Toggle (All | Central | State) */}
          <div className="inline-flex items-center p-1 bg-cream-100 rounded-2xl border border-cream-200/80 shadow-xs self-start sm:self-auto w-full sm:w-auto">
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
