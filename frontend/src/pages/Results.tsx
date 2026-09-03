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
  RotateCcw, 
  CheckCircle2,
  X,
  BookmarkCheck,
  Edit3
} from 'lucide-react';

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
  const [selectedLifeStage, setSelectedLifeStage] = useState<string>('all');
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

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes
      .filter((s) => {
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
      });
  }, [schemes, selectedScope, selectedLifeStage, searchFilter]);

  const handleResetFilters = () => {
    setSelectedScope('all');
    setSelectedLifeStage('all');
    setSearchFilter('');
  };

  const isFiltered = selectedScope !== 'all' || selectedLifeStage !== 'all' || searchFilter.trim() !== '';

  const handleBookmarkChange = (_schemeId: string, isSaved: boolean, schemeName: string) => {
    const text = isSaved 
      ? `"${schemeName.substring(0, 30)}..." ${t('toastBookmarkSaved')}`
      : t('toastBookmarkRemoved');
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null), 3500;
    });
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

      {/* Simplified 1-Row Horizontal Chip Filter Bar (myScheme Style) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cream-300 shadow-card mb-8 space-y-4">
        
        {/* Search input + Scope toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t('searchInResults')}
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-cream-50 rounded-2xl border border-cream-300 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-saffron-500"
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

          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-2xl w-full sm:w-auto">
            {(['all', 'central', 'state'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScope(sc)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
        </div>

        {/* 1-Row Horizontal Category Chips */}
        <div className="pt-3 border-t border-cream-200 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: language === 'hi' ? '🌸 सभी योजनाएं' : '🌸 All Schemes' },
            { id: 'student', label: language === 'hi' ? '🎓 छात्रा / शिक्षा' : '🎓 Student' },
            { id: 'maternal', label: language === 'hi' ? '🤱 मातृत्व व पोषण' : '🤱 Maternal' },
            { id: 'entrepreneur', label: language === 'hi' ? '💼 व्यवसाय व SHG' : '💼 Business / SHG' },
            { id: 'senior', label: language === 'hi' ? '👵 वरिष्ठ नागरिक' : '👵 Senior' },
          ].map((ls) => (
            <button
              key={ls.id}
              onClick={() => setSelectedLifeStage(ls.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedLifeStage === ls.id
                  ? 'bg-saffron-500 text-white shadow-xs font-bold'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {ls.label}
            </button>
          ))}
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
