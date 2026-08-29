import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SchemeCard } from '../components/schemes/SchemeCard';
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
  Loader2, 
  Filter
} from 'lucide-react';

export const Results: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  // Navigation State from Wizard
  const locationState = location.state as { matchData?: MatchResponse; profile?: ProfileInput } | undefined;

  const [schemes, setSchemes] = useState<SchemeMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(!locationState?.matchData);
  const [executionTime, setExecutionTime] = useState<number>(locationState?.matchData?.execution_time_ms ?? 0.25);

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | 'central' | 'state'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // If navigated directly without state, run a default match so the page is never blank
  useEffect(() => {
    if (locationState?.matchData?.schemes) {
      setSchemes(locationState.matchData.schemes);
      setExecutionTime(locationState.matchData.execution_time_ms || 0.25);
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
        const res = await matchSchemes(defaultProfile);
        setSchemes(res.schemes);
        setExecutionTime(res.execution_time_ms);
      } catch (e) {
        // Fallback to keyword search
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
        // Category filter
        if (selectedCategory !== 'all' && s.category !== selectedCategory) {
          return false;
        }

        // Scope filter (Central vs State)
        const isCentral = !s.state || s.state.toLowerCase() === 'all' || s.state.toLowerCase() === 'all india';
        if (selectedScope === 'central' && !isCentral) return false;
        if (selectedScope === 'state' && isCentral) return false;

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
        return a.name.localeCompare(b.name);
      });
  }, [schemes, selectedCategory, selectedScope, sortBy, searchFilter]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedScope('all');
    setSortBy('score');
    setSearchFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link 
          to="/wizard" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('resultsRefineProfile')}</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-charcoal-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 font-semibold border border-forest-200">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            9-Rule Engine
          </span>
          <span className="inline-flex items-center gap-1 text-charcoal-500">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            {t('resultsExecutionTime')} {executionTime} ms
          </span>
        </div>
      </div>

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
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-card mb-10 space-y-4">
        
        {/* Row 1: Search within results + Scope Toggles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Keyword Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t('searchInResults')}
              className="w-full pl-10 pr-4 py-2 text-sm bg-cream-50 rounded-xl border border-cream-300 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-saffron-500"
            />
          </div>

          {/* Scope Filter Buttons (All / Central / State) */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl w-full md:w-auto">
            {(['all', 'central', 'state'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScope(sc)}
                className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedScope === sc
                    ? 'bg-white text-saffron-800 shadow-xs'
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-medium text-charcoal-500 whitespace-nowrap hidden sm:inline">
              {t('sortLabel')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
              className="w-full md:w-auto py-2 px-3 rounded-xl border border-cream-300 bg-cream-50 text-xs font-medium text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-saffron-500"
            >
              <option value="score">{t('sortHighestMatch')}</option>
              <option value="name">{t('sortNameAsc')}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Chips */}
        {categories.length > 0 && (
          <div className="pt-3 border-t border-cream-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-saffron-600" />
              {t('filterCategory')}:
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-saffron-500 text-white font-bold'
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
                    ? 'bg-saffron-500 text-white font-bold'
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-charcoal-900">
          <span className="text-saffron-600">{filteredSchemes.length}</span> {t('resultsFoundCount')}
        </h2>

        {(selectedCategory !== 'all' || selectedScope !== 'all' || searchFilter.trim()) && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-saffron-700 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('emptyResetFilters')}</span>
          </button>
        )}
      </div>

      {/* Main Content: Loading, Grid, or Empty State */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-saffron-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-charcoal-600">
            {language === 'hi' 
              ? '9 नियमों द्वारा आपकी पात्रता की गणना की जा रही है...' 
              : 'Calculating your entitlements with 9-rule match engine...'}
          </p>
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme.scheme_id} scheme={scheme} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 border border-cream-300 shadow-card text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-saffron-50 text-saffron-600 mx-auto flex items-center justify-center">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900">
            {t('emptyResultsTitle')}
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            {t('emptyResultsDesc')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-medium text-sm transition-colors"
            >
              {t('emptyResetFilters')}
            </button>
            <Link
              to="/wizard"
              className="px-5 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 font-medium text-sm transition-colors"
            >
              {t('emptyBackToWizard')}
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
