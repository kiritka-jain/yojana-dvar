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
  Plus,
  Minus,
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
  const [searchParams] = useSearchParams();

  // Accessible IDs
  const stateSelectId = useId();
  const ageInputId = useId();

  // 3-Step Guided Flow
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Demographic Profile State
  const [profile, setProfile] = useState<ProfileInput>({ ...DEFAULT_PROFILE });

  // Sync with URL parameter on mount (support ?persona=priya/sunita/lakshmi)
  useEffect(() => {
    const personaParam = searchParams.get('persona');
    if (personaParam === 'priya') {
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
    } else if (personaParam === 'sunita') {
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
    } else if (personaParam === 'lakshmi') {
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
    return undefined;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      const stateErr = validateField('state', profile.state);
      if (stateErr) newErrors.state = stateErr;

      const ageErr = validateField('age', profile.age);
      if (ageErr) newErrors.age = ageErr;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorMsg(t('validationCorrectFields'));
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
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
    if (!validateStep(3)) {
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

  // 3-Step Config
  const stepsConfig = [
    { num: 1, title: t('wizardStep1Title'), icon: <User className="w-4 h-4" /> },
    { num: 2, title: t('wizardStep2Title'), icon: <IndianRupee className="w-4 h-4" /> },
    { num: 3, title: t('wizardStep3Title'), icon: <HeartHandshake className="w-4 h-4" /> },
  ];

  // Age increment/decrement helper
  const adjustAge = (delta: number) => {
    const newAge = Math.min(100, Math.max(0, (profile.age || 0) + delta));
    setProfile({ ...profile, age: newAge });
    setErrors((prev) => ({ ...prev, age: undefined }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* 1. Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
          <span>{language === 'hi' ? '100% निःशुल्क सरकारी सहायता' : '100% Free Govt Welfare Gateway'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {t('wizardTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
          {t('wizardSubtitle')}
        </p>
      </div>

      {/* 2. STEPPER PROGRESS BAR (3 Clear Steps) */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector Lines */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-cream-300 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-saffron-500 transition-all duration-300 -z-10"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
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
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
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

        {/* Mobile-only Step Label Badge */}
        <div className="sm:hidden text-center mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200/90 border border-cream-300 text-charcoal-800 text-xs font-bold">
            <span>{language === 'hi' ? `चरण ${currentStep} / 3:` : `Step ${currentStep} of 3:`}</span>
            <span className="text-saffron-700">{stepsConfig[currentStep - 1].title}</span>
          </span>
        </div>
      </div>

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

      {/* 3. MAIN STEP FORM */}
      <form 
        onSubmit={(e) => { e.preventDefault(); if (currentStep === 3) handleSubmit(); else handleNext(); }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-saffron-100 shadow-card space-y-8"
        noValidate
      >
        
        {/* ========================================================================= */}
        {/* STEP 1: State & Age                                                       */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center text-xs font-bold">1</span>
                {t('wizardStep1Title')}
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {t('wizardStep1Subtitle')}
              </p>
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
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({ ...profile, state: val });
                  const err = validateField('state', val);
                  setErrors((prev) => ({ ...prev, state: err }));
                }}
                className={`w-full p-4 rounded-2xl border text-charcoal-900 text-sm sm:text-base focus:ring-2 focus:outline-none transition-shadow ${
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
                <p role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.state}</span>
                </p>
              )}
            </div>

            {/* Field: Age (Numeric Stepper Counter + 4 Clear Milestone Tiles) */}
            <div className="space-y-4 p-5 sm:p-6 rounded-3xl bg-cream-50/70 border border-saffron-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor={ageInputId} 
                  className="block text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-saffron-600" />
                  <span>{t('fieldAge')}</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-xs text-charcoal-500 font-medium">
                  {language === 'hi' ? 'बटन दबाएं या उम्र लिखें' : 'Tap +/- or type below'}
                </span>
              </div>

              {/* Stepper with Large 56px+ Touch Target + and - Buttons */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
                <button
                  type="button"
                  disabled={profile.age <= 0}
                  onClick={() => adjustAge(-1)}
                  aria-label={language === 'hi' ? 'आयु कम करें' : 'Decrease age'}
                  className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] rounded-2xl bg-white border-2 border-cream-300 text-charcoal-800 hover:border-saffron-500 hover:bg-saffron-50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-black shadow-sm transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-saffron-400"
                >
                  <Minus className="w-6 h-6 stroke-[3] group-hover:text-saffron-700 transition-colors" />
                </button>

                <div className="flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-2xl border-2 border-saffron-500 shadow-md focus-within:ring-4 focus-within:ring-saffron-200 transition-all">
                  <input
                    id={ageInputId}
                    type="number"
                    min="0"
                    max="100"
                    value={profile.age === 0 ? '' : profile.age}
                    placeholder="0"
                    role="spinbutton"
                    aria-valuenow={profile.age}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={language === 'hi' ? 'आयु (वर्ष में)' : 'Age in years'}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = raw === '' ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0));
                      setProfile({ ...profile, age: val });
                      const err = validateField('age', val);
                      setErrors((prev) => ({ ...prev, age: err }));
                    }}
                    className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-charcoal-900 focus:outline-none bg-transparent"
                  />
                  <span className="text-sm sm:text-base font-extrabold text-saffron-700 select-none">
                    {language === 'hi' ? 'वर्ष' : 'Yrs'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={profile.age >= 100}
                  onClick={() => adjustAge(1)}
                  aria-label={language === 'hi' ? 'आयु बढ़ाएं' : 'Increase age'}
                  className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] rounded-2xl bg-white border-2 border-cream-300 text-charcoal-800 hover:border-saffron-500 hover:bg-saffron-50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-black shadow-sm transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-saffron-400"
                >
                  <Plus className="w-6 h-6 stroke-[3] group-hover:text-saffron-700 transition-colors" />
                </button>
              </div>

              {/* 4 Large Visual Age Milestone Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { id: 'child', label: t('ageTierChild'), range: [0, 17], defaultAge: 10, icon: '👧' },
                  { id: 'student', label: t('ageTierStudent'), range: [18, 25], defaultAge: 20, icon: '👩‍🎓' },
                  { id: 'adult', label: t('ageTierAdult'), range: [26, 59], defaultAge: 35, icon: '👩' },
                  { id: 'senior', label: t('ageTierSenior'), range: [60, 100], defaultAge: 65, icon: '👵' },
                ].map((tier) => {
                  const isActive = profile.age >= tier.range[0] && profile.age <= tier.range[1];
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setProfile({ ...profile, age: tier.defaultAge });
                        setErrors((prev) => ({ ...prev, age: undefined }));
                      }}
                      className={`min-h-[72px] sm:min-h-[80px] p-3 sm:p-3.5 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 active:scale-95 ${
                        isActive
                          ? 'bg-saffron-500 text-white font-bold border-saffron-500 shadow-md ring-4 ring-saffron-200 scale-102'
                          : 'bg-white text-charcoal-700 border-cream-300 hover:border-saffron-400 hover:bg-saffron-50/40 shadow-xs'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow-xs">{tier.icon}</span>
                      <span className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-charcoal-800'}`}>
                        {tier.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.age && (
                <p role="alert" className="text-xs text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Field: Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-charcoal-900">
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
                    className={`min-h-[48px] py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                      profile.gender === g.val
                        ? 'border-saffron-500 bg-saffron-50/90 text-saffron-900 ring-2 ring-saffron-300 shadow-2xs'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-800'
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
        {/* STEP 2: Category & Income                                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold">2</span>
                {t('wizardStep2Title')}
              </h2>
              <p className="text-xs text-charcoal-700 mt-0.5 font-medium">
                {t('wizardStep2Subtitle')}
              </p>
            </div>

            {/* Field: Caste Category */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-charcoal-900">
                {t('fieldCaste')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {CASTE_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProfile({ ...profile, caste: c })}
                    className={`min-h-[48px] py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                      profile.caste === c
                        ? 'border-saffron-500 bg-saffron-50/90 text-saffron-900 ring-2 ring-saffron-300 shadow-2xs'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Annual Family Income (4 Plain-Language Tiers) */}
            <div className="space-y-3.5 p-5 sm:p-6 rounded-3xl bg-cream-50/70 border border-forest-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-forest-600" />
                  <span>{t('fieldIncome')}</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-xs text-charcoal-500 font-medium hidden sm:block">
                  {t('fieldIncomeHelper')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'bpl',
                    val: 0,
                    isBpl: true,
                    title: t('incomeTierBpl'),
                    desc: t('incomeTierBplDesc'),
                    icon: '🏷️',
                    isActive: (p: typeof profile) => p.income === 0 || (p.is_bpl && p.income <= 50000),
                  },
                  {
                    id: 'low',
                    val: 100000,
                    isBpl: false,
                    title: t('incomeTierLow'),
                    desc: t('incomeTierLowDesc'),
                    icon: '🌾',
                    isActive: (p: typeof profile) => p.income > 0 && p.income <= 150000 && !p.is_bpl,
                  },
                  {
                    id: 'mid',
                    val: 220000,
                    isBpl: false,
                    title: t('incomeTierMid'),
                    desc: t('incomeTierMidDesc'),
                    icon: '💼',
                    isActive: (p: typeof profile) => p.income > 150000 && p.income <= 300000,
                  },
                  {
                    id: 'high',
                    val: 500000,
                    isBpl: false,
                    title: t('incomeTierHigh'),
                    desc: t('incomeTierHighDesc'),
                    icon: '🏢',
                    isActive: (p: typeof profile) => p.income > 300000,
                  }
                ].map((tier) => {
                  const selected = tier.isActive(profile);
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setProfile({ 
                          ...profile, 
                          income: tier.val, 
                          is_bpl: tier.isBpl ? true : (tier.val === 0 ? true : profile.is_bpl && profile.income === 0 ? false : profile.is_bpl) 
                        });
                        setErrors((prev) => ({ ...prev, income: undefined }));
                      }}
                      className={`min-h-[80px] p-4 sm:p-4.5 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all duration-200 active:scale-98 group focus:outline-none focus:ring-2 focus:ring-forest-500 ${
                        selected
                          ? 'border-forest-600 bg-forest-50/90 text-forest-950 font-bold ring-4 ring-forest-100 shadow-md'
                          : 'border-cream-300 bg-white hover:border-forest-400 hover:bg-cream-50 text-charcoal-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl sm:text-3xl mt-0.5 filter drop-shadow-xs">{tier.icon}</span>
                        <div>
                          <span className={`text-sm sm:text-base font-extrabold block leading-tight ${selected ? 'text-forest-950' : 'text-charcoal-900'}`}>
                            {tier.title}
                          </span>
                          <span className={`text-xs mt-1 block font-medium leading-relaxed ${selected ? 'text-forest-800' : 'text-charcoal-500'}`}>
                            {tier.desc}
                          </span>
                        </div>
                      </div>
                      {selected && (
                        <CheckCircle2 className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.income && (
                <p role="alert" className="text-xs text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.income}</span>
                </p>
              )}
            </div>

            {/* Field: Residence Area */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-charcoal-900">
                {t('fieldResidence')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: 'Rural', label: t('fieldResidenceRural'), icon: '🏡' },
                  { val: 'Urban', label: t('fieldResidenceUrban'), icon: '🏙️' },
                  { val: 'Semi-Urban', label: t('fieldResidenceSemiUrban'), icon: '🏘️' },
                  { val: 'All', label: t('fieldResidenceAll'), icon: '🌏' }
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, residence: r.val })}
                    className={`min-h-[64px] p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      profile.residence === r.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-300'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-800 font-semibold'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{r.icon}</div>
                    <div className="text-xs sm:text-sm font-bold">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Life Stage & Special Status                                       */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-cream-300 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-saffron-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                {t('wizardStep3Title')}
              </h2>
              <p className="text-xs text-charcoal-700 mt-0.5 font-medium">
                {t('wizardStep3Subtitle')}
              </p>
            </div>

            {/* Field: Life Stage */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-charcoal-900">
                {t('fieldLifeStage')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { 
                    val: 'student', 
                    label: t('fieldLifeStageStudent'), 
                    icon: '🎓',
                    hint: language === 'hi' ? 'छात्रवृत्ति, वजीफा व शिक्षा सहायता' : 'Scholarships & education aid'
                  },
                  { 
                    val: 'maternal', 
                    label: t('fieldLifeStageMaternal'), 
                    icon: '🤱',
                    hint: language === 'hi' ? 'मातृ वंदना (PMMVY) व पोषण सहायता' : 'Maternity aid & nutrition grants'
                  },
                  { 
                    val: 'entrepreneur', 
                    label: t('fieldLifeStageEntrepreneur'), 
                    icon: '💼',
                    hint: language === 'hi' ? 'मुद्रा ऋण, SHG व सिलाई प्रशिक्षण' : 'Business loans & skill training'
                  },
                  { 
                    val: 'senior', 
                    label: t('fieldLifeStageSenior'), 
                    icon: '👵',
                    hint: language === 'hi' ? 'पेंशन व स्वास्थ्य सहायता' : 'Old age pensions & healthcare'
                  },
                  { 
                    val: 'all', 
                    label: t('fieldLifeStageGeneral'), 
                    icon: '🌸',
                    hint: language === 'hi' ? 'सभी सामान्य कल्याण योजनाएं' : 'General citizen schemes'
                  }
                ].map((ls) => (
                  <button
                    key={ls.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, life_stage: ls.val })}
                    className={`min-h-[64px] p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      profile.life_stage === ls.val
                        ? 'border-saffron-500 bg-saffron-50/90 text-saffron-900 font-bold ring-2 ring-saffron-300 shadow-xs'
                        : 'border-cream-300 bg-white hover:bg-cream-50 text-charcoal-800'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{ls.icon}</span>
                    <div>
                      <span className="text-sm font-bold block text-charcoal-900">{ls.label}</span>
                      <span className="text-xs text-charcoal-600 font-medium">{ls.hint}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field: BPL Card Visual Option Cards */}
            <div className="space-y-3 p-5 sm:p-6 rounded-3xl bg-cream-50/70 border border-saffron-200/80 shadow-xs">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                  <span>💳</span>
                  <span>{t('fieldBpl')}</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
                  {t('fieldBplHelper')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    isBpl: true,
                    title: t('bplYesTitle'),
                    desc: t('bplYesDesc'),
                    icon: '💳'
                  },
                  {
                    isBpl: false,
                    title: t('bplNoTitle'),
                    desc: t('bplNoDesc'),
                    icon: '⚪'
                  }
                ].map((opt) => {
                  const isSelected = profile.is_bpl === opt.isBpl;
                  return (
                    <button
                      key={String(opt.isBpl)}
                      type="button"
                      onClick={() => setProfile({ ...profile, is_bpl: opt.isBpl })}
                      className={`min-h-[72px] p-4 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all duration-200 active:scale-98 group focus:outline-none focus:ring-2 focus:ring-saffron-400 ${
                        isSelected
                          ? 'border-saffron-500 bg-saffron-50/90 text-saffron-950 font-bold ring-4 ring-saffron-200/80 shadow-md'
                          : 'border-cream-300 bg-white hover:border-saffron-400 hover:bg-cream-50 text-charcoal-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5 filter drop-shadow-xs">{opt.icon}</span>
                        <div>
                          <span className={`text-sm font-extrabold block leading-tight ${isSelected ? 'text-saffron-950' : 'text-charcoal-900'}`}>
                            {opt.title}
                          </span>
                          <span className={`text-xs mt-0.5 block font-medium leading-relaxed ${isSelected ? 'text-saffron-800' : 'text-charcoal-500'}`}>
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-saffron-700 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Disability (PwD) Visual Option Cards */}
            <div className="space-y-3 p-5 sm:p-6 rounded-3xl bg-cream-50/70 border border-saffron-200/80 shadow-xs">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                  <span>♿</span>
                  <span>{t('fieldDisability')}</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
                  {t('fieldDisabilityHelper')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    hasDisability: true,
                    title: t('disabilityYesTitle'),
                    desc: t('disabilityYesDesc'),
                    icon: '♿'
                  },
                  {
                    hasDisability: false,
                    title: t('disabilityNoTitle'),
                    desc: t('disabilityNoDesc'),
                    icon: '⚪'
                  }
                ].map((opt) => {
                  const isSelected = profile.has_disability === opt.hasDisability;
                  return (
                    <button
                      key={String(opt.hasDisability)}
                      type="button"
                      onClick={() => setProfile({ ...profile, has_disability: opt.hasDisability })}
                      className={`min-h-[72px] p-4 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all duration-200 active:scale-98 group focus:outline-none focus:ring-2 focus:ring-saffron-400 ${
                        isSelected
                          ? 'border-saffron-500 bg-saffron-50/90 text-saffron-950 font-bold ring-4 ring-saffron-200/80 shadow-md'
                          : 'border-cream-300 bg-white hover:border-saffron-400 hover:bg-cream-50 text-charcoal-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5 filter drop-shadow-xs">{opt.icon}</span>
                        <div>
                          <span className={`text-sm font-extrabold block leading-tight ${isSelected ? 'text-saffron-950' : 'text-charcoal-900'}`}>
                            {opt.title}
                          </span>
                          <span className={`text-xs mt-0.5 block font-medium leading-relaxed ${isSelected ? 'text-saffron-800' : 'text-charcoal-500'}`}>
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-saffron-700 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inlined Optional Details (Occupation / Education) */}
            <div className="p-5 sm:p-6 rounded-3xl border border-cream-300 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-saffron-600" />
                    <span>{t('optionalDetailsTitle')}</span>
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('optionalDetailsSubtitle')}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200 text-charcoal-700">
                  {language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal-800 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-forest-600" />
                    <span>{t('fieldOccupation')}</span>
                  </label>
                  <select
                    value={profile.occupation || ''}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    className="w-full min-h-[48px] p-3 rounded-2xl border border-cream-300 bg-cream-50/60 text-charcoal-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors"
                  >
                    <option value="">-- {language === 'hi' ? 'व्यवसाय चुनें (वैकल्पिक)' : 'Select Occupation (Optional)'} --</option>
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ.value} value={occ.value}>
                        {language === 'hi' ? occ.labelHi : occ.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal-800 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-saffron-600" />
                    <span>{t('fieldEducation')}</span>
                  </label>
                  <select
                    value={profile.education || ''}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="w-full min-h-[48px] p-3 rounded-2xl border border-cream-300 bg-cream-50/60 text-charcoal-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-colors"
                  >
                    <option value="">-- {language === 'hi' ? 'शिक्षा स्तर चुनें (वैकल्पिक)' : 'Select Education Level (Optional)'} --</option>
                    {EDUCATION_OPTIONS.map((edu) => (
                      <option key={edu.value} value={edu.value}>
                        {language === 'hi' ? edu.labelHi : edu.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-6 border-t border-cream-300 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentStep === 1 || loading}
            onClick={handlePrev}
            className="min-h-[48px] px-5 py-3 rounded-2xl border border-cream-300 text-charcoal-800 hover:bg-cream-100 text-sm font-bold transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBack')}</span>
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white text-sm sm:text-base font-extrabold shadow-md transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
            >
              <span>{t('btnNext')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white text-sm sm:text-base font-black shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('wizardMatchingLoading')}</span>
                </>
              ) : (
                <>
                  <span>{t('wizardSubmitBtn')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default Wizard;
