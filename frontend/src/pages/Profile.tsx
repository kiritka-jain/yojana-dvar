import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { fetchUserProfile, setStoredUserProfile } from '../services/api';
import type { ProfileInput } from '../services/api';

const DEMO_PROFILES: Record<'priya' | 'sunita' | 'lakshmi', ProfileInput> = {
  priya: {
    state: 'Karnataka',
    age: 19,
    gender: 'Female',
    caste: 'OBC',
    income: 180000,
    residence: 'Urban',
    life_stage: 'student',
    occupation: 'Student',
    education: 'Undergraduate',
    is_bpl: false,
    has_disability: false,
    limit: 10
  },
  sunita: {
    state: 'Bihar',
    age: 26,
    gender: 'Female',
    caste: 'SC',
    income: 48000,
    residence: 'Rural',
    life_stage: 'maternal',
    occupation: 'Homemaker',
    education: 'Secondary',
    is_bpl: true,
    has_disability: false,
    limit: 10
  },
  lakshmi: {
    state: 'Tamil Nadu',
    age: 42,
    gender: 'Female',
    caste: 'General',
    income: 220000,
    residence: 'Urban',
    life_stage: 'entrepreneur',
    occupation: 'Self-Employed / Artisan',
    education: 'Diploma',
    is_bpl: false,
    has_disability: false,
    limit: 10
  }
};
import { getStateDisplayName } from '../constants/states';
import { 
  User, 
  CheckCircle2, 
  LogOut, 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  LogIn 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, token, isAuthenticated, loginDemo, logout } = useAuth();
  const { bookmarkCount, clearBookmarks } = useBookmarks();

  const [savedProfile, setSavedProfile] = useState<ProfileInput | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  // Load saved demographic profile from backend when authenticated
  const loadProfile = useCallback(async () => {
    if (isAuthenticated && token) {
      setProfileLoading(true);
      try {
        const prof = await fetchUserProfile(token);
        if (prof) {
          setSavedProfile(prof);
        }
      } catch (err) {
        console.warn('Failed to load user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    } else {
      setSavedProfile(null);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleClearBookmarks = async () => {
    await clearBookmarks();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const handleSaveDemoProfile = async (persona: 'priya' | 'sunita' | 'lakshmi') => {
    const prof = DEMO_PROFILES[persona];
    if (prof) {
      setStoredUserProfile(prof);
      setSavedProfile(prof);
    }
    loginDemo(persona);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
      
      {/* Main Profile Card */}
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
              <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                <span>
                  {isAuthenticated 
                    ? (language === 'hi' ? 'सत्यापित डिजिटल सत्र (क्लाउड सिंक सक्रिय)' : 'Verified Digital Session (Cloud Sync Active)')
                    : (language === 'hi' ? 'स्थानीय सुरक्षित सत्र (लोकल स्टोरेज)' : 'Local Private Session (Offline Storage)')}
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
              aria-label={t('navSignOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Guest Demo Persona Switcher (if not logged in) */}
        {!isAuthenticated && (
          <div className="p-4 sm:p-5 rounded-2xl bg-saffron-50/70 border border-saffron-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-saffron-900 uppercase tracking-wider">
              <LogIn className="w-4 h-4 text-saffron-600" />
              <span>{language === 'hi' ? '1-क्लिक नागरिक डेमो सत्र चुनें' : '1-Click Demo Citizen Profiles'}</span>
            </div>
            <p className="text-xs text-charcoal-600">
              {language === 'hi' 
                ? 'क्लाउड सिंक और व्यक्तिगत योजनाओं के परीक्षण हेतु किसी भी प्रोफाइल पर क्लिक करें:' 
                : 'Test cloud bookmark syncing and personalized match recommendations by switching persona:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSaveDemoProfile('priya')}
                className="p-2.5 rounded-xl bg-white border border-saffron-200 hover:border-saffron-400 text-xs font-bold text-charcoal-800 hover:bg-saffron-50 transition-all text-center"
              >
                👩‍🎓 Priya
              </button>
              <button
                type="button"
                onClick={() => handleSaveDemoProfile('sunita')}
                className="p-2.5 rounded-xl bg-white border border-saffron-200 hover:border-saffron-400 text-xs font-bold text-charcoal-800 hover:bg-saffron-50 transition-all text-center"
              >
                🤱 Sunita
              </button>
              <button
                type="button"
                onClick={() => handleSaveDemoProfile('lakshmi')}
                className="p-2.5 rounded-xl bg-white border border-saffron-200 hover:border-saffron-400 text-xs font-bold text-charcoal-800 hover:bg-saffron-50 transition-all text-center"
              >
                💼 Lakshmi
              </button>
            </div>
          </div>
        )}

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

        {/* Saved Demographic Profile Details */}
        {isAuthenticated && (
          <div className="p-5 rounded-2xl bg-cream-50/80 border border-cream-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>{language === 'hi' ? 'सहेजी गई जनसांख्यिकीय प्रोफ़ाइल' : 'Saved Demographic Profile'}</span>
              </span>
              {profileLoading && <Loader2 className="w-3.5 h-3.5 text-saffron-600 animate-spin" />}
            </div>

            {savedProfile ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldState')}</span>
                  <span className="font-bold text-charcoal-900">{getStateDisplayName(savedProfile.state, language)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldAge')}</span>
                  <span className="font-bold text-charcoal-900">{savedProfile.age} {language === 'hi' ? 'वर्ष' : 'Yrs'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldCaste')}</span>
                  <span className="font-bold text-charcoal-900">{savedProfile.caste || 'General'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldIncome')}</span>
                  <span className="font-bold text-forest-700">₹{savedProfile.income?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldResidence')}</span>
                  <span className="font-bold text-charcoal-900">{savedProfile.residence || 'Rural'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">{t('fieldLifeStage')}</span>
                  <span className="font-bold text-saffron-800 capitalize">{savedProfile.life_stage || 'All'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-charcoal-500">
                {language === 'hi' 
                  ? 'कोई जनसांख्यिकीय प्रोफ़ाइल सहेजी नहीं गई है। योजना खोजक के माध्यम से अपनी जानकारी भरें।' 
                  : 'No demographic profile saved yet. Complete the eligibility wizard to save your preferences.'}
              </p>
            )}
          </div>
        )}

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
              onClick={handleClearBookmarks}
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
