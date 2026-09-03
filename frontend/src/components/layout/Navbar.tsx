import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Globe, 
  Bookmark, 
  Search, 
  Menu, 
  X, 
  Sparkles,
  User,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-charcoal-900 tracking-tight">
                  {language === 'hi' ? 'योजना द्वार' : 'Yojana Dvar'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800 border border-forest-200">
                  <Sparkles className="w-3 h-3 mr-1 text-forest-600" />
                  {language === 'hi' ? 'सरकारी सेवा' : 'Govt Portal'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-medium hidden sm:block">
                {t('navSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
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
                isActive('/find') || isActive('/wizard') || isActive('/results')
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
              <Bookmark className="w-4 h-4 text-saffron-600" />
              {t('navBookmarks')}
            </Link>

            <Link
              to="/profile"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/profile') 
                  ? 'bg-saffron-100 text-saffron-800 font-bold' 
                  : 'text-charcoal-700 hover:text-saffron-700 hover:bg-cream-100'
              }`}
            >
              <User className="w-4 h-4 text-charcoal-500" />
              {t('navProfile')}
            </Link>
          </nav>

          {/* Right Action: High-Visibility Language Switcher + User Info */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language between Hindi and English"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-saffron-300 bg-white hover:bg-saffron-50 text-xs font-bold text-charcoal-800 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Globe className="w-4 h-4 text-saffron-600 flex-shrink-0" />
              <span className={language === 'en' ? 'text-saffron-700 font-extrabold' : 'text-charcoal-400 font-medium'}>
                English
              </span>
              <span className="text-charcoal-300">|</span>
              <span className={language === 'hi' ? 'text-forest-700 font-extrabold text-sm' : 'text-charcoal-400 font-medium'}>
                हिंदी
              </span>
            </button>

            {/* User Auth Status Pill */}
            {isAuthenticated && currentUser ? (
              <div className="hidden sm:inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-xs">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5 text-saffron-700" />
                )}
                <span className="font-semibold text-charcoal-800 max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
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
            ) : (
              <Link
                to="/bookmarks"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream-300 hover:border-saffron-300 text-xs font-semibold text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-saffron-600" />
                <span>{t('navSignIn')}</span>
              </Link>
            )}

            {/* CTA Button */}
            <Link
              to="/find"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-white text-xs lg:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              {t('heroStartWizard')}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-charcoal-700 hover:bg-cream-200"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-saffron-100 py-4 px-2 space-y-2 animate-fadeIn bg-cream-100/95 backdrop-blur-md rounded-b-xl shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive('/') ? 'bg-saffron-100 text-saffron-900 font-semibold' : 'text-charcoal-800'
              }`}
            >
              {t('navHome')}
            </Link>

            <Link
              to="/find"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive('/find') || isActive('/wizard') ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-charcoal-800'
              }`}
            >
              {t('navFindSchemes')}
            </Link>

            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive('/bookmarks') ? 'bg-saffron-100 text-saffron-900 font-semibold' : 'text-charcoal-800'
              }`}
            >
              {t('navBookmarks')}
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive('/profile') ? 'bg-saffron-100 text-saffron-900 font-semibold' : 'text-charcoal-800'
              }`}
            >
              {t('navProfile')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
