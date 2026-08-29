import React, { useState, useEffect } from 'react';
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
  Info,
  Check
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

export const Wizard: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePersonaName, setActivePersonaName] = useState<string | null>(null);

  // Demographic Profile State
  const [profile, setProfile] = useState<ProfileInput>({
    state: 'Uttar Pradesh',
    age: 24,
    gender: 'Female',
    caste: 'General',
    income: 120000,
    residence: 'Rural',
    life_stage: 'maternal',
    is_bpl: false,
    has_disability: false,
    limit: 10
  });

  // Pre-populate if ?persona=<id> is present in URL
  useEffect(() => {
    const personaParam = searchParams.get('persona');
    if (!personaParam) return;

    if (personaParam === 'priya') {
      setProfile({
        state: 'Karnataka',
        age: 19,
        gender: 'Female',
        caste: 'OBC',
        income: 180000,
        residence: 'Urban',
        life_stage: 'student',
        is_bpl: false,
        has_disability: false,
        limit: 10
      });
      setActivePersonaName(language === 'hi' ? 'प्रिया शर्मा (19 वर्ष • छात्रा)' : 'Priya Sharma (19yo Student)');
    } else if (personaParam === 'sunita') {
      setProfile({
        state: 'Bihar',
        age: 26,
        gender: 'Female',
        caste: 'SC',
        income: 48000,
        residence: 'Rural',
        life_stage: 'maternal',
        is_bpl: true,
        has_disability: false,
        limit: 10
      });
      setActivePersonaName(language === 'hi' ? 'सुनीता देवी (26 वर्ष • गर्भवती माता)' : 'Sunita Devi (26yo Expecting Mother)');
    } else if (personaParam === 'lakshmi') {
      setProfile({
        state: 'Tamil Nadu',
        age: 42,
        gender: 'Female',
        caste: 'General',
        income: 220000,
        residence: 'Urban',
        life_stage: 'entrepreneur',
        is_bpl: false,
        has_disability: false,
        limit: 10
      });
      setActivePersonaName(language === 'hi' ? 'लक्ष्मी अम्मल (42 वर्ष • महिला उद्यमी)' : 'Lakshmi Ammal (42yo Entrepreneur)');
    }
  }, [searchParams, language]);

  // Validation handlers
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!profile.state) {
        setErrorMsg(language === 'hi' ? 'कृपया अपना राज्य चुनें।' : 'Please select your state of residence.');
        return false;
      }
      if (profile.age < 0 || profile.age > 110) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य आयु (0-110 वर्ष) दर्ज करें।' : 'Please enter a valid age (0-110 years).');
        return false;
      }
    }
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
    setLoading(true);
    setErrorMsg(null);

    try {
      const matchResult = await matchSchemes(profile);
      navigate('/results', { state: { matchData: matchResult, profile } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while matching schemes. Please try again.');
      setLoading(false);
    }
  };

  // Steps configuration for Stepper
  const stepsConfig = [
    { num: 1, title: t('wizardStep1Title'), icon: <User className="w-4 h-4" /> },
    { num: 2, title: t('wizardStep2Title'), icon: <IndianRupee className="w-4 h-4" /> },
    { num: 3, title: t('wizardStep3Title'), icon: <HeartHandshake className="w-4 h-4" /> },
    { num: 4, title: t('wizardStep4Title'), icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Wizard Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
          {t('wizardTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5">
          {t('wizardSubtitle')}
        </p>

        {activePersonaName && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-100 border border-saffron-300 text-saffron-900 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            <span>{activePersonaName}</span>
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          
          {/* Connector Line Behind Icons */}
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
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                className="flex flex-col items-center group focus:outline-none"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-sm ${
                    isCompleted
                      ? 'bg-forest-500 text-white'
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

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-saffron-100 shadow-card">
        
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-cream-300 pb-4">
              <h2 className="text-xl font-bold text-charcoal-900">
                {t('wizardStep1Title')}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                {t('wizardStep1Subtitle')}
              </p>
            </div>

            {/* Field: State */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                <MapPin className="w-4 h-4 inline mr-1 text-saffron-600" />
                {t('fieldState')} <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm focus:ring-2 focus:ring-saffron-500 focus:outline-none transition-shadow"
              >
                <option value="">{t('fieldStatePlaceholder')}</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Field: Age */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-charcoal-900">
                  {t('fieldAge')} <span className="text-red-500">*</span>
                </label>
                <span className="text-base font-bold text-saffron-700 bg-saffron-50 px-3 py-1 rounded-lg border border-saffron-200">
                  {profile.age} {language === 'hi' ? 'वर्ष' : 'Years'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-saffron-500"
              />
              <p className="text-xs text-charcoal-500">
                {t('fieldAgeHelper')}
              </p>
            </div>

            {/* Field: Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldGender')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { val: 'Female', label: t('fieldGenderFemale') },
                  { val: 'Transgender', label: t('fieldGenderTransgender') },
                  { val: 'All', label: t('fieldGenderAll') }
                ].map((g) => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: g.val })}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
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

        {/* STEP 2: Socio-Economic Profile */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-cream-300 pb-4">
              <h2 className="text-xl font-bold text-charcoal-900">
                {t('wizardStep2Title')}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                {t('wizardStep2Subtitle')}
              </p>
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
                    className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
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

            {/* Field: Annual Family Income */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-charcoal-900">
                  <IndianRupee className="w-4 h-4 inline mr-1 text-forest-600" />
                  {t('fieldIncome')}
                </label>
                <span className="text-base font-bold text-forest-700 bg-forest-50 px-3 py-1 rounded-lg border border-forest-200">
                  ₹{profile.income.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="25000"
                value={profile.income}
                onChange={(e) => setProfile({ ...profile, income: parseInt(e.target.value) || 0 })}
                className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-forest-500"
              />
              <div className="flex justify-between text-xs text-charcoal-400">
                <span>₹0 (EWS / Low Income)</span>
                <span>₹2.5 Lakh</span>
                <span>₹5 Lakh</span>
                <span>₹10+ Lakh</span>
              </div>
              <p className="text-xs text-charcoal-500">
                {t('fieldIncomeHelper')}
              </p>
            </div>

            {/* Field: Residence Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldResidence')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: 'Rural', label: t('fieldResidenceRural') },
                  { val: 'Urban', label: t('fieldResidenceUrban') },
                  { val: 'Semi-Urban', label: t('fieldResidenceSemiUrban') },
                  { val: 'All', label: t('fieldResidenceAll') }
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, residence: r.val })}
                    className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                      profile.residence === r.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Life Stage & Special Status */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-cream-300 pb-4">
              <h2 className="text-xl font-bold text-charcoal-900">
                {t('wizardStep3Title')}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                {t('wizardStep3Subtitle')}
              </p>
            </div>

            {/* Field: Life Stage */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal-900">
                {t('fieldLifeStage')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { val: 'student', label: t('fieldLifeStageStudent'), icon: '🎓' },
                  { val: 'maternal', label: t('fieldLifeStageMaternal'), icon: '🤱' },
                  { val: 'entrepreneur', label: t('fieldLifeStageEntrepreneur'), icon: '💼' },
                  { val: 'senior', label: t('fieldLifeStageSenior'), icon: '👵' },
                  { val: 'all', label: t('fieldLifeStageGeneral'), icon: '🌸' }
                ].map((ls) => (
                  <button
                    key={ls.val}
                    type="button"
                    onClick={() => setProfile({ ...profile, life_stage: ls.val })}
                    className={`py-3 px-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      profile.life_stage === ls.val
                        ? 'border-saffron-500 bg-saffron-50/80 text-saffron-900 font-bold ring-2 ring-saffron-200'
                        : 'border-cream-300 hover:bg-cream-100 text-charcoal-700'
                    }`}
                  >
                    <span className="text-xl">{ls.icon}</span>
                    <span className="text-sm font-medium">{ls.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field: BPL Toggle */}
            <div className="p-4 rounded-2xl border border-cream-300 bg-cream-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">
                    {t('fieldBpl')}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('fieldBplHelper')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, is_bpl: false })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                      !profile.is_bpl 
                        ? 'bg-charcoal-800 text-white border-charcoal-800' 
                        : 'bg-white text-charcoal-600 border-cream-300'
                    }`}
                  >
                    {t('fieldNo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, is_bpl: true })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                      profile.is_bpl 
                        ? 'bg-saffron-500 text-white border-saffron-500' 
                        : 'bg-white text-charcoal-600 border-cream-300'
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
                  <h4 className="text-sm font-semibold text-charcoal-900">
                    {t('fieldDisability')}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {t('fieldDisabilityHelper')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, has_disability: false })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                      !profile.has_disability 
                        ? 'bg-charcoal-800 text-white border-charcoal-800' 
                        : 'bg-white text-charcoal-600 border-cream-300'
                    }`}
                  >
                    {t('fieldNo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, has_disability: true })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                      profile.has_disability 
                        ? 'bg-saffron-500 text-white border-saffron-500' 
                        : 'bg-white text-charcoal-600 border-cream-300'
                    }`}
                  >
                    {t('fieldYes')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-cream-300 pb-4">
              <h2 className="text-xl font-bold text-charcoal-900">
                {t('wizardStep4Title')}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                {t('wizardStep4Subtitle')}
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="rounded-2xl border border-saffron-200 bg-saffron-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-saffron-900 uppercase tracking-wide">
                  {t('wizardSummaryTitle')}
                </h3>
                <span className="text-xs text-saffron-700 font-medium">9-Rule Engine Ready</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldState')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.state}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldAge')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.age} {language === 'hi' ? 'वर्ष' : 'Years'}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldGender')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.gender}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldCaste')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.caste}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldIncome')}</span>
                  <span className="font-semibold text-forest-700">₹{profile.income.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldResidence')}</span>
                  <span className="font-semibold text-charcoal-900">{profile.residence}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">{t('fieldLifeStage')}</span>
                  <span className="font-semibold text-charcoal-900 capitalize">{profile.life_stage}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">BPL Cardholder</span>
                  <span className="font-semibold text-charcoal-900">{profile.is_bpl ? t('fieldYes') : t('fieldNo')}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-saffron-100">
                  <span className="text-charcoal-500 block text-xs">Disability</span>
                  <span className="font-semibold text-charcoal-900">{profile.has_disability ? t('fieldYes') : t('fieldNo')}</span>
                </div>
              </div>
            </div>

            {/* Submit Action Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-saffron-500 to-terracotta text-white shadow-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">
                {language === 'hi' ? 'पात्रता मिलान शुरू करने के लिए तैयार' : 'Ready to Run Eligibility Matching'}
              </h3>
              <p className="text-xs sm:text-sm text-saffron-100 max-w-md mx-auto">
                {language === 'hi'
                  ? 'हमारा इंजन 100+ केंद्रीय और राज्य योजनाओं में आपकी पात्रता की तुरंत गणना करेगा।'
                  : 'We will cross-examine your demographic profile against all active central and state welfare rules in milliseconds.'}
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-saffron-700 hover:bg-cream-100 font-bold text-base shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
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
            </div>
          </div>
        )}

        {/* Wizard Footer Controls (Back / Next) */}
        <div className="mt-10 pt-6 border-t border-cream-300 flex items-center justify-between">
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

      </div>
    </div>
  );
};
