import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#f7f2e7] border-t border-saffron-200/60 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Mandatory Advisory Notice Banner */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 sm:p-5 mb-10 shadow-sm flex items-start gap-3.5">
          <ShieldCheck className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-900 tracking-wide uppercase mb-1">
              Public Advisory & Information Disclosure
            </h4>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              {t('footerDisclaimer')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-saffron-100">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-saffron-100 border border-saffron-500 flex items-center justify-center p-1">
                <img src="/chakra.svg" alt="Emblem" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg text-charcoal-900">
                {t('navBrand')}
              </span>
            </div>
            <p className="text-sm text-charcoal-600 max-w-md leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-charcoal-500 pt-2">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
              <span>for women empowerment across India</span>
            </div>
          </div>

          {/* Col 2: Official Portals */}
          <div>
            <h4 className="font-semibold text-sm text-charcoal-900 mb-3 tracking-wide">
              Official Government Portals
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>
                <a 
                  href="https://www.myscheme.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-saffron-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-3 h-3 text-charcoal-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://wcd.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-saffron-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Ministry of WCD</span>
                  <ExternalLink className="w-3 h-3 text-charcoal-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.digitalindia.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-saffron-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Digital India</span>
                  <ExternalLink className="w-3 h-3 text-charcoal-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://india.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-saffron-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-charcoal-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Accessibility & Info */}
          <div>
            <h4 className="font-semibold text-sm text-charcoal-900 mb-3 tracking-wide">
              Platform & Standards
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>{t('footerAccessibility')}</li>
              <li>Voice Navigation Enabled</li>
              <li>Progressive Web App (PWA)</li>
              <li>Dual Language (EN / हिंदी)</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>{t('footerRights')}</p>
          <div className="flex gap-4">
            <span className="hover:text-charcoal-700 cursor-pointer">{t('footerPrivacy')}</span>
            <span>•</span>
            <span className="hover:text-charcoal-700 cursor-pointer">{t('footerTerms')}</span>
            <span>•</span>
            <Link to="/about" className="hover:text-saffron-700 font-semibold hover:underline">
              {t('footerAbout')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
