import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-10 sm:space-y-14">

      {/* 1. Hero Introduction & Category Discovery Section */}
      <section className="relative pt-6 pb-2 sm:pt-10 sm:pb-4 overflow-hidden">
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
          <p className="text-base sm:text-lg text-charcoal-700 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>

          {/* 1-Tap Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-charcoal-500 hidden sm:inline">
              {t('heroQuickSearch')}
            </span>
            <button
              type="button"
              onClick={() => navigate('/results?category=education')}
              className="px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipScholarship')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=maternity')}
              className="px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipMaternity')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=business')}
              className="px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipBusiness')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/results?category=pension')}
              className="px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-charcoal-200/60 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors hover:scale-102 cursor-pointer"
            >
              {t('heroChipPension')}
            </button>
          </div>

        </div>
      </section>

      {/* 2. Middle Hero Feature: Centered "Ready to Discover Your Entitlements?" CTA Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl gradient-civic p-8 sm:p-12 text-white shadow-xl text-center space-y-6">
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-saffron-200" />
              <span>{t('heroStartWizard')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('ctaBannerTitle')}
            </h2>
            <p className="text-sm sm:text-base text-saffron-100 leading-relaxed font-medium max-w-xl mx-auto">
              {t('ctaBannerSubtitle')}
            </p>
          </div>

          {/* Centered Big Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/find')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-saffron-700 hover:bg-cream-100 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{t('heroStartWizard')}</span>
              <ArrowRight className="w-5 h-5 text-saffron-600" />
            </button>
          </div>

          {/* Compact Trust Badges Integrated Underneath */}
          <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-saffron-100 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>{t('statFreeAccess')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>{t('statGovtSchemes')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>{t('statNoAadhaar')}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
