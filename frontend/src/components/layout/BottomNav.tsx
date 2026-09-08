import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { Home, Search, Bookmark } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { bookmarkCount } = useBookmarks();

  const isTabActive = (tab: 'home' | 'find' | 'bookmarks') => {
    const path = location.pathname;
    if (tab === 'home') {
      return path === '/';
    }
    if (tab === 'find') {
      return path === '/find' || path === '/wizard' || path === '/results' || path.startsWith('/schemes/');
    }
    if (tab === 'bookmarks') {
      return path === '/bookmarks';
    }
    return false;
  };

  return (
    <nav
      aria-label={language === 'hi' ? 'मोबाइल नेविगेशन बार' : 'Mobile Bottom Navigation'}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-cream-300 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-3"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1 items-center">
        {/* Tab 1: Home / मुख्य पृष्ठ */}
        <Link
          to="/"
          aria-current={isTabActive('home') ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
            isTabActive('home')
              ? 'bg-saffron-50 text-saffron-700 font-extrabold'
              : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/70 font-semibold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Home
              className={`w-5 h-5 transition-transform duration-200 ${
                isTabActive('home')
                  ? 'text-saffron-600 stroke-[2.5] scale-110'
                  : 'text-charcoal-700 stroke-[2]'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight mt-1 font-bold tracking-tight">
            {t('navHomeShort')}
          </span>
        </Link>

        {/* Tab 2: Find Schemes / योजना खोजें */}
        <Link
          to="/find"
          aria-current={isTabActive('find') ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
            isTabActive('find')
              ? 'bg-saffron-50 text-saffron-700 font-extrabold'
              : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/70 font-semibold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Search
              className={`w-5 h-5 transition-transform duration-200 ${
                isTabActive('find')
                  ? 'text-saffron-600 stroke-[2.5] scale-110'
                  : 'text-charcoal-700 stroke-[2]'
              }`}
            />
          </div>
          <span className="text-[11px] leading-tight mt-1 font-bold tracking-tight">
            {t('navFindShort')}
          </span>
        </Link>

        {/* Tab 3: Saved / सहेजी गई */}
        <Link
          to="/bookmarks"
          aria-current={isTabActive('bookmarks') ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 relative ${
            isTabActive('bookmarks')
              ? 'bg-saffron-50 text-saffron-700 font-extrabold'
              : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/70 font-semibold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Bookmark
              className={`w-5 h-5 transition-transform duration-200 ${
                isTabActive('bookmarks')
                  ? 'text-saffron-600 stroke-[2.5] fill-saffron-100 scale-110'
                  : 'text-charcoal-700 stroke-[2]'
              }`}
            />
            {bookmarkCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-saffron-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm"
                aria-label={`${bookmarkCount} ${language === 'hi' ? 'सहेजी गई योजनाएं' : 'saved schemes'}`}
              >
                {bookmarkCount > 9 ? '9+' : bookmarkCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight mt-1 font-bold tracking-tight">
            {t('navBookmarksShort')}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
