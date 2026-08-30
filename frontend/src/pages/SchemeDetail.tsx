import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  getSchemeById, 
  explainSchemeEligibility,
  isLocalBookmarked, 
  toggleLocalBookmark 
} from '../services/api';
import type { 
  SchemeMatchResult, 
  ExplainResponse, 
  ProfileInput 
} from '../services/api';
import { parseLifeStageTags } from '../components/schemes/SchemeCard';
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Building2, 
  Gift, 
  FileText, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  ShieldAlert, 
  Send,
  User,
  X,
  BookmarkCheck
} from 'lucide-react';

const DEFAULT_PROFILE: ProfileInput = {
  state: 'Uttar Pradesh',
  age: 26,
  gender: 'Female',
  caste: 'General',
  income: 120000,
  residence: 'Rural',
  life_stage: 'maternal',
  is_bpl: false,
  has_disability: false,
  limit: 10
};

// Helper to clean document strings into array of individual documents
function parseDocuments(docString?: string): string[] {
  if (!docString) return [];
  return docString
    .split(/[,;\n]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 2);
}

export const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t, language: siteLanguage } = useLanguage();

  const explainRef = useRef<HTMLDivElement>(null);

  // Scheme Data State
  const [scheme, setScheme] = useState<SchemeMatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bookmark State
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Document Checklist State
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // AI Explanation State
  const passedProfile = (location.state as { profile?: ProfileInput } | undefined)?.profile;
  const activeProfile = passedProfile || DEFAULT_PROFILE;
  const [explainLanguage, setExplainLanguage] = useState<'en' | 'hi'>(siteLanguage);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Keep explain language in sync with site language changes unless explicitly changed
  useEffect(() => {
    setExplainLanguage(siteLanguage);
  }, [siteLanguage]);

  // Fetch Scheme Details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getSchemeById(id)
      .then((data) => {
        setScheme(data);
        setBookmarked(isLocalBookmarked(data.scheme_id));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Scheme not found');
        setLoading(false);
      });
  }, [id]);

  // Handle URL Hash #explain for auto-scroll and auto-trigger
  useEffect(() => {
    if (location.hash === '#explain' && scheme && explainRef.current) {
      setTimeout(() => {
        explainRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.hash, scheme]);

  // Bookmark Toggle
  const handleBookmarkToggle = () => {
    if (!scheme) return;
    const newState = toggleLocalBookmark(scheme.scheme_id);
    setBookmarked(newState);
    const msg = newState ? t('toastBookmarkSaved') : t('toastBookmarkRemoved');
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Interactive Document Checkbox Toggle
  const toggleDocCheck = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  // Trigger Gemini AI Explanation
  const handleTriggerExplain = async (langOverride?: 'en' | 'hi') => {
    if (!scheme) return;
    const targetLang = langOverride || explainLanguage;
    setExplainLoading(true);
    setExplainError(null);

    try {
      const res = await explainSchemeEligibility({
        scheme_id: scheme.scheme_id,
        profile: activeProfile,
        language: targetLang
      });
      setExplanation(res);
    } catch (err: any) {
      setExplainError(
        err.message || (targetLang === 'hi' 
          ? 'एआई स्पष्टीकरण उत्पन्न करने में विफल रहा। कृपया पुन: प्रयास करें।' 
          : 'Failed to generate AI explanation. Please try again.')
      );
    } finally {
      setExplainLoading(false);
    }
  };

  // Parsed documents list
  const documentsList = useMemo(() => {
    return parseDocuments(scheme?.documents_required);
  }, [scheme?.documents_required]);

  // Prepared documents count
  const readyDocsCount = useMemo(() => {
    return documentsList.filter((doc) => !!checkedDocs[doc]).length;
  }, [documentsList, checkedDocs]);

  // Life stage tags
  const lifeStageTags = useMemo(() => {
    return parseLifeStageTags(scheme?.life_stage_tags);
  }, [scheme?.life_stage_tags]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-cream-200 rounded-md" />
        <div className="bg-white rounded-3xl p-8 border border-cream-200 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-3/4">
              <div className="h-5 w-28 bg-cream-200 rounded-full" />
              <div className="h-8 w-4/5 bg-cream-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-cream-100 rounded-md" />
            </div>
            <div className="h-10 w-32 bg-cream-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-cream-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-cream-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State: Scheme Not Found
  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-charcoal-900">
            {t('detailSchemeNotFound')}
          </h1>
          <p className="text-sm text-charcoal-600 max-w-md mx-auto">
            {t('detailSchemeNotFoundDesc')} (ID: {id})
          </p>
        </div>
        <div>
          <Link
            to="/results"
            className="px-6 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('detailBackToResults')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCentral = !scheme.state || scheme.state.toLowerCase() === 'all' || scheme.state.toLowerCase() === 'all india';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 relative">
      
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

      {/* Breadcrumb Navigation */}
      <div>
        <Link 
          to="/results" 
          state={{ profile: passedProfile }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detailBackToResults')}</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. SCHEME HEADER CARD                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-saffron-100 shadow-card space-y-6">
        
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-saffron-100 text-saffron-800 border border-saffron-200">
              {isCentral ? t('tagCentral') : `${scheme.state} ${t('tagState')}`}
            </span>

            {/* Category Tag */}
            {scheme.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                {scheme.category}
              </span>
            )}

            {/* Scheme ID Slug */}
            <span className="font-mono text-xs text-charcoal-500 bg-cream-100 px-2.5 py-0.5 rounded-md border border-cream-200">
              {scheme.scheme_id}
            </span>
          </div>

          {/* Quick Actions (Bookmark + Apply Button) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
              className={`p-2.5 rounded-xl border transition-all ${
                bookmarked 
                  ? 'bg-saffron-100 text-saffron-700 border-saffron-300 shadow-xs' 
                  : 'border-cream-300 text-charcoal-600 hover:bg-cream-100 hover:text-saffron-700'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
            </button>

            {scheme.apply_url && (
              <a
                href={scheme.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98 inline-flex items-center gap-2"
              >
                <span>{t('detailOfficialPortalCTA')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Scheme Name */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            {scheme.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2 flex items-center gap-1.5 font-medium">
            <Building2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{scheme.ministry} {scheme.department ? `• ${scheme.department}` : ''}</span>
          </p>
        </div>

        {/* Description Snippet */}
        {scheme.description && (
          <p className="text-sm text-charcoal-700 leading-relaxed pt-2 border-t border-cream-200">
            {scheme.description}
          </p>
        )}

        {/* Key Attributes Snapshot Grid */}
        <div className="pt-4 border-t border-cream-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-3">
            {t('detailKeyAttributes')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            
            {/* Age */}
            <div className="p-3.5 rounded-xl bg-cream-50/70 border border-cream-200">
              <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailAgeLimit')}</span>
              <span className="font-bold text-charcoal-900">
                {scheme.age_min ?? 0} – {scheme.age_max ?? 100} {siteLanguage === 'hi' ? 'वर्ष' : 'Years'}
              </span>
            </div>

            {/* Income */}
            <div className="p-3.5 rounded-xl bg-cream-50/70 border border-cream-200">
              <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailIncomeLimit')}</span>
              <span className="font-bold text-forest-700">
                {scheme.income_max && scheme.income_max > 0 
                  ? `≤ ₹${scheme.income_max.toLocaleString('en-IN')}` 
                  : t('detailNoIncomeLimit')}
              </span>
            </div>

            {/* Caste / Social Categories */}
            <div className="p-3.5 rounded-xl bg-cream-50/70 border border-cream-200">
              <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailCaste')}</span>
              <span className="font-bold text-charcoal-900 line-clamp-1">
                {scheme.caste_categories || 'All Categories'}
              </span>
            </div>

            {/* Residence */}
            <div className="p-3.5 rounded-xl bg-cream-50/70 border border-cream-200">
              <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailResidence')}</span>
              <span className="font-bold text-charcoal-900">
                {scheme.residence || 'All Areas'}
              </span>
            </div>

          </div>

          {/* Life Stage Tags */}
          {lifeStageTags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-charcoal-600 mr-1">{t('detailLifeStageTags')}:</span>
              {lifeStageTags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-saffron-50 text-saffron-900 border border-saffron-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. GEMINI AI EXPLANATION COMPONENT (#explain)                             */}
      {/* ========================================================================= */}
      <div 
        id="explain" 
        ref={explainRef}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-cream-50 to-saffron-50/40 border-2 border-saffron-300/80 shadow-lg space-y-6 transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-saffron-200 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 text-saffron-900 text-xs font-extrabold border border-saffron-300">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>Gemini AI Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              {t('aiExplainTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600">
              {t('aiExplainSubtitle')}
            </p>
          </div>

          {/* AI Language Switcher + Trigger Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-saffron-200 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setExplainLanguage('en');
                  if (explanation) handleTriggerExplain('en');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  explainLanguage === 'en'
                    ? 'bg-saffron-500 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplainLanguage('hi');
                  if (explanation) handleTriggerExplain('hi');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  explainLanguage === 'hi'
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Trigger Button */}
            <button
              type="button"
              disabled={explainLoading}
              onClick={() => handleTriggerExplain()}
              className="px-5 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
            >
              {explainLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{siteLanguage === 'hi' ? 'विश्लेषण जारी...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{t('aiExplainTriggerBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demographic Context Pill */}
        <div className="text-xs text-charcoal-600 flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-charcoal-800 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-saffron-600" />
            {siteLanguage === 'hi' ? 'प्रोफ़ाइल आधार:' : 'Evaluating for profile:'}
          </span>
          <span className="bg-white px-2.5 py-0.5 rounded border border-saffron-200">
            {activeProfile.state}
          </span>
          <span className="bg-white px-2.5 py-0.5 rounded border border-saffron-200">
            {activeProfile.age} {siteLanguage === 'hi' ? 'वर्ष' : 'Yrs'} • {activeProfile.gender}
          </span>
          <span className="bg-white px-2.5 py-0.5 rounded border border-saffron-200">
            {activeProfile.caste}
          </span>
          <span className="bg-white px-2.5 py-0.5 rounded border border-saffron-200">
            ₹{activeProfile.income.toLocaleString('en-IN')}/yr
          </span>
          <span className="bg-white px-2.5 py-0.5 rounded border border-saffron-200 capitalize">
            {activeProfile.life_stage}
          </span>
        </div>

        {/* Loading State */}
        {explainLoading && (
          <div className="py-10 text-center space-y-3 animate-pulse">
            <Loader2 className="w-8 h-8 text-saffron-600 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-charcoal-900">
              {t('aiExplainLoadingTitle')}
            </h4>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto">
              {t('aiExplainLoadingDesc')}
            </p>
          </div>
        )}

        {/* Error State */}
        {explainError && (
          <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{explainError}</span>
          </div>
        )}

        {/* AI Explanation Content Display */}
        {explanation && !explainLoading && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Model Badge */}
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {explanation.is_fallback ? t('aiExplainFallbackBadge') : t('aiExplainGeminiBadge')}
              </span>
              <span className="text-charcoal-400 font-medium">
                Language: {explanation.language.toUpperCase()}
              </span>
            </div>

            {/* Plain-Language Narrative Summary */}
            <div className="p-5 rounded-2xl bg-white border border-saffron-200 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-saffron-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-saffron-600" />
                {t('aiExplainSummaryTitle')}
              </h3>
              <p className="text-sm sm:text-base text-charcoal-900 leading-relaxed">
                {explanation.summary}
              </p>
            </div>

            {/* Two-Column Grid: Key Benefits & Tailored Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Entitlements You Will Receive */}
              {explanation.key_benefits && explanation.key_benefits.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-forest-200 shadow-xs space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-forest-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-forest-600" />
                    {t('aiExplainBenefitsTitle')}
                  </h4>
                  <ul className="space-y-2">
                    {explanation.key_benefits.map((b, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-charcoal-700 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customized Documents Checklist */}
              {explanation.documents_required && explanation.documents_required.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-saffron-200 shadow-xs space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-saffron-600" />
                    {t('aiExplainDocsTitle')}
                  </h4>
                  <ul className="space-y-2">
                    {explanation.documents_required.map((doc, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-charcoal-700 flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Next Steps to Apply */}
            {explanation.next_steps && (
              <div className="p-4 rounded-2xl bg-cream-100/90 border border-cream-300 space-y-1.5">
                <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-saffron-600" />
                  {t('aiExplainNextStepsTitle')}
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                  {explanation.next_steps}
                </p>
              </div>
            )}

            {/* Mandatory Official Advisory Alert Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-950 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('aiExplainDisclaimerTitle')}</span>
                <span>{explanation.disclaimer}</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. BENEFITS BREAKDOWN SECTION                                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
          <Gift className="w-5 h-5 text-forest-600" />
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
            {t('detailBenefitsTitle')}
          </h2>
        </div>
        <div className="p-5 rounded-2xl bg-forest-50/50 border border-forest-100 text-sm sm:text-base text-forest-950 leading-relaxed">
          {scheme.benefits}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. OFFICIAL ELIGIBILITY CRITERIA SECTION                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
          <FileText className="w-5 h-5 text-saffron-600" />
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
            {t('detailEligibilityTitle')}
          </h2>
        </div>
        <div className="p-5 rounded-2xl bg-cream-50/60 border border-cream-200 text-sm text-charcoal-800 leading-relaxed space-y-2">
          <p>{scheme.eligibility_text}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE DOCUMENT CHECKLIST SECTION                                 */}
      {/* ========================================================================= */}
      {documentsList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-saffron-600" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailDocumentsTitle')}
              </h2>
            </div>
            
            {/* Progress Badge */}
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-saffron-50 text-saffron-800 border border-saffron-200 self-start sm:self-auto">
              {readyDocsCount} / {documentsList.length} {t('detailDocReady')} ({Math.round((readyDocsCount / documentsList.length) * 100)}%)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-charcoal-600">
            {t('detailDocsChecklistHelp')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documentsList.map((doc, idx) => {
              const isChecked = !!checkedDocs[doc];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDocCheck(doc)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isChecked
                      ? 'bg-forest-50/70 border-forest-300 text-forest-950 font-medium'
                      : 'bg-white border-cream-300 text-charcoal-700 hover:bg-cream-50'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs sm:text-sm leading-snug">{doc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. APPLICATION PROCESS & OFFICIAL PORTAL CTA                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
        <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
          <Globe className="w-5 h-5 text-saffron-600" />
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
            {t('detailApplicationProcessTitle')}
          </h2>
        </div>

        {scheme.application_process && (
          <p className="text-sm text-charcoal-800 leading-relaxed">
            {scheme.application_process}
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          {scheme.apply_url && (
            <a
              href={scheme.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-sm shadow-md transition-all hover:scale-102 active:scale-98 inline-flex items-center justify-center gap-2"
            >
              <span>{t('detailOfficialPortalCTA')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {scheme.official_url && (
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-cream-300 hover:bg-cream-100 text-charcoal-700 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>{t('detailOfficialWebsite')}</span>
              <ExternalLink className="w-4 h-4 text-charcoal-400" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
};

export default SchemeDetail;
