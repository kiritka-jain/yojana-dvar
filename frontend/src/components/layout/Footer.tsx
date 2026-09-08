import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#f7f2e7] border-t border-saffron-200/60 mt-16 sm:mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-saffron-200/60">
          
          {/* Col 1 & 2: Brand Info & Advisory */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-saffron-100 border border-saffron-500 flex items-center justify-center p-1 shadow-xs">
                <img src="/chakra.svg" alt="Yojana Dvar Emblem" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg text-charcoal-900 tracking-tight">
                {t('navBrand')}
              </span>
            </div>

            {/* Integrated Compact Advisory Note */}
            <div className="inline-flex items-start gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 max-w-md">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">{t('footerDisclaimer')}</p>
            </div>
          </div>

          {/* Col 3: Official Government Portals */}
          <div>
            <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider mb-3">
              {t('footerGovtPortalsTitle')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-charcoal-600">
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

          {/* Col 4: Platform & Info */}
          <div>
            <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider mb-3">
              {t('footerPlatformInfo')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-charcoal-600">
              <li>
                <Link to="/about" className="hover:text-saffron-700 font-medium transition-colors">
                  {t('footerAbout')}
                </Link>
              </li>
              <li>
                <Link to="/find" className="hover:text-saffron-700 transition-colors">
                  {t('navFindSchemes')}
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-saffron-700 transition-colors">
                  {t('navBookmarks')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-charcoal-600 hover:text-saffron-700 transition-colors">
                  {t('footerAccessibility')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <p>{t('footerRights')}</p>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
            <span>{t('footerMadeWithLove')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
