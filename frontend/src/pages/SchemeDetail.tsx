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

        // Auto-fetch plain-language AI summary
        setExplainLoading(true);
        explainSchemeEligibility({
          scheme_id: data.scheme_id,
          profile: activeProfile,
          language: siteLanguage
        })
          .then((res) => setExplanation(res))
          .catch(() => {})
          .finally(() => setExplainLoading(false));
      })
      .catch((err) => {
        setError(err.message || 'Scheme not found');
        setLoading(false);
      });
  }, [id, siteLanguage]);

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
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('badgeEligible')}</span>
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-800 border border-cream-200">
              {isCentral ? t('tagCentral') : `${scheme.state} ${t('tagState')}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            className={`p-2.5 rounded-2xl border transition-all ${
              bookmarked 
                ? 'bg-saffron-100 text-saffron-700 border-saffron-300 shadow-xs' 
                : 'border-cream-300 text-charcoal-600 hover:bg-cream-100 hover:text-saffron-700'
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
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1.5 flex items-center gap-1.5 font-medium">
            <Building2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{scheme.ministry}</span>
          </p>
        </div>

        {/* Plain-Language AI Summary Box (Auto-rendered) */}
        {explainLoading ? (
          <div className="p-4 rounded-2xl bg-saffron-50/50 border border-saffron-200 animate-pulse flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-saffron-600 animate-spin" />
            <span className="text-xs text-saffron-900 font-medium">
              {siteLanguage === 'hi' ? 'सरल भाषा में सारांश तैयार हो रहा है...' : 'Generating plain-language summary...'}
            </span>
          </div>
        ) : explanation?.summary ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-saffron-50/70 via-cream-50 to-saffron-50/70 border border-saffron-200 space-y-1.5">
            <h2 className="text-xs font-bold text-saffron-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>{t('aiExplainSummaryTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-900 leading-relaxed font-medium">
              {explanation.summary}
            </p>
          </div>
        ) : null}

      </div>

      {/* 2. myScheme 4-TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-cream-300 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'benefits', label: t('detailTabBenefits'), icon: <Gift className="w-4 h-4" /> },
          { id: 'eligibility', label: t('detailTabEligibility'), icon: <UserCheck className="w-4 h-4" /> },
          { id: 'documents', label: t('detailTabDocuments'), icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'apply', label: t('detailTabHowToApply'), icon: <Globe className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-saffron-500 text-white shadow-md'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT PANELS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card">
        
        {/* TAB 1: BENEFITS */}
        {activeTab === 'benefits' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <Gift className="w-5 h-5 text-forest-600" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailBenefitsTitle')}
              </h2>
            </div>

            <div className="p-5 rounded-2xl bg-forest-50/70 border border-forest-200 text-sm sm:text-base text-forest-950 leading-relaxed font-medium">
              {scheme.benefits}
            </div>

            {explanation?.key_benefits && explanation.key_benefits.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide">
                  {t('aiExplainBenefitsTitle')}:
                </h3>
                <ul className="space-y-2.5">
                  {explanation.key_benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800">
                      <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ELIGIBILITY */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <UserCheck className="w-5 h-5 text-saffron-600" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailEligibilityTitle')}
              </h2>
            </div>

            {/* Snapshot Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200">
                <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailAgeLimit')}</span>
                <span className="font-bold text-charcoal-900">
                  {scheme.age_min ?? 0} – {scheme.age_max ?? 100} {siteLanguage === 'hi' ? 'वर्ष' : 'Yrs'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200">
                <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailIncomeLimit')}</span>
                <span className="font-bold text-forest-700">
                  {scheme.income_max && scheme.income_max > 0 
                    ? `≤ ₹${scheme.income_max.toLocaleString('en-IN')}` 
                    : t('detailNoIncomeLimit')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200">
                <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailCaste')}</span>
                <span className="font-bold text-charcoal-900 line-clamp-1">
                  {scheme.caste_categories || 'All'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200">
                <span className="text-charcoal-500 block text-xs mb-0.5">{t('detailResidence')}</span>
                <span className="font-bold text-charcoal-900">
                  {scheme.residence || 'All'}
                </span>
              </div>
            </div>

            {/* Official Criteria Text */}
            <div className="p-4 rounded-2xl bg-cream-50/50 border border-cream-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed">
              <p>{scheme.eligibility_text}</p>
            </div>
          </div>
        )}

        {/* TAB 3: REQUIRED DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-saffron-600" />
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                  {t('detailDocumentsTitle')}
                </h2>
              </div>
              
              {documentsList.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-saffron-50 text-saffron-800 border border-saffron-200">
                  {readyDocsCount} / {documentsList.length} {t('detailDocReady')} ({Math.round((readyDocsCount / documentsList.length) * 100)}%)
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600">
              {t('detailDocsChecklistHelp')}
            </p>

            {documentsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentsList.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDocCheck(doc)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'bg-forest-50/80 border-forest-300 text-forest-950 font-semibold'
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
            ) : (
              <p className="text-xs sm:text-sm text-charcoal-500 italic">
                {siteLanguage === 'hi' ? 'सामान्य पहचान पत्र (आधार / वोटर आईडी / निवास प्रमाण पत्र)' : 'Standard identity and address documents required.'}
              </p>
            )}
          </div>
        )}

        {/* TAB 4: HOW TO APPLY */}
        {activeTab === 'apply' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <Globe className="w-5 h-5 text-saffron-600" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailApplicationProcessTitle')}
              </h2>
            </div>

            {scheme.application_process && (
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed">
                <p>{scheme.application_process}</p>
              </div>
            )}

            {/* Offline Assistance Note for Rural Citizens */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-1">
              <span className="font-bold block">
                {siteLanguage === 'hi' ? '💡 नजदीकी सहायता केंद्र:' : '💡 Nearest Assistance Center:'}
              </span>
              <p>
                {siteLanguage === 'hi' 
                  ? 'यदि ऑनलाइन आवेदन में कठिनाई हो, तो अपने नजदीकी जन सेवा केंद्र (CSC), आंगनवाड़ी केंद्र या ग्राम पंचायत कार्यालय में कागजात ले जाएं।' 
                  : 'If you need help applying, visit your nearest Common Service Center (CSC), Anganwadi, or Gram Panchayat office.'}
              </p>
            </div>

            {/* Official Link CTA */}
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
