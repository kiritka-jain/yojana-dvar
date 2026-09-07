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
          <p className="text-base sm:text-lg text-charcoal-700 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>

        </div>
      </section>

      {/* 2. Middle Hero Feature: High-Contrast Visual Call-to-Action Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl gradient-civic p-8 sm:p-12 text-white shadow-2xl text-center space-y-7 border border-white/15 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-terracotta/20 blur-2xl pointer-events-none" />

          {/* Title & Subtitle */}
          <div className="space-y-3 max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('ctaBannerTitle')}
            </h2>
            <p className="text-sm sm:text-base text-saffron-100 leading-relaxed font-medium max-w-xl mx-auto">
              {t('ctaBannerSubtitle')}
            </p>
          </div>

          {/* Centered High-Contrast Action Button with 48px+ Tap Target */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              type="button"
              onClick={() => navigate('/find')}
              className="w-full sm:w-auto min-h-[54px] px-8 py-4 rounded-2xl bg-white text-saffron-700 hover:bg-cream-50 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer ring-4 ring-white/20"
            >
              <span>{t('heroStartWizard')}</span>
              <ArrowRight className="w-5 h-5 text-saffron-600" />
            </button>
          </div>

          {/* Compact Trust Badges Integrated Underneath */}
          <div className="pt-5 border-t border-white/20 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-saffron-100 font-medium relative z-10">
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
