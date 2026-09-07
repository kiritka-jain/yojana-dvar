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
import { getLocalizedSchemeField } from '../i18n/schemeTranslations';
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

// Common Document Translations Dictionary for 100% Hindi Fidelity
const COMMON_DOC_TRANSLATIONS: Record<string, { hi: string; hint_hi: string }> = {
  'aadhaar': { hi: 'आधार कार्ड (Aadhaar Card)', hint_hi: 'पहचान व पते के सत्यापन हेतु' },
  'bank passbook': { hi: 'बैंक पासबुक / खाता विवरण (Bank Passbook)', hint_hi: 'डीबीटी अनुदान सीधे बैंक खाते में प्राप्त करने हेतु' },
  'bank account': { hi: 'बैंक खाता विवरण (Bank Details)', hint_hi: 'आधार से लिंक बैंक खाता संख्या व IFSC कोड' },
  'income certificate': { hi: 'आय प्रमाण पत्र (Income Certificate)', hint_hi: 'तहसीलदार या सक्षम अधिकारी द्वारा जारी आय प्रमाण' },
  'caste certificate': { hi: 'जाति प्रमाण पत्र (Caste Certificate)', hint_hi: 'आरक्षित श्रेणी प्रमाण पत्र (यदि लागू हो)' },
  'domicile': { hi: 'मूल निवास प्रमाण पत्र (Domicile Certificate)', hint_hi: 'राज्य में स्थायी निवास का प्रमाण' },
  'residence': { hi: 'निवास प्रमाण पत्र (Residence Certificate)', hint_hi: 'स्थानीय निवास सत्यापन हेतु' },
  'passport': { hi: 'पासपोर्ट साइज फोटो (Passport Photos)', hint_hi: 'नवीनतम रंगीन पासपोर्ट आकार की फोटो' },
  'photo': { hi: 'पासपोर्ट साइज फोटो (Passport Photos)', hint_hi: 'नवीनतम रंगीन पासपोर्ट आकार की फोटो' },
  'bpl': { hi: 'बीपीएल राशन कार्ड (BPL / Antyodaya Card)', hint_hi: 'गरीबी रेखा कार्ड या अंत्योदय अन्न योजना कार्ड' },
  'ration card': { hi: 'राशन कार्ड (Ration Card)', hint_hi: 'परिवार के सदस्यों के नाम सहित राशन कार्ड' },
  'disability': { hi: 'दिव्यांगता प्रमाण पत्र (Disability / UDID Card)', hint_hi: 'सीएमओ द्वारा जारी 40%+ दिव्यांगता कार्ड' },
  'birth certificate': { hi: 'जन्म प्रमाण पत्र (Birth Certificate)', hint_hi: 'बालिका/आवेदक की जन्म तिथि का प्रमाण' },
  'age proof': { hi: 'आयु प्रमाण पत्र (Age Proof)', hint_hi: '10वीं अंकतालिका या जन्म प्रमाण पत्र' },
  'educational': { hi: 'शैक्षणिक योग्यता प्रमाण पत्र (Educational Certificate)', hint_hi: 'अंकतालिका एवं विद्यालय/कॉलेज प्रमाण पत्र' },
  'marksheet': { hi: 'अंकतालिका / प्रमाण पत्र (Marksheet)', hint_hi: 'कक्षा उत्तीर्ण करने का प्रमाण' },
  'mcp card': { hi: 'मातृ एवं बाल सुरक्षा कार्ड (MCP Card)', hint_hi: 'आंगनवाड़ी या सरकारी अस्पताल से जारी कार्ड' },
  'mother and child': { hi: 'मातृ एवं बाल सुरक्षा कार्ड (MCP Card)', hint_hi: 'आंगनवाड़ी या सरकारी अस्पताल से जारी कार्ड' },
  'jan aadhaar': { hi: 'जन आधार कार्ड (Jan Aadhaar Card)', hint_hi: 'राजस्थान परिवार पहचान कार्ड' },
  'land records': { hi: 'भूमि दस्तावेज / खतौनी (Land Records / RoR)', hint_hi: 'जमीन की जमाबंदी या पट्टा प्रति' },
  'death certificate': { hi: 'पति का मृत्यु प्रमाण पत्र (Death Certificate)', hint_hi: 'नगर निगम या ग्राम पंचायत द्वारा जारी' },
  'self-declaration': { hi: 'स्व-घोषणा पत्र (Self-Declaration)', hint_hi: 'शपथ पत्र या निर्धारित प्रारूप पर घोषणा' },
  'affidavit': { hi: 'शपथ पत्र (Affidavit)', hint_hi: 'नोटरी या शपथ आयुक्त द्वारा सत्यापित' },
  'mobile number': { hi: 'आधार लिंक मोबाइल नंबर (Mobile Number)', hint_hi: 'ओटीपी सत्यापन व एसएमएस सूचनाओं हेतु' },
  'voter id': { hi: 'मतदाता पहचान पत्र (Voter ID)', hint_hi: 'वैकल्पिक पहचान पत्र' },
};

function parseDocuments(docString?: string): string[] {
  if (!docString) return [];
  return docString
    .split(/[,;\n]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 2);
}

function localizeDocumentName(doc: string, lang: 'en' | 'hi'): { name: string; hint?: string } {
  if (lang !== 'hi') return { name: doc };
  const lower = doc.toLowerCase().trim();
  for (const [key, val] of Object.entries(COMMON_DOC_TRANSLATIONS)) {
    if (lower.includes(key)) {
      return { name: val.hi, hint: val.hint_hi };
    }
  }
  return { name: doc };
}

function localizeBeneficiaryType(type: string | undefined, lang: 'en' | 'hi'): string {
  if (!type) return '';
  if (lang !== 'hi') return type;
  const lower = type.toLowerCase();
  if (lower.includes('pregnant') || lower.includes('lactating')) return 'गर्भवती एवं धात्री माताएं (Pregnant & Lactating Mothers)';
  if (lower.includes('widow')) return 'विधवा महिलाएं (Widows)';
  if (lower.includes('student') || lower.includes('girl child') || lower.includes('girls')) return 'छात्राएं एवं बालिकाएं (Girl Students / Girls)';
  if (lower.includes('entrepreneur') || lower.includes('shg') || lower.includes('women')) return 'महिलाएं एवं महिला उद्यमी (Women / SHGs)';
  if (lower.includes('senior') || lower.includes('elderly')) return 'वरिष्ठ नागरिक महिलाएं (Senior Women)';
  if (lower.includes('pwd') || lower.includes('disability')) return 'दिव्यांग महिलाएं (Women with Disabilities)';
  if (lower.includes('farmer') || lower.includes('rural')) return 'महिला किसान एवं ग्रामीण महिलाएं (Rural Women)';
  return type;
}

function parseEligibilityPoints(eligibilityText?: string): string[] {
  if (!eligibilityText) return [];
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

  // Localized Fields from Translation Registry
  const displayName = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'name', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayMinistry = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'ministry', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayCategory = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'category', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayBenefits = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'benefits', siteLanguage);
  }, [scheme, siteLanguage]);

  // Resilient fallback summary text if API is offline or generating
  const displaySummaryText = useMemo(() => {
    if (explanation?.summary && explanation.summary.trim().length > 0) {
      return explanation.summary;
    }
    if (!scheme) return '';

    if (siteLanguage === 'hi') {
      return `${displayName} के अंतर्गत पात्र लाभार्थियों को ${displayBenefits} प्रदान किया जाता है। यह योजना विशेष रूप से लक्षित नागरिकों को सामाजिक व आर्थिक सुरक्षा देने के लिए शुरू की गई है।`;
    }
    return `Under ${displayName}, eligible beneficiaries receive ${displayBenefits}. This initiative directly provides financial assistance and welfare support.`;
  }, [scheme, displayName, displayBenefits, explanation?.summary, siteLanguage]);

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

  // Localized Snapshot Attributes
  const displayCaste = useMemo(() => {
    if (!scheme?.caste_categories || scheme.caste_categories.toLowerCase() === 'all') {
      return siteLanguage === 'hi' ? 'सभी वर्ग (All Categories)' : 'All Categories';
    }
    if (siteLanguage === 'hi') {
      return scheme.caste_categories
        .replace(/General/gi, 'सामान्य')
        .replace(/SC/gi, 'अनुसूचित जाति (SC)')
        .replace(/ST/gi, 'अनुसूचित जनजाति (ST)')
        .replace(/OBC/gi, 'अन्य पिछड़ा वर्ग (OBC)')
        .replace(/Minority/gi, 'अल्पसंख्यक');
    }
    return scheme.caste_categories;
  }, [scheme?.caste_categories, siteLanguage]);

  const displayResidence = useMemo(() => {
    if (!scheme?.residence || scheme.residence.toLowerCase() === 'both' || scheme.residence.toLowerCase() === 'all') {
      return siteLanguage === 'hi' ? 'ग्रामीण व शहरी (Rural & Urban)' : 'Rural & Urban';
    }
    if (scheme.residence.toLowerCase() === 'rural') {
      return siteLanguage === 'hi' ? 'केवल ग्रामीण (Rural)' : 'Rural Only';
    }
    if (scheme.residence.toLowerCase() === 'urban') {
      return siteLanguage === 'hi' ? 'केवल शहरी (Urban)' : 'Urban Only';
    }
    return scheme.residence;
  }, [scheme?.residence, siteLanguage]);

  const displayGender = useMemo(() => {
    if (!scheme?.gender || scheme.gender.toLowerCase() === 'female') {
      return siteLanguage === 'hi' ? 'केवल महिलाएं (Female)' : 'Female';
    }
    if (scheme.gender.toLowerCase() === 'all') {
      return siteLanguage === 'hi' ? 'सभी नागरिक (All)' : 'All';
    }
    return scheme.gender;
  }, [scheme?.gender, siteLanguage]);

  const isCentral = !scheme?.state || scheme.state.toLowerCase() === 'all' || scheme.state.toLowerCase() === 'all india';

  // Structured localized eligibility points for Tab 2
  const localizedEligibilityPoints = useMemo(() => {
    if (!scheme) return [];
    if (siteLanguage === 'hi') {
      const points: string[] = [];
      
      // Age condition
      if (scheme.age_min !== undefined || scheme.age_max !== undefined) {
        const minA = scheme.age_min ?? 0;
        const maxA = scheme.age_max ?? 100;
        points.push(`आयु सीमा: आवेदक की आयु ${minA} से ${maxA} वर्ष के मध्य होनी चाहिए।`);
      }

      // Gender & Target Group
      if (scheme.gender && scheme.gender.toLowerCase() === 'female') {
        points.push(`लिंग पात्रता: यह योजना विशेष रूप से महिला लाभार्थियों एवं बालिकाओं के लिए है।`);
      }

      // State Residence
      if (isCentral) {
        points.push(`निवास पात्रता: संपूर्ण भारत के सभी राज्यों एवं केंद्र शासित प्रदेशों की नागरिक पात्र हैं।`);
      } else {
        points.push(`निवास पात्रता: आवेदक ${scheme.state} राज्य की स्थायी / मूल निवासी होनी चाहिए।`);
      }

      // Income limit
      if (scheme.income_max && scheme.income_max > 0) {
        points.push(`आय सीमा: पारिवारिक वार्षिक आय ₹${scheme.income_max.toLocaleString('en-IN')} से अधिक नहीं होनी चाहिए।`);
      } else {
        points.push(`आय सीमा: कोई अनिवार्य अधिकतम आय सीमा प्रतिबंध नहीं है।`);
      }

      // Priority criteria
      if (scheme.requires_bpl) {
        points.push(`राशन कार्ड: बीपीएल (BPL), अंत्योदय अथवा आर्थिक रूप से कमजोर वर्ग (EWS) परिवारों को प्राथमिकता दी जाती है।`);
      }
      if (scheme.requires_disability) {
        points.push(`दिव्यांगता श्रेणी: 40% या अधिक दिव्यांगता (UDID कार्ड धारक) महिला लाभार्थियों के लिए विशेष सहायता उपलब्ध है।`);
      }

      // Append any specific additional lines if present in catalog eligibility text
      const rawPoints = parseEligibilityPoints(scheme.eligibility_text);
      if (rawPoints.length > 0 && points.length <= 2) {
        points.push(...rawPoints);
      }
      return points;
    }

    // English Fallback
    return parseEligibilityPoints(scheme.eligibility_text);
  }, [scheme, siteLanguage, isCentral]);

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

            {displayCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-saffron-50 text-saffron-800 border border-saffron-200">
                🌱 {displayCategory}
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
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-1.5 flex items-center gap-1.5 font-bold">
            <Building2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{displayMinistry}</span>
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
                {displayBenefits}
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
                  <strong className="text-charcoal-900">{siteLanguage === 'hi' ? 'लक्षित लाभार्थी:' : 'Target Beneficiaries:'}</strong>{' '}
                  {localizeBeneficiaryType(scheme.beneficiary_type, siteLanguage)}
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
                  {displayCaste}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailResidence')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm">
                  {displayResidence}
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
                  {siteLanguage === 'hi' ? 'लिंग:' : 'Gender:'} {displayGender}
                </span>
              )}
            </div>

            {/* Structured Criteria Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide">
                {siteLanguage === 'hi' ? 'विस्तृत पात्रता विवरण:' : 'Detailed Eligibility Criteria:'}
              </h3>
              <div className="space-y-2.5">
                {localizedEligibilityPoints.map((point, idx) => (
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

            {/* Interactive Document Checklist Items with Localized Names & Context Hints */}
            {documentsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentsList.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  const docInfo = localizeDocumentName(doc, siteLanguage);
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
                        <span className="text-xs sm:text-sm leading-snug block font-medium">
                          {docInfo.name}
                        </span>
                        {docInfo.hint && (
                          <span className="text-[11px] text-charcoal-500 block">
                            💡 {docInfo.hint}
                          </span>
                        )}
                        <span className="text-[10px] text-charcoal-500 block pt-0.5">
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


