import React, { useState, useEffect, useMemo } from 'react';
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
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Building2, 
  Gift, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  UserCheck,
  X,
  BookmarkCheck,
  Calendar,
  IndianRupee,
  MapPin,
  Tag,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';

const DEFAULT_PROFILE: ProfileInput = {
  state: 'Uttar Pradesh',
  age: 26,
  gender: 'Female',
  caste: 'General',
  income: 120000,
  residence: 'Rural',
  life_stage: 'all',
  is_bpl: false,
  has_disability: false,
  limit: 10
};

function parseDocuments(docString?: string): string[] {
  if (!docString) return [];
  return docString
    .split(/[,;\n]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 2);
}

function parseEligibilityPoints(eligibilityText?: string): string[] {
  if (!eligibilityText) return [];
  // Split on bullets, semicolons, or sentence delimiters
  const points = eligibilityText
    .split(/(?:•|\n|;|\.\s+)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);
  return points.length > 0 ? points : [eligibilityText];
}

export const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t, language: siteLanguage } = useLanguage();

  // Active Tab: 'benefits' | 'eligibility' | 'documents' | 'apply'
  const [activeTab, setActiveTab] = useState<'benefits' | 'eligibility' | 'documents' | 'apply'>('benefits');

  // Scheme Data State
  const [scheme, setScheme] = useState<SchemeMatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bookmark State
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Document Checklist State
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // AI Plain-Language Explanation State
  const passedProfile = (location.state as { profile?: ProfileInput } | undefined)?.profile;
  const activeProfile = passedProfile || DEFAULT_PROFILE;
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);

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

  // Auto-fetch plain-language AI summary on scheme load and on language change
  useEffect(() => {
    if (!scheme) return;
    setExplainLoading(true);

    explainSchemeEligibility({
      scheme_id: scheme.scheme_id,
      profile: activeProfile,
      language: siteLanguage
    })
      .then((res) => {
        if (res?.summary) {
          setExplanation(res);
        }
      })
      .catch((err) => {
        console.warn("Auto-summary fetch fallback applied:", err);
      })
      .finally(() => {
        setExplainLoading(false);
      });
  }, [scheme?.scheme_id, siteLanguage]);

  // Resilient fallback summary text if API is offline or generating
  const displaySummaryText = useMemo(() => {
    if (explanation?.summary && explanation.summary.trim().length > 0) {
      return explanation.summary;
    }
    if (!scheme) return '';

    if (siteLanguage === 'hi') {
      return `${scheme.name} के अंतर्गत पात्र नागरिकों को ${scheme.benefits} प्रदान किया जाता है। यह योजना विशेष रूप से लक्षित लाभार्थियों को सामाजिक व आर्थिक सुरक्षा देने के लिए शुरू की गई है।`;
    }
    return `Under ${scheme.name}, eligible beneficiaries receive ${scheme.benefits}. This initiative directly provides financial assistance and welfare support.`;
  }, [scheme, explanation?.summary, siteLanguage]);

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

  const documentsList = useMemo(() => {
    return parseDocuments(scheme?.documents_required);
  }, [scheme?.documents_required]);

  const readyDocsCount = useMemo(() => {
    return documentsList.filter((doc) => !!checkedDocs[doc]).length;
  }, [documentsList, checkedDocs]);

  const docProgressPercentage = useMemo(() => {
    if (documentsList.length === 0) return 100;
    return Math.round((readyDocsCount / documentsList.length) * 100);
  }, [documentsList, readyDocsCount]);

  const eligibilityPoints = useMemo(() => {
    return parseEligibilityPoints(scheme?.eligibility_text);
  }, [scheme?.eligibility_text]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-cream-200 rounded-md" />
        <div className="bg-white rounded-3xl p-8 border border-cream-200 space-y-6">
          <div className="space-y-3">
            <div className="h-5 w-28 bg-cream-200 rounded-full" />
            <div className="h-8 w-4/5 bg-cream-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-cream-100 rounded-md" />
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
            {t('detailSchemeNotFoundDesc')}
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 relative">
      
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
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detailBackToResults')}</span>
        </Link>
      </div>

      {/* 1. SCHEME HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-saffron-100 shadow-card space-y-4">
        
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-300 ring-1 ring-forest-200/50 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              <span>{t('badgeEligible')}</span>
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-800 border border-cream-200">
              {isCentral ? `🏛️ ${t('tagCentral')}` : `📍 ${scheme.state} ${t('tagState')}`}
            </span>

            {scheme.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-saffron-50 text-saffron-800 border border-saffron-200">
                🌱 {scheme.category}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            className={`min-w-[48px] min-h-[48px] p-2.5 rounded-2xl border transition-all flex items-center justify-center ${
              bookmarked 
                ? 'bg-saffron-100 text-saffron-700 border-saffron-300 shadow-xs' 
                : 'border-cream-300 text-charcoal-700 hover:bg-cream-100 hover:text-saffron-700'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
          </button>
        </div>

        {/* Scheme Title & Ministry */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            {scheme.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-1.5 flex items-center gap-1.5 font-bold">
            <Building2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{scheme.ministry}</span>
          </p>
        </div>

        {/* Plain-Language AI Summary Box (Auto-rendered, No User Clicks, Zero Model Jargon) */}
        {explainLoading && !explanation?.summary ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-saffron-50/70 border border-saffron-200 animate-pulse flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-saffron-600 animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-saffron-900">
              {siteLanguage === 'hi' ? 'सरल भाषा में मुख्य लाभ तैयार हो रहे हैं...' : 'Generating easy-to-read summary...'}
            </span>
          </div>
        ) : displaySummaryText ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-saffron-50/90 via-amber-50/70 to-cream-50 border-2 border-saffron-300 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-saffron-900 font-extrabold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-saffron-600" />
              <span>{siteLanguage === 'hi' ? 'इस योजना का सार (सरल भाषा में)' : 'Scheme Quick Summary'}</span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-medium">
              {displaySummaryText}
            </p>
          </div>
        ) : null}

      </div>

      {/* 2. myScheme 4-TAB NAVIGATION */}
      <div 
        role="tablist"
        aria-label="Scheme Details Navigation"
        className="flex items-center gap-2 border-b border-cream-300 pb-1 overflow-x-auto scrollbar-none scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {[
          { id: 'benefits', label: t('detailTabBenefits'), icon: <Gift className="w-4 h-4" /> },
          { id: 'eligibility', label: t('detailTabEligibility'), icon: <UserCheck className="w-4 h-4" /> },
          { id: 'documents', label: t('detailTabDocuments'), icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'apply', label: t('detailTabHowToApply'), icon: <Globe className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[48px] flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-saffron-500 text-white shadow-md scale-102 ring-2 ring-saffron-500/20'
                  : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-100 bg-white border border-cream-300 font-bold'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT PANELS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card">
        
        {/* ========================================================================= */}
        {/* TAB 1: क्या मिलेगा (BENEFITS) */}
        {/* ========================================================================= */}
        {activeTab === 'benefits' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <Gift className="w-5 h-5 text-forest-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailBenefitsTitle')}
              </h2>
            </div>

            {/* Highlight Benefits Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-forest-50 border border-forest-200/90 text-forest-950 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>{siteLanguage === 'hi' ? 'मुख्य सहायता व वित्तीय लाभ' : 'Key Assistance & Financial Grants'}</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-semibold text-forest-900">
                {scheme.benefits}
              </p>
            </div>

            {/* AI Summarized Benefit Highlights */}
            {explanation?.key_benefits && explanation.key_benefits.length > 0 && (
              <div className="space-y-3 pt-1">
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-saffron-600" />
                  <span>{t('aiExplainBenefitsTitle')}:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {explanation.key_benefits.map((benefit, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl bg-cream-50/90 border border-cream-200 flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beneficiary Target Note */}
            {scheme.beneficiary_type && (
              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3 text-xs sm:text-sm text-charcoal-700">
                <Tag className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                <span>
                  <strong className="text-charcoal-900">{siteLanguage === 'hi' ? 'लक्षित लाभार्थी:' : 'Target Beneficiaries:'}</strong> {scheme.beneficiary_type}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: कौन पात्र है (ELIGIBILITY) */}
        {/* ========================================================================= */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <UserCheck className="w-5 h-5 text-saffron-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailEligibilityTitle')}
              </h2>
            </div>

            {/* Snapshot 4-Grid Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailAgeLimit')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm">
                  {scheme.age_min ?? 0} – {scheme.age_max ?? 100} {siteLanguage === 'hi' ? 'वर्ष' : 'Yrs'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <IndianRupee className="w-3.5 h-3.5 text-forest-600" />
                  <span>{t('detailIncomeLimit')}</span>
                </div>
                <div className="font-bold text-forest-700 text-sm">
                  {scheme.income_max && scheme.income_max > 0 
                    ? `≤ ₹${scheme.income_max.toLocaleString('en-IN')}` 
                    : t('detailNoIncomeLimit')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <Tag className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailCaste')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm line-clamp-1">
                  {scheme.caste_categories || (siteLanguage === 'hi' ? 'सभी वर्ग' : 'All Categories')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailResidence')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm">
                  {scheme.residence || (siteLanguage === 'hi' ? 'ग्रामीण व शहरी' : 'Rural & Urban')}
                </div>
              </div>
            </div>

            {/* Special Eligibility Priority Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {scheme.requires_bpl && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{siteLanguage === 'hi' ? 'बीपीएल / अंत्योदय कार्ड धारक प्राथमिकता' : 'BPL / Antyodaya Priority'}</span>
                </span>
              )}
              {scheme.requires_disability && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>{siteLanguage === 'hi' ? 'दिव्यांग (PwD) सहायता' : 'PwD Priority'}</span>
                </span>
              )}
              {scheme.gender && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cream-100 text-charcoal-800 border border-cream-300">
                  {siteLanguage === 'hi' ? 'लिंग:' : 'Gender:'} {scheme.gender}
                </span>
              )}
            </div>

            {/* Structured Criteria Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide">
                {siteLanguage === 'hi' ? 'विस्तृत पात्रता विवरण:' : 'Detailed Eligibility Criteria:'}
              </h3>
              <div className="space-y-2.5">
                {eligibilityPoints.map((point, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200 flex items-start gap-3 text-xs sm:text-sm text-charcoal-800 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: जरूरी कागजात (DOCUMENTS CHECKLIST) */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                  {t('detailDocumentsTitle')}
                </h2>
              </div>
              
              {documentsList.length > 0 && (
                <span className={`text-xs font-bold px-3.5 py-1 rounded-full border transition-all ${
                  readyDocsCount === documentsList.length
                    ? 'bg-forest-100 text-forest-900 border-forest-300'
                    : 'bg-saffron-50 text-saffron-900 border-saffron-200'
                }`}>
                  {readyDocsCount} / {documentsList.length} {t('detailDocReady')} ({docProgressPercentage}%)
                </span>
              )}
            </div>

            {/* Live Document Preparation Progress Bar */}
            {documentsList.length > 0 && (
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      docProgressPercentage === 100 ? 'bg-forest-500' : 'bg-saffron-500'
                    }`}
                    style={{ width: `${docProgressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal-600">
                  {docProgressPercentage === 100 
                    ? t('detailDocsAllReady') 
                    : t('detailDocsChecklistHelp')}
                </p>
              </div>
            )}

            {/* Interactive Document Checklist Items */}
            {documentsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentsList.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDocCheck(doc)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                        isChecked
                          ? 'bg-forest-50/90 border-forest-300 text-forest-950 font-semibold shadow-2xs ring-1 ring-forest-300/50'
                          : 'bg-white border-cream-300 text-charcoal-700 hover:bg-cream-50 hover:border-cream-400'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm leading-snug block">{doc}</span>
                        <span className="text-[10px] text-charcoal-500 block">
                          {isChecked ? `✓ ${t('detailDocReady')}` : `○ ${t('detailDocPending')}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center gap-3 text-xs sm:text-sm text-charcoal-600">
                <FileText className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                <span>
                  {siteLanguage === 'hi' 
                    ? 'सामान्य पहचान पत्र (आधार कार्ड / वोटर आईडी / बैंक पासबुक / निवास प्रमाण पत्र) साथ रखें।' 
                    : 'Standard identity and residence documents (Aadhaar, Voter ID, Bank Passbook) required.'}
                </span>
              </div>
            )}

            {/* Helpful advice for obtaining missing certificates */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{t('detailDocsMissingTip')}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: आवेदन कैसे करें (HOW TO APPLY) */}
        {/* ========================================================================= */}
        {activeTab === 'apply' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <Globe className="w-5 h-5 text-saffron-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailApplicationProcessTitle')}
              </h2>
            </div>

            {/* 3-Step Guided Process Cards */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-saffron-100 text-saffron-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {t('detailApplyStep1Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                    {t('detailApplyStep1Desc')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-saffron-100 text-saffron-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {t('detailApplyStep2Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                    {t('detailApplyStep2Desc')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-saffron-100 text-saffron-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {t('detailApplyStep3Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                    {t('detailApplyStep3Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Instructions if present */}
            {scheme.application_process && (
              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed space-y-1">
                <span className="font-bold block text-charcoal-900">
                  {siteLanguage === 'hi' ? 'आधिकारिक निर्देश:' : 'Official Guidelines:'}
                </span>
                <p>{scheme.application_process}</p>
              </div>
            )}

            {/* Offline Assistance Box (CSC / Anganwadi / Panchayat Kendra) */}
            <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-1.5 shadow-2xs">
              <span className="font-bold text-sm text-blue-900 block flex items-center gap-2">
                <span>{t('detailCscCenterTitle')}</span>
              </span>
              <p className="leading-relaxed text-blue-900/90">
                {t('detailCscCenterDesc')}
              </p>
            </div>

            {/* Official Link Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {scheme.apply_url && (
                <a
                  href={scheme.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-sm shadow-md transition-all hover:scale-102 active:scale-98 inline-flex items-center justify-center gap-2"
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
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-cream-300 hover:bg-cream-100 text-charcoal-700 font-semibold text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>{t('detailOfficialWebsite')}</span>
                  <ExternalLink className="w-4 h-4 text-charcoal-400" />
                </a>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default SchemeDetail;

