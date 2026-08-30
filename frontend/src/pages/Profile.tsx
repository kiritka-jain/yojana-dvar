import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { ProfileInput } from '../services/api';
import { 
  User, 
  Shield, 
  CheckCircle2, 
  LogOut, 
  Edit3, 
  Sparkles, 
  Bookmark, 
  ArrowRight 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, token, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileInput | null>(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token).then((res) => {
        if (res) setProfile(res);
      });
    }
  }, [token]);

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
                className="w-16 h-16 rounded-2xl border-2 border-saffron-400 p-0.5 bg-saffron-50" 
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-saffron-100 border border-saffron-300 flex items-center justify-center text-saffron-800">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">
                {currentUser?.displayName || (language === 'hi' ? 'अतिथि नागरिक' : 'Guest Citizen')}
              </h1>
              <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                <span>
                  {isAuthenticated 
                    ? (language === 'hi' ? 'सत्यापित डिजिटल सत्र' : 'Verified Citizen Session')
                    : (language === 'hi' ? 'अतिथि मोड (स्थानीय)' : 'Guest Mode (Local Session)')}
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

        {/* Session Details */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-charcoal-700">
              {language === 'hi' ? 'उपयोगकर्ता पहचान (UID)' : 'User ID (UID)'}
            </span>
            <span className="font-mono text-xs text-charcoal-600 bg-white px-2.5 py-1 rounded border border-cream-300">
              {currentUser?.uid || 'guest-session-local'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-charcoal-700">
              {language === 'hi' ? 'सक्रिय भाषा' : 'Interface Language'}
            </span>
            <span className="font-bold text-xs text-saffron-700 bg-white px-2.5 py-1 rounded border border-cream-300">
              {language === 'hi' ? 'हिंदी (Hindi)' : 'English (EN)'}
            </span>
          </div>

          {currentUser?.email && (
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-charcoal-700">Email</span>
              <span className="text-xs text-charcoal-800 font-semibold bg-white px-2.5 py-1 rounded border border-cream-300">
                {currentUser.email}
              </span>
            </div>
          )}
        </div>

        {/* Saved Profile Summary (if available) */}
        {profile && (
          <div className="p-5 rounded-2xl bg-cream-100/70 border border-saffron-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">
                {language === 'hi' ? 'सहेजी गई जनसांख्यिकी' : 'Saved Demographics'}
              </span>
              <Link
                to="/find"
                state={{ profile }}
                className="text-xs text-saffron-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{language === 'hi' ? 'संपादित करें' : 'Edit'}</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">State</span>
                <span className="font-bold text-charcoal-900">{profile.state}</span>
              </div>
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">Age</span>
                <span className="font-bold text-charcoal-900">{profile.age} Yrs</span>
              </div>
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">Caste</span>
                <span className="font-bold text-charcoal-900">{profile.caste}</span>
              </div>
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">Income</span>
                <span className="font-bold text-forest-700">₹{profile.income.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">Life Stage</span>
                <span className="font-bold text-charcoal-900 capitalize">{profile.life_stage}</span>
              </div>
              <div className="p-2 rounded bg-white border border-cream-200">
                <span className="text-charcoal-400 block text-[10px]">Status</span>
                <span className="font-bold text-charcoal-900">{profile.is_bpl ? 'BPL' : 'Non-BPL'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/bookmarks"
            className="flex-1 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-101 text-center inline-flex items-center justify-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            <span>{language === 'hi' ? 'सहेजी गई योजनाएं देखें' : 'View Saved Bookmarks'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/find"
            className="flex-1 py-3 rounded-xl border border-cream-300 hover:bg-cream-100 text-charcoal-700 font-semibold text-xs sm:text-sm transition-colors text-center inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-saffron-600" />
            <span>{language === 'hi' ? 'योजना खोज फ़ॉर्म' : 'Discovery Wizard'}</span>
          </Link>
        </div>

        {/* Privacy Advisory */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">
            {language === 'hi'
              ? 'आपकी जनसांख्यिकीय जानकारी केवल योजना पात्रता जांच के लिए उपयोग की जाती है और तीसरे पक्ष के साथ साझा नहीं की जाती।'
              : 'Your demographic details are encrypted and solely utilized to evaluate welfare entitlement eligibility.'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default Profile;
