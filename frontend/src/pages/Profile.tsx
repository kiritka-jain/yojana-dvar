import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getLocalBookmarks } from '../services/api';
import { 
  User, 
  CheckCircle2, 
  LogOut, 
  Bookmark, 
  Sparkles, 
  ArrowRight,
  Globe,
  Trash2
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  useEffect(() => {
    const updateCount = () => {
      setBookmarkCount(getLocalBookmarks().length);
    };
    updateCount();
    window.addEventListener('yojana_bookmarks_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('yojana_bookmarks_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleClearLocalBookmarks = () => {
    localStorage.removeItem('yojana_saved_bookmarks');
    window.dispatchEvent(new Event('yojana_bookmarks_updated'));
    setBookmarkCount(0);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-saffron-100 shadow-card space-y-6 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-6">
          <div className="flex items-center gap-4">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt="" 
                className="w-16 h-16 rounded-2xl border-2 border-saffron-400 p-0.5 bg-saffron-50 flex-shrink-0" 
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-saffron-100 border border-saffron-300 flex items-center justify-center text-saffron-800 flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">
                {currentUser?.displayName || (language === 'hi' ? 'नागरिक सत्र' : 'Citizen Session')}
              </h1>
              <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                <span>
                  {isAuthenticated 
                    ? (language === 'hi' ? 'सत्यापित डिजिटल सत्र' : 'Verified Citizen Session')
                    : (language === 'hi' ? 'स्थानीय सुरक्षित सत्र' : 'Local Private Session')}
                </span>
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="p-2.5 rounded-xl border border-cream-300 hover:border-red-300 hover:bg-red-50 text-charcoal-600 hover:text-red-700 transition-colors"
              title={t('navSignOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Preferences & Session Stats */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-charcoal-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-saffron-600" />
              <span>{language === 'hi' ? 'सक्रिय भाषा' : 'Interface Language'}</span>
            </span>
            <span className="font-bold text-xs text-saffron-800 bg-white px-3 py-1 rounded-xl border border-cream-300">
              {language === 'hi' ? 'हिंदी (Hindi)' : 'English (EN)'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-charcoal-700 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-saffron-600" />
              <span>{language === 'hi' ? 'सहेजी गई योजनाएं' : 'Saved Schemes'}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-charcoal-800 bg-white px-3 py-1 rounded-xl border border-cream-300">
                {bookmarkCount}
              </span>
              {bookmarkCount > 0 && (
                <Link
                  to="/bookmarks"
                  className="text-xs font-bold text-saffron-700 hover:text-saffron-800 hover:underline"
                >
                  {language === 'hi' ? 'देखें' : 'View'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Clear Notice Toast */}
        {clearedNotice && (
          <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold">
            {language === 'hi' ? 'सहेजी गई योजनाओं की सूची खाली कर दी गई है।' : 'Saved bookmarks list has been cleared.'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/find"
            className="flex-1 py-3 px-5 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm text-center shadow-sm transition-all hover:scale-101 active:scale-99 inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'hi' ? 'पात्र योजनाएं खोजें' : 'Find Eligible Schemes'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {bookmarkCount > 0 && (
            <button
              type="button"
              onClick={handleClearLocalBookmarks}
              className="py-3 px-4 rounded-2xl border border-cream-300 hover:border-red-300 hover:bg-red-50 text-charcoal-600 hover:text-red-700 font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'सहेजी गई सूची साफ़ करें' : 'Clear Saved List'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
