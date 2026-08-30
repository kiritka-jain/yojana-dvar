import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  Sparkles, 
  ExternalLink, 
  Database, 
  Cpu, 
  Lock, 
  Eye, 
  FileText, 
  Building2, 
  ArrowRight,
  Heart
} from 'lucide-react';

export const About: React.FC = () => {
  const { t, language } = useLanguage();

  const PILLARS = [
    {
      icon: <Cpu className="w-6 h-6 text-saffron-600" />,
      title: language === 'hi' ? '9-नियम निर्णायक इंजन' : 'Deterministic 9-Rule Engine',
      desc: language === 'hi'
        ? 'आयु, आय, जाति, राज्य, और जीवन चरण के आधार पर बिना किसी मतिभ्रम (hallucination) के सटीक पात्रता गणना।'
        : 'Predictable, zero-hallucination entitlement evaluation based on strictly verified administrative rules.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      title: language === 'hi' ? 'द्विभाषी जेमिनी एआई' : 'Bilingual Gemini 2.5 AI',
      desc: language === 'hi'
        ? 'कठिन सरकारी राजपत्रों और नियमों का हिंदी व अंग्रेजी में सरल भाषा में व्यक्तिगत स्पष्टीकरण।'
        : 'Translates dense bureaucratic gazettes and administrative criteria into clear plain language.'
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: language === 'hi' ? 'गोपनीयता सर्वप्रथम (Privacy by Design)' : 'Privacy-by-Design',
      desc: language === 'hi'
        ? 'व्यक्तिगत डेटा का कोई व्यावसायिक उपयोग नहीं। विवरण केवल पात्रता जांच हेतु स्थानीय रूप से सुरक्षित।'
        : 'Demographic attributes are processed solely for scheme evaluation with zero third-party monetization.'
    },
    {
      icon: <Eye className="w-6 h-6 text-purple-600" />,
      title: language === 'hi' ? 'सार्वभौमिक सुलभता (WCAG 2.1 AA)' : 'Universal Accessibility',
      desc: language === 'hi'
        ? 'स्क्रीन-रीडर अनुकूल, मोबाइल-प्रथम डिज़ाइन और निम्न-बैंडविड्थ ग्रामीण कनेक्टिविटी हेतु अनुकूलित।'
        : 'Built to WCAG 2.1 AA standards, optimized for low-bandwidth rural mobile internet connections.'
    }
  ];

  const OFFICIAL_PORTALS = [
    {
      name: 'myScheme National Portal',
      url: 'https://www.myscheme.gov.in/',
      ministry: 'National e-Governance Division (NeGD) • MeitY',
      desc: 'One-stop search and discovery portal for government schemes across India.'
    },
    {
      name: 'Ministry of Women and Child Development',
      url: 'https://wcd.gov.in/',
      ministry: 'Government of India',
      desc: 'Nodal ministry for Mission Shakti, PMMVY, BBBP, and women empowerment initiatives.'
    },
    {
      name: 'Ministry of Rural Development',
      url: 'https://rural.gov.in/',
      ministry: 'Government of India',
      desc: 'Administers DAY-NRLM, MGNREGA, PMAY-G, and rural women livelihood programs.'
    },
    {
      name: 'National Portal of India',
      url: 'https://india.gov.in/',
      ministry: 'Government of India',
      desc: 'Official gateway providing a single point of access to all public services and schemes.'
    },
    {
      name: 'Digital India Initiative',
      url: 'https://www.digitalindia.gov.in/',
      ministry: 'Ministry of Electronics & IT',
      desc: 'Flagship programme transforming India into a digitally empowered society.'
    },
    {
      name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      url: 'https://pmmvy.wcd.gov.in/',
      ministry: 'Ministry of WCD',
      desc: 'Official portal for maternal cash transfers and DBT nutrition disbursements.'
    }
  ];

  const DATA_ATTRIBUTIONS = [
    {
      name: 'myScheme Public Catalog',
      source: 'Government of India Open Data Services (myScheme.gov.in)',
      role: 'Scheme eligibility parameters, benefits formulas, and application guidelines'
    },
    {
      name: 'Ministry Public Domains',
      source: 'Official Gazette Notifications & Annual Ministry Reports',
      role: 'Administrative criteria, departmental nodal guidelines, and official portal URLs'
    },
    {
      name: 'Kaggle & Hugging Face Civic Datasets',
      source: 'Open Community Civic Tech Welfare Repositories',
      role: 'Curated public dataset baseline and state-specific scheme cross-referencing'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-100/90 text-saffron-900 border border-saffron-300 text-xs font-bold shadow-2xs">
          <img src="/chakra.svg" alt="Ashoka Chakra" className="w-4 h-4" />
          <span>Open-Source Civic Tech • Built for India</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight">
          {t('aboutTitle')}
        </h1>

        <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
          {t('aboutSubtitle')}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPLICIT LEGAL ADVISORY NOTICE (Ticket 6.8 Acceptance Criteria)        */}
      {/* ========================================================================= */}
      <div 
        role="region" 
        aria-label="Public Legal Advisory"
        className="p-6 sm:p-8 rounded-3xl bg-amber-50/95 border-2 border-amber-300 shadow-sm space-y-4 animate-fadeIn"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-7 h-7 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-amber-900 tracking-wide uppercase">
              {t('aboutLegalDisclaimerHeading')}
            </h2>
            <div className="text-xs sm:text-sm text-amber-950 space-y-2.5 leading-relaxed">
              <p><strong>{t('aboutLegalDisclaimerP1')}</strong></p>
              <p>{t('aboutLegalDisclaimerP2')}</p>
              <p>{t('aboutLegalDisclaimerP3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT MISSION & VISION                                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card space-y-6">
        <div className="border-b border-cream-200 pb-4">
          <span className="text-xs font-extrabold text-saffron-700 uppercase tracking-widest block mb-1">
            Vision & Alignment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {t('aboutMissionHeading')}
          </h2>
        </div>

        <div className="text-sm sm:text-base text-charcoal-700 space-y-4 leading-relaxed">
          <p>{t('aboutMissionP1')}</p>
          <p>{t('aboutMissionP2')}</p>
        </div>

        {/* Impact Quote */}
        <div className="p-5 rounded-2xl bg-cream-50 border-l-4 border-saffron-500 text-xs sm:text-sm text-charcoal-800 italic">
          &ldquo;Every woman in India possesses the constitutional and social right to easily know, understand, and claim the welfare entitlements created for her upliftment — without bureaucratic intermediaries.&rdquo;
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CORE ARCHITECTURAL PILLARS                                             */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-saffron-700 uppercase tracking-widest block mb-1">
            Technology & Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {t('aboutPillarsHeading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PILLARS.map((p, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-3 hover:border-saffron-300 transition-all hover:scale-101"
            >
              <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-charcoal-900">
                {p.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DATA SOURCES & PUBLIC ATTRIBUTION                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-card space-y-6">
        <div className="border-b border-cream-200 pb-4">
          <div className="flex items-center gap-2 text-saffron-700 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-widest">
              Data Transparency
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {t('aboutDataSourcesHeading')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
            {t('aboutDataSourcesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DATA_ATTRIBUTIONS.map((d, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-cream-50/80 border border-cream-200 space-y-2 text-xs">
              <div className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                <span>{d.name}</span>
              </div>
              <div className="text-charcoal-600 text-[11px] font-medium">
                <strong>Source:</strong> {d.source}
              </div>
              <p className="text-charcoal-500 text-[11px] leading-relaxed">
                {d.role}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-charcoal-500 pt-3 border-t border-cream-200">
          All scheme titles, eligibility rules, nodal guidelines, and portal trademarks belong to their respective nodal ministries of the Government of India and State Governments.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECOGNIZED OFFICIAL GOVERNMENT PORTALS                                 */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-saffron-700 uppercase tracking-widest block mb-1">
            Nodal Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {t('aboutOfficialPortalsHeading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_PORTALS.map((portal, idx) => (
            <a
              key={idx}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-5 border border-cream-300 shadow-2xs hover:border-saffron-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-charcoal-900 group-hover:text-saffron-700 transition-colors line-clamp-1">
                    {portal.name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-saffron-600 flex-shrink-0" />
                </div>
                <span className="text-[11px] text-charcoal-500 font-semibold block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-saffron-600" />
                  <span>{portal.ministry}</span>
                </span>
                <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-2 pt-1">
                  {portal.desc}
                </p>
              </div>

              <span className="text-xs text-saffron-700 font-bold inline-flex items-center gap-1 group-hover:underline pt-2 border-t border-cream-100">
                <span>Visit Official Portal</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. BOTTOM CTA BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-saffron-600 to-terracotta text-white shadow-xl text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-xl mx-auto">
          {t('aboutCtaHeading')}
        </h2>
        <p className="text-xs sm:text-sm text-saffron-100 max-w-md mx-auto leading-relaxed">
          Input your state, age, and life stage to get an instant matched list of central and state welfare entitlements with AI plain-language explanations.
        </p>
        <div>
          <Link
            to="/find"
            className="px-8 py-3.5 rounded-xl bg-white text-saffron-900 font-extrabold text-sm shadow-md hover:bg-cream-100 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-saffron-600" />
            <span>{t('aboutCtaButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="pt-4 flex items-center justify-center gap-1 text-[11px] text-saffron-200">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-white fill-white" />
          <span>for women entitlement empowerment across India</span>
        </div>
      </div>

    </div>
  );
};

export default About;
