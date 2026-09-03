import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Search, Bookmark } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/find') return location.pathname === '/find' || location.pathname === '/wizard' || location.pathname === '/results';
    if (path === '/bookmarks') return location.pathname === '/bookmarks';
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-4 py-2 shadow-2xl flex items-center justify-around">
      {/* Home Tab */}
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          isActive('/') 
            ? 'text-saffron-700 font-extrabold' 
            : 'text-charcoal-500 hover:text-charcoal-900'
        }`}
      >
        <Home className={`w-5 h-5 ${isActive('/') ? 'text-saffron-600 stroke-[2.5]' : ''}`} />
        <span className="text-[11px] font-medium">{t('navHome')}</span>
      </Link>

      {/* Find Schemes Tab */}
      <Link
        to="/find"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          isActive('/find') 
            ? 'text-saffron-700 font-extrabold' 
            : 'text-charcoal-500 hover:text-charcoal-900'
        }`}
      >
        <Search className={`w-5 h-5 ${isActive('/find') ? 'text-saffron-600 stroke-[2.5]' : ''}`} />
        <span className="text-[11px] font-medium">{language === 'hi' ? 'योजना खोजें' : 'Find Schemes'}</span>
      </Link>

      {/* Saved Bookmarks Tab */}
      <Link
        to="/bookmarks"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
          isActive('/bookmarks') 
            ? 'text-saffron-700 font-extrabold' 
            : 'text-charcoal-500 hover:text-charcoal-900'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isActive('/bookmarks') ? 'text-saffron-600 stroke-[2.5] fill-saffron-100' : ''}`} />
        <span className="text-[11px] font-medium">{language === 'hi' ? 'सहेजी गई' : 'Saved'}</span>
      </Link>
    </div>
  );
};

export default BottomNav;
