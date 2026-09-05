import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Mic,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/find');
    }
  };

  const lifeStages = [
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: t('stageStudent'),
      desc: t('stageStudentDesc'),
      bg: 'bg-blue-50/80 hover:bg-blue-100/80',
      border: 'border-blue-100'
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-saffron-600" />,
      title: t('stageMaternal'),
      desc: t('stageMaternalDesc'),
      bg: 'bg-saffron-50/80 hover:bg-saffron-100/80',
      border: 'border-saffron-100'
    },
    {
      icon: <Briefcase className="w-8 h-8 text-forest-600" />,
      title: t('stageEntrepreneur'),
      desc: t('stageEntrepreneurDesc'),
      bg: 'bg-forest-50/80 hover:bg-forest-100/80',
      border: 'border-forest-100'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: t('stageSenior'),
      desc: t('stageSeniorDesc'),
      bg: 'bg-purple-50/80 hover:bg-purple-100/80',
      border: 'border-purple-100'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">

      {/* 1. Hero Section */}
      <section className="relative pt-6 pb-10 sm:pt-12 sm:pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-100/90 border border-saffron-300 text-saffron-900 text-xs sm:text-sm font-semibold mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-tight mb-4">
            {t('heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-terracotta">
              {t('heroHighlight')}
            </span>
          </h1>

          {/* Simplified, High-Contrast Subtitle */}
          <p className="text-base sm:text-lg text-charcoal-700 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>

          {/* Search / Voice Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-saffron-200 p-2 sm:p-2.5 flex items-center gap-2 transition-all duration-300 mb-4"
          >
            <div className="pl-3 text-charcoal-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('heroSearchPlaceholder')}
              className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
            />
            <button
              type="button"
              title={t('heroVoiceTooltip')}
              onClick={() => alert("Voice input listening... Speak scheme name or benefit.")}
              className="p-2.5 rounded-xl text-saffron-600 hover:bg-saffron-50 transition-colors focus:outline-none cursor-pointer"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-medium text-sm sm:text-base shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              {t('heroSearchButton')}
            </button>
          </form>

          {/* 1-Tap Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-4">
            <span className="text-xs font-semibold text-charcoal-500 hidden sm:inline">
              {t('heroQuickSearch')}
            </span>
            <button
              type="button"
              onClick={() => navigate('/results?category=education')}
              className="px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipScholarship')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=maternity')}
              className="px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipMaternity')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=business')}
              className="px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipBusiness')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=pension')}
              className="px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipPension')}
            </button>
          </div>

          {/* Direct 1-Tap Wizard Link */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-charcoal-600">
            <span>{language === 'hi' ? 'या 3 प्रश्नों में पात्रता निकालें:' : 'Or check instant eligibility:'}</span>
            <button
              type="button"
              onClick={() => navigate('/find')}
              className="text-saffron-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('heroStartWizard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 2. Key Trust & Accessibility Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-saffron-600" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">{t('statFreeAccess')}</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">{t('statFreeAccessSub')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-forest-100 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-forest-600" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">{t('statGovtSchemes')}</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">{t('statGovtSchemesSub')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">{t('statNoAadhaar')}</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">{t('statNoAadhaarSub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Life Stage Entitlements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
            {t('lifeStageTitle')}
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 mt-2">
            {t('lifeStageSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lifeStages.map((stage, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border ${stage.border} ${stage.bg} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="mb-4">{stage.icon}</div>
              <h3 className="font-bold text-charcoal-900 text-base mb-2">
                {stage.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Big Call-to-Action Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl gradient-civic p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {language === 'hi' ? 'अपनी पात्रता जांचने के लिए तैयार हैं?' : 'Ready to Discover Your Entitlements?'}
            </h2>
            <p className="text-sm sm:text-base text-saffron-100 leading-relaxed">
              {language === 'hi'
                ? 'केवल 3 सरल प्रश्नों के उत्तर दें और 1 मिनट में अपनी पात्र योजनाओं की सूची पाएं।'
                : 'Answer 3 simple questions to discover all direct welfare benefits designed for you.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/find')}
            className="flex-shrink-0 px-8 py-4 rounded-2xl bg-white text-saffron-700 hover:bg-cream-100 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>{t('heroStartWizard')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

    </div>
  );
};
