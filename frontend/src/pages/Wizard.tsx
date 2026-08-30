import React, { useState, useEffect, useId } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { matchSchemes } from '../services/api';
import type { ProfileInput } from '../services/api';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Check,
  RotateCcw,
  Sliders,
  LayoutList,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CASTE_OPTIONS = ["General", "OBC", "SC", "ST", "Minorities"];

const OCCUPATION_OPTIONS = [
  { value: "Student", labelEn: "Student / Trainee", labelHi: "छात्रा / शिक्षार्थी" },
  { value: "Homemaker", labelEn: "Homemaker", labelHi: "गृहणी" },
  { value: "Self-Employed / Artisan", labelEn: "Self-Employed / Artisan / SHG", labelHi: "स्व-रोजगार / कारीगर / SHG" },
  { value: "Agricultural / Farmer", labelEn: "Agricultural / Farmer", labelHi: "कृषक / खेतिहर मजदूर" },
  { value: "Daily Wage Labor", labelEn: "Daily Wage / Informal Worker", labelHi: "दैनिक वेतनभोगी श्रमिक" },
  { value: "Salaried", labelEn: "Salaried / Private Employee", labelHi: "वेतनभोगी कर्मचारी" },
  { value: "Other", labelEn: "Other / Looking for Work", labelHi: "अन्य / रोजगार तलाशकर्ता" }
];

const EDUCATION_OPTIONS = [
  { value: "Primary", labelEn: "Primary (Up to 5th)", labelHi: "प्राथमिक (5वीं तक)" },
  { value: "Secondary", labelEn: "Secondary (10th Pass)", labelHi: "माध्यमिक (10वीं पास)" },
  { value: "Higher Secondary", labelEn: "Higher Secondary (12th Pass)", labelHi: "उच्चतर माध्यमिक (12वीं पास)" },
  { value: "Undergraduate", labelEn: "Undergraduate / Diploma", labelHi: "स्नातक / डिप्लोमा" },
  { value: "Postgraduate", labelEn: "Postgraduate & Above", labelHi: "स्नातकोत्तर व अधिक" }
];

interface FormErrors {
  state?: string;
  age?: string;
  income?: string;
}

const DEFAULT_PROFILE: ProfileInput = {
  state: 'Uttar Pradesh',
  age: 24,
  gender: 'Female',
  caste: 'General',
  income: 120000,
  residence: 'Rural',
  life_stage: 'maternal',
  occupation: '',
  education: '',
  is_bpl: false,
  has_disability: false,
  limit: 15
};

export const Wizard: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Unique accessible IDs
  const stateSelectId = useId();
  const ageSliderId = useId();
  const ageInputId = useId();
  const incomeSliderId = useId();
  const incomeInputId = useId();

  // Mode: 'wizard' (step-by-step) or 'all' (grouped single page)
  const [viewMode, setViewMode] = useState<'wizard' | 'all'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);

  // Field validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Demographic Profile State
  const [profile, setProfile] = useState<ProfileInput>({ ...DEFAULT_PROFILE });

  // Pre-populate if ?persona=<id> is present in URL or preset clicked
  const loadPersonaPreset = (personaId: string) => {
    setErrorMsg(null);
    setErrors({});
    if (personaId === 'priya') {
      setProfile({
        state: 'Karnataka',
        age: 19,
        gender: 'Female',
        caste: 'OBC',
        income: 180000,
        residence: 'Urban',
        life_stage: 'student',
        occupation: 'Student',
        education: 'Undergraduate',
        is_bpl: false,
        has_disability: false,
        limit: 15
      });
      setActivePersonaId('priya');
      setSearchParams({ persona: 'priya' });
    } else if (personaId === 'sunita') {
      setProfile({
        state: 'Bihar',
        age: 26,
        gender: 'Female',
        caste: 'SC',
        income: 48000,
        residence: 'Rural',
        life_stage: 'maternal',
        occupation: 'Homemaker',
        education: 'Secondary',
        is_bpl: true,
        has_disability: false,
        limit: 15
      });
      setActivePersonaId('sunita');
      setSearchParams({ persona: 'sunita' });
    } else if (personaId === 'lakshmi') {
      setProfile({
        state: 'Tamil Nadu',
        age: 42,
        gender: 'Female',
        caste: 'General',
        income: 220000,
        residence: 'Urban',
        life_stage: 'entrepreneur',
        occupation: 'Self-Employed / Artisan',
        education: 'Undergraduate',
        is_bpl: false,
        has_disability: false,
        limit: 15
      });
      setActivePersonaId('lakshmi');
      setSearchParams({ persona: 'lakshmi' });
    }
  };

  const clearPreset = () => {
    setActivePersonaId(null);
    setSearchParams({});
    setProfile({ ...DEFAULT_PROFILE });
    setErrors({});
    setErrorMsg(null);
  };

  // Sync with URL parameter on mount
  useEffect(() => {
    const personaParam = searchParams.get('persona');
    if (personaParam) {
      loadPersonaPreset(personaParam);
    }
  }, [searchParams]);

  // Client-side field validations
  const validateField = (field: keyof ProfileInput, value: any): string | undefined => {
    if (field === 'state') {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return t('validationErrorState');
      }
    }
    if (field === 'age') {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 110) {
        return t('validationErrorAge');
      }
    }
    if (field === 'income') {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return t('validationErrorIncome');
      }
    }
    return undefined;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1 || viewMode === 'all') {
      const stateErr = validateField('state', profile.state);
      if (stateErr) newErrors.state = stateErr;

      const ageErr = validateField('age', profile.age);
      if (ageErr) newErrors.age = ageErr;
    }

    if (step === 2 || viewMode === 'all') {
      const incomeErr = validateField('income', profile.income);
      if (incomeErr) newErrors.income = incomeErr;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया आगे बढ़ने से पहले चिह्नित त्रुटियों को ठीक करें।'
          : 'Please correct the highlighted fields before proceeding.'
      );
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit profile to Match Engine
  const handleSubmit = async () => {
    if (!validateStep(viewMode === 'wizard' ? 4 : 1)) {
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const matchResult = await matchSchemes(profile);
      navigate('/results', { state: { matchData: matchResult, profile } });
    } catch (err: any) {
      setErrorMsg(
        err.message || (language === 'hi' 
          ? 'योजना मिलान में त्रुटि हुई। कृपया पुन: प्रयास करें।' 
          : 'Error occurred while matching schemes. Please verify your connection and try again.')
      );
      setLoading(false);
    }
  };

  // Stepper config
  const stepsConfig = [
    { num: 1, title: t('wizardStep1Title'), icon: <User className="w-4 h-4" /> },
    { num: 2, title: t('wizardStep2Title'), icon: <IndianRupee className="w-4 h-4" /> },
    { num: 3, title: t('wizardStep3Title'), icon: <HeartHandshake className="w-4 h-4" /> },
    { num: 4, title: t('wizardStep4Title'), icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  // Helper for active persona title
  const getPersonaLabel = (id: string) => {
    if (id === 'priya') return language === 'hi' ? 'प्रिया शर्मा (19 वर्ष • छात्रा)' : 'Priya Sharma (19yo Student)';
    if (id === 'sunita') return language === 'hi' ? 'सुनीता देवी (26 वर्ष • गर्भवती माता)' : 'Sunita Devi (26yo Expecting Mother)';
    if (id === 'lakshmi') return language === 'hi' ? 'लक्ष्मी अम्मल (42 वर्ष • उद्यमी)' : 'Lakshmi Ammal (42yo Entrepreneur)';
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* 1. Header & View Mode Switcher */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
          <span>{language === 'hi' ? 'स्मार्ट पात्रता खोज' : 'Smart Entitlement Discovery'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {t('wizardTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
          {t('wizardSubtitle')}
        </p>

        {/* View Mode Toggle: Guided Steps vs All-in-One Form */}
        <div className="mt-4 inline-flex items-center p-1 rounded-xl bg-cream-200 border border-cream-300 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('wizard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'wizard'
                ? 'bg-white text-saffron-800 shadow-xs ring-1 ring-black/5'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-saffron-600" />
            <span>{t('viewModeWizard')}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-white text-saffron-800 shadow-xs ring-1 ring-black/5'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 text-saffron-600" />
            <span>{t('viewModeAll')}</span>
          </button>
        </div>
      </div>

      {/* 2. DEMO PERSONA PRESET BAR */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cream-100 via-saffron-50/40 to-cream-100 border border-saffron-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron-600 flex-shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-charcoal-900">
                {t('presetTitle')}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-charcoal-500 mt-0.5">
              {t('presetSubtitle')}
            </p>
          </div>

          {/* Persona quick buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadPersonaPreset('priya')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                activePersonaId === 'priya'
                  ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs font-bold ring-2 ring-saffron-200'
                  : 'bg-white text-charcoal-700 border-cream-300 hover:border-saffron-400 hover:bg-saffron-50'
              }`}
            >
              <span>🎓</span>
              <span>{language === 'hi' ? 'प्रिया (19 छात्रा)' : 'Priya (19 Student)'}</span>
            </button>

            <button
              type="button"
              onClick={() => loadPersonaPreset('sunita')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                activePersonaId === 'sunita'
                  ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs font-bold ring-2 ring-saffron-200'
                  : 'bg-white text-charcoal-700 border-cream-300 hover:border-saffron-400 hover:bg-saffron-50'
              }`}
            >
              <span>🤱</span>
              <span>{language === 'hi' ? 'सुनीता (26 माता)' : 'Sunita (26 Mother)'}</span>
            </button>

            <button
              type="button"
              onClick={() => loadPersonaPreset('lakshmi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                activePersonaId === 'lakshmi'
                  ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs font-bold ring-2 ring-saffron-200'
                  : 'bg-white text-charcoal-700 border-cream-300 hover:border-saffron-400 hover:bg-saffron-50'
              }`}
            >
              <span>💼</span>
              <span>{language === 'hi' ? 'लक्ष्मी (42 उद्यमी)' : 'Lakshmi (42 Business)'}</span>
            </button>

            {activePersonaId && (
              <button
                type="button"
                onClick={clearPreset}
                aria-label="Reset form to default"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1"
                title={t('presetClear')}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">{t('presetReset')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active persona banner indicator */}
        {activePersonaId && (
          <div className="mt-3 pt-3 border-t border-saffron-200/60 flex items-center justify-between text-xs text-saffron-900 bg-white/70 px-3 py-1.5 rounded-lg">
            <span className="font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-forest-600" />
              {t('presetActive')}: {getPersonaLabel(activePersonaId)}
            </span>
            <button
              type="button"
              onClick={clearPreset}
              className="text-charcoal-500 hover:text-charcoal-800 text-[11px] underline flex items-center gap-0.5"
            >
              <X className="w-3 h-3" />
              {t('presetClear')}
            </button>
          </div>
        )}
      </div>

      {/* 3. STEPPER PROGRESS BAR (Only in Wizard mode) */}
      {viewMode === 'wizard' && (
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Connector Lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-cream-300 -z-10" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-saffron-500 transition-all duration-300 -z-10"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {stepsConfig.map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className="flex flex-col items-center group focus:outline-none"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-sm ${
                      isCompleted
                        ? 'bg-forest-600 text-white'
                        : isCurrent
                        ? 'bg-saffron-500 text-white ring-4 ring-saffron-200 scale-110'
                        : 'bg-white text-charcoal-500 border border-cream-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span 
                    className={`text-xs mt-2 font-medium hidden sm:block ${
                      isCurrent ? 'text-saffron-800 font-bold' : 'text-charcoal-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Error Alert Banner */}
      {errorMsg && (
        <div 
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3 shadow-xs animate-fadeIn"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* 4. MAIN FORM CONTAINER */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-saffron-100 shadow-card space-y-8"
        noValidate
      >
        
        {/* ========================================================================= */}
        {/* SECTION 1: Location & Age (Wizard Step 1 OR Grouped Section 1)             */}
        {/* ========================================================================= */}
        {(viewMode === 'all' || currentStep === 1) && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center text-xs font-bold">1</span>
                  {t('wizardStep1Title')}
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {t('wizardStep1Subtitle')}
                </p>
              </div>
              <span className="text-xs text-saffron-700 font-semibold bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">
                Rule 1 & 2
              </span>
            </div>

            {/* Field: State */}
            <div className="space-y-2">
              <label 
                htmlFor={stateSelectId} 
                className="block text-sm font-semibold text-charcoal-900"
              >
                <MapPin className="w-4 h-4 inline mr-1 text-saffron-600" />
                {t('fieldState')} <span className="text-red-500">*</span>
              </label>
              <select
                id={stateSelectId}
                value={profile.state}
                aria-invalid={!!errors.state}
                aria-describedby={errors.state ? 'state-error' : undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({ ...profile, state: val });
                  const err = validateField('state', val);
                  setErrors((prev) => ({ ...prev, state: err }));
                }}
                className={`w-full p-3.5 rounded-xl border text-charcoal-900 text-sm focus:ring-2 focus:outline-none transition-shadow ${
                  errors.state 
                    ? 'border-red-400 bg-red-50/40 focus:ring-red-300' 
                    : 'border-cream-300 bg-cream-50/50 focus:ring-saffron-500'
                }`}
              >
                <option value="">{t('fieldStatePlaceholder')}</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.state && (
                <p id="state-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.state}</span>
                </p>
              )}
            </div>

            {/* Field: Age (Synchronized Slider + Direct Input + Quick Chips) */}
            <div className="space-y-3 p-4 rounded-2xl bg-cream-50/40 border border-cream-200">
              <div className="flex items-center justify-between gap-4">
                <label 
                  htmlFor={ageSliderId} 
                  className="text-sm font-semibold text-charcoal-900"
                >
                  <User className="w-4 h-4 inline mr-1 text-saffron-600" />
                  {t('fieldAge')} <span className="text-red-500">*</span>
                </label>

                {/* Direct Number Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500 hidden sm:inline">
                    {t('fieldAgeDirectInput')}:
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      id={ageInputId}
                      type="number"
                      min="0"
                      max="110"
                      value={profile.age}
                      aria-label="Enter age directly"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setProfile({ ...profile, age: val });
                        const err = validateField('age', val);
                        setErrors((prev) => ({ ...prev, age: err }));
                      }}
                      className={`w-20 p-2 text-center text-sm font-bold rounded-lg border bg-white text-charcoal-900 focus:ring-2 focus:outline-none ${
                        errors.age ? 'border-red-400 focus:ring-red-300' : 'border-saffron-300 focus:ring-saffron-500'
                      }`}
                    />
                    <span className="ml-1.5 text-xs text-charcoal-600 font-medium">
                      {language === 'hi' ? 'वर्ष' : 'Yrs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Range Slider */}
              <input
                id={ageSliderId}
                type="range"
                min="0"
                max="100"
                value={profile.age}
                aria-label={t('fieldAge')}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setProfile({ ...profile, age: val });
                  const err = validateField('age', val);
                  setErrors((prev) => ({ ...prev, age: err }));
                }}
                className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-saffron-500"
              />

              {/* Quick Age Milestone Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { label: language === 'hi' ? 'बालिका (0-10)' : 'Child (0-10)', age: 8 },
                  { label: language === 'hi' ? 'युवती (18-25)' : 'Student (18-25)', age: 20 },
                  { label: language === 'hi' ? 'वयस्क (26-59)' : 'Adult (26-59)', age: 32 },
                  { label: language === 'hi' ? 'वरिष्ठ (60+)' : 'Senior (60+)', age: 62 },
                ].map((chip) => (
                  <button
                    key={chip.age}
                    type="button"
                    onClick={() => {
                      setProfile({ ...profile, age: chip.age });
                      setErrors((prev) => ({ ...prev, age: undefined }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      profile.age === chip.age
                        ? 'bg-saffron-500 text-white font-bold'
                        : 'bg-white text-charcoal-600 border border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-charcoal-500">
                {t('fieldAgeHelper')}
              </p>

              {errors.age && (
                <p role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Field: Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldGender')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'Female', label: t('fieldGenderFemale') },
                  { val: 'Transgender', label: t('fieldGenderTransgender') },
                  { val: 'All', label: t('fieldGenderAll') }
                ].map((g) => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: g.val })}
                    className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      profile.gender === g.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: Socio-Economic Profile (Wizard Step 2 OR Grouped Section 2)    */}
        {/* ========================================================================= */}
        {(viewMode === 'all' || currentStep === 2) && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold">2</span>
                  {t('wizardStep2Title')}
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {t('wizardStep2Subtitle')}
                </p>
              </div>
              <span className="text-xs text-forest-700 font-semibold bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                Rule 3 & 4
              </span>
            </div>

            {/* Field: Caste Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldCaste')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {CASTE_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProfile({ ...profile, caste: c })}
                    className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      profile.caste === c
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Annual Family Income (Synchronized Slider + Direct Input + Brackets) */}
            <div className="space-y-3 p-4 rounded-2xl bg-forest-50/30 border border-forest-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label 
                  htmlFor={incomeSliderId} 
                  className="text-sm font-semibold text-charcoal-900 flex items-center gap-1"
                >
                  <IndianRupee className="w-4 h-4 text-forest-600" />
                  <span>{t('fieldIncome')}</span>
                </label>

                {/* Direct Income Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500 hidden sm:inline">
                    {t('fieldIncomeDirectInput')}:
                  </span>
                  <div className="relative inline-flex items-center">
                    <span className="absolute left-2.5 text-xs font-bold text-forest-700">₹</span>
                    <input
                      id={incomeInputId}
                      type="number"
                      min="0"
                      step="10000"
                      value={profile.income}
                      aria-label="Enter income amount directly"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setProfile({ ...profile, income: val });
                        const err = validateField('income', val);
                        setErrors((prev) => ({ ...prev, income: err }));
                      }}
                      className={`w-32 pl-6 pr-2.5 py-1.5 text-sm font-bold rounded-lg border bg-white text-forest-900 focus:ring-2 focus:outline-none ${
                        errors.income ? 'border-red-400 focus:ring-red-300' : 'border-forest-300 focus:ring-forest-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Slider */}
              <input
                id={incomeSliderId}
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={profile.income}
                aria-label={t('fieldIncome')}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setProfile({ ...profile, income: val });
                  const err = validateField('income', val);
                  setErrors((prev) => ({ ...prev, income: err }));
                }}
                className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-forest-600"
              />

              {/* Quick Income Bracket Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { label: '₹0 (BPL / Zero)', val: 0 },
                  { label: '₹1.2 L (Low Income)', val: 120000 },
                  { label: '₹2.5 L (EWS Limit)', val: 250000 },
                  { label: '₹5 L (Middle)', val: 500000 },
                  { label: '₹8 L (OBC Creamy)', val: 800000 },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => {
                      setProfile({ ...profile, income: b.val });
                      setErrors((prev) => ({ ...prev, income: undefined }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      profile.income === b.val
                        ? 'bg-forest-600 text-white font-bold'
                        : 'bg-white text-charcoal-600 border border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-charcoal-500">
                {t('fieldIncomeHelper')}
              </p>

              {errors.income && (
                <p role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.income}</span>
                </p>
              )}
            </div>

            {/* Field: Residence Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldResidence')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: 'Rural', label: t('fieldResidenceRural'), desc: language === 'hi' ? 'गाँव / देहात' : 'Village area' },
                  { val: 'Urban', label: t('fieldResidenceUrban'), desc: language === 'hi' ? 'नगर / महानगर' : 'City / Metro' },
                  { val: 'Semi-Urban', label: t('fieldResidenceSemiUrban'), desc: language === 'hi' ? 'कस्बा / तहसील' : 'Township' },
                  { val: 'All', label: t('fieldResidenceAll'), desc: language === 'hi' ? 'कोई भी क्षेत्र' : 'Open to all' }
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, residence: r.val })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.residence === r.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">{r.label}</div>
                    <div className="text-[11px] text-charcoal-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: Life Stage & Special Status (Wizard Step 3 OR Grouped Sec 3)   */}
        {/* ========================================================================= */}
        {(viewMode === 'all' || currentStep === 3) && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center text-xs font-bold">3</span>
                  {t('wizardStep3Title')}
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {t('wizardStep3Subtitle')}
                </p>
              </div>
              <span className="text-xs text-saffron-700 font-semibold bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">
                Rule 5, 6 & 7
              </span>
            </div>

            {/* Field: Life Stage */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldLifeStage')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { 
                    val: 'student', 
                    label: t('fieldLifeStageStudent'), 
                    icon: '🎓',
                    hint: language === 'hi' ? 'छात्रवृत्ति, वजीफा और शिक्षा ऋण' : 'Scholarships, stipends & education loans'
                  },
                  { 
                    val: 'maternal', 
                    label: t('fieldLifeStageMaternal'), 
                    icon: '🤱',
                    hint: language === 'hi' ? 'PMMVY, पोषण किट व मातृत्व अनुदान' : 'PMMVY, nutrition kits & maternity aid'
                  },
                  { 
                    val: 'entrepreneur', 
                    label: t('fieldLifeStageEntrepreneur'), 
                    icon: '💼',
                    hint: language === 'hi' ? 'मुद्रा ऋण, SHG सहायता व सिलाई प्रशिक्षण' : 'Mudra business loans & skill training'
                  },
                  { 
                    val: 'senior', 
                    label: t('fieldLifeStageSenior'), 
                    icon: '👵',
                    hint: language === 'hi' ? 'वृद्धावस्था पेंशन व आयुष्मान स्वास्थ्य कार्ड' : 'Old age pensions & healthcare aid'
                  },
                  { 
                    val: 'all', 
                    label: t('fieldLifeStageGeneral'), 
                    icon: '🌸',
                    hint: language === 'hi' ? 'सभी सामान्य नागरिक कल्याण योजनाएं' : 'General citizen entitlements'
                  }
                ].map((ls) => (
                  <button
                    key={ls.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, life_stage: ls.val })}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      profile.life_stage === ls.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{ls.icon}</span>
                    <div>
                      <span className="text-sm font-bold block">{ls.label}</span>
                      <span className="text-xs text-charcoal-500 font-normal">{ls.hint}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field: BPL Toggle */}
            <div className="p-4 rounded-2xl border border-cream-300 bg-cream-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal-900">
                    {t('fieldBpl')}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('fieldBplHelper')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, is_bpl: false })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      !profile.is_bpl 
                        ? 'bg-charcoal-800 text-white border-charcoal-800 shadow-xs' 
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {t('fieldNo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, is_bpl: true })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      profile.is_bpl 
                        ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs ring-2 ring-saffron-200' 
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {t('fieldYes')}
                  </button>
                </div>
              </div>
            </div>

            {/* Field: Disability Toggle */}
            <div className="p-4 rounded-2xl border border-cream-300 bg-cream-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal-900">
                    {t('fieldDisability')}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('fieldDisabilityHelper')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, has_disability: false })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      !profile.has_disability 
                        ? 'bg-charcoal-800 text-white border-charcoal-800 shadow-xs' 
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {t('fieldNo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, has_disability: true })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      profile.has_disability 
                        ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs ring-2 ring-saffron-200' 
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {t('fieldYes')}
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible: Additional Optional Profile Details */}
            <div className="border border-cream-300 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-cream-50/60 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-charcoal-800">
                  <Layers className="w-4 h-4 text-saffron-600" />
                  <span>{t('fieldAdditionalInfo')}</span>
                </div>
                {showOptionalFields ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
              </button>

              {showOptionalFields && (
                <div className="p-4 pt-2 border-t border-cream-200 bg-cream-50/30 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  {/* Occupation */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-charcoal-700 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-forest-600" />
                      {t('fieldOccupation')}
                    </label>
                    <select
                      value={profile.occupation || ''}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none"
                    >
                      <option value="">-- {language === 'hi' ? 'व्यवसाय चुनें' : 'Select Occupation'} --</option>
                      {OCCUPATION_OPTIONS.map((occ) => (
                        <option key={occ.value} value={occ.value}>
                          {language === 'hi' ? occ.labelHi : occ.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Education */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-charcoal-700 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-saffron-600" />
                      {t('fieldEducation')}
                    </label>
                    <select
                      value={profile.education || ''}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-xs focus:ring-2 focus:ring-saffron-500 focus:outline-none"
                    >
                      <option value="">-- {language === 'hi' ? 'शिक्षा स्तर चुनें' : 'Select Education Level'} --</option>
                      {EDUCATION_OPTIONS.map((edu) => (
                        <option key={edu.value} value={edu.value}>
                          {language === 'hi' ? edu.labelHi : edu.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: Review & Submit (Wizard Step 4 OR Bottom of Grouped Form)      */}
        {/* ========================================================================= */}
        {(viewMode === 'all' || currentStep === 4) && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-saffron-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                  {t('wizardStep4Title')}
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {t('wizardStep4Subtitle')}
                </p>
              </div>
              <span className="text-xs text-saffron-800 font-semibold bg-saffron-100 px-2.5 py-1 rounded-md border border-saffron-300">
                Deterministic 9-Rule Match
              </span>
            </div>

            {/* Summary Review Card */}
            <div className="rounded-2xl border border-saffron-200 bg-saffron-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-saffron-900 uppercase tracking-wide">
                  {t('wizardSummaryTitle')}
                </h3>
                <span className="text-xs text-saffron-700 font-medium">
                  {language === 'hi' ? '9-नियम इंजन तैयार' : '9-Rule Engine Ready'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldState')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.state}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldAge')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.age} {language === 'hi' ? 'वर्ष' : 'Years'}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldGender')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.gender}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldCaste')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.caste}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldIncome')}</span>
                  <span className="font-semibold text-forest-700">₹{profile.income.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldResidence')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.residence}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">{t('fieldLifeStage')}</span>
                  <span className="font-semibold text-charcoal-900 capitalize">{profile.life_stage}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">BPL Card</span>
                  <span className="font-semibold text-charcoal-900">{profile.is_bpl ? t('fieldYes') : t('fieldNo')}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100 shadow-2xs">
                  <span className="text-charcoal-500 block text-xs">Disability (PwD)</span>
                  <span className="font-semibold text-charcoal-900">{profile.has_disability ? t('fieldYes') : t('fieldNo')}</span>
                </div>
              </div>
            </div>

            {/* Submit Action Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-saffron-500 via-terracotta to-saffron-600 text-white shadow-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                {language === 'hi' ? 'पात्रता मिलान शुरू करने के लिए तैयार' : 'Ready to Run Eligibility Matching'}
              </h3>
              <p className="text-xs sm:text-sm text-saffron-100 max-w-md mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'हमारा 9-नियम इंजन 100+ केंद्रीय और राज्य योजनाओं में आपकी पात्रता की तुरंत गणना करेगा।'
                  : 'We will cross-examine your demographic profile against all active central and state welfare rules in milliseconds.'}
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-saffron-700 hover:bg-cream-100 font-bold text-base shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-saffron-700" />
                    <span>{t('wizardMatchingLoading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('wizardSubmitBtn')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Step Navigation Controls (Wizard mode only) */}
        {viewMode === 'wizard' && (
          <div className="mt-8 pt-6 border-t border-cream-300 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1 || loading}
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('btnBack')}</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold shadow-sm transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
              >
                <span>{t('btnNext')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

      </form>
    </div>
  );
};

export default Wizard;
