import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { 
  Globe, 
  Bookmark, 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut,
  Info
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Brand Logo & Title */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-saffron-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-full bg-saffron-50 border-2 border-saffron-500 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <img src="/chakra.svg" alt="Yojana Dvar Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-xl text-charcoal-900 tracking-tight">
                {t('navBrand')}
              </span>
              <p className="text-xs text-charcoal-500 font-medium hidden sm:block">
                {t('navSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-saffron-100 text-saffron-800 font-bold' 
                  : 'text-charcoal-700 hover:text-saffron-700 hover:bg-cream-100'
              }`}
            >
              {t('navHome')}
            </Link>

            <Link
              to="/find"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/find') || isActive('/wizard') || isActive('/results') || location.pathname.startsWith('/schemes/')
                  ? 'bg-saffron-100 text-saffron-800 font-bold' 
                  : 'text-charcoal-700 hover:text-saffron-700 hover:bg-cream-100'
              }`}
            >
              <Search className="w-4 h-4 text-saffron-600" />
              {t('navFindSchemes')}
            </Link>

            <Link
              to="/bookmarks"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/bookmarks') 
                  ? 'bg-saffron-100 text-saffron-800 font-bold' 
                  : 'text-charcoal-700 hover:text-saffron-700 hover:bg-cream-100'
              }`}
            >
              <div className="relative flex items-center">
                <Bookmark className="w-4 h-4 text-saffron-600" />
                {bookmarkCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-saffron-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {bookmarkCount > 9 ? '9+' : bookmarkCount}
                  </span>
                )}
              </div>
              <span>{t('navBookmarks')}</span>
            </Link>

            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/about') 
                  ? 'bg-saffron-100 text-saffron-800 font-bold' 
                  : 'text-charcoal-700 hover:text-saffron-700 hover:bg-cream-100'
              }`}
            >
              <Info className="w-4 h-4 text-saffron-600" />
              <span>{t('footerAbout')}</span>
            </Link>
          </nav>

          {/* Right Action: High-Visibility Language Switcher + User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* High-Visibility Segmented Language Switcher */}
            <div 
              role="group" 
              aria-label="Language selection"
              className="inline-flex items-center p-1 rounded-full bg-cream-200/90 border-2 border-saffron-300 shadow-sm"
            >
              <div className="hidden xs:flex items-center pl-1.5 pr-1 text-saffron-700">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                aria-label="हिंदी भाषा चुनें (Hindi)"
                className={`min-h-[36px] px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                  language === 'hi'
                    ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-sm font-black scale-100'
                    : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/80 font-semibold'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                aria-label="Select English language"
                className={`min-h-[36px] px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-sm font-black scale-100'
                    : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/80 font-semibold'
                }`}
              >
                English
              </button>
            </div>

            {/* User Auth Status Pill (rendered only when authenticated) */}
            {isAuthenticated && currentUser && (
              <div className="hidden sm:inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-xs">
                <Link to="/profile" className="flex items-center gap-1.5 hover:text-saffron-700 transition-colors">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-saffron-700" />
                  )}
                  <span className="font-semibold text-charcoal-800 max-w-[100px] truncate">
                    {currentUser.displayName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title={t('navSignOut')}
                  aria-label="Sign out"
                  className="p-1 rounded-full text-charcoal-400 hover:text-red-600 hover:bg-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-xl text-charcoal-700 hover:bg-cream-200 flex items-center justify-center transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation-drawer"
            role="dialog"
            aria-label="Mobile Navigation Menu"
            className="md:hidden border-t border-saffron-100 py-4 px-2 space-y-3 animate-fadeIn bg-cream-100/95 backdrop-blur-md rounded-b-2xl shadow-lg"
          >
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/') ? 'bg-saffron-100 text-saffron-900 font-bold' : 'text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                {t('navHome')}
              </Link>

              <Link
                to="/find"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/find') || isActive('/wizard') || isActive('/results') || location.pathname.startsWith('/schemes/') 
                    ? 'bg-saffron-100 text-saffron-900 font-bold' 
                    : 'text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                {t('navFindSchemes')}
              </Link>

              <Link
                to="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/bookmarks') ? 'bg-saffron-100 text-saffron-900 font-bold' : 'text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                <span>{t('navBookmarks')}</span>
                {bookmarkCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-saffron-600 text-white text-xs font-black shadow-xs">
                    {bookmarkCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/profile') ? 'bg-saffron-100 text-saffron-900 font-bold' : 'text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                {language === 'hi' ? 'नागरिक प्रोफ़ाइल व सत्र' : 'Citizen Profile & Session'}
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/about') ? 'bg-saffron-100 text-saffron-900 font-bold' : 'text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                {t('footerAbout')}
              </Link>
            </div>

            {/* Language Switcher in Mobile Drawer */}
            <div className="pt-2 border-t border-cream-300 px-2">
              <p className="text-xs font-bold text-charcoal-600 mb-2">
                {t('navSelectLanguage')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('hi');
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    language === 'hi'
                      ? 'bg-saffron-500 text-white border-saffron-600 shadow-sm font-black'
                      : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <span>हिंदी</span>
                  {language === 'hi' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    language === 'en'
                      ? 'bg-saffron-500 text-white border-saffron-600 shadow-sm font-black'
                      : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <span>✓</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
