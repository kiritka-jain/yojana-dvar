import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { User, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-saffron-100 shadow-card space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 border-b border-cream-300 pb-6">
          <div className="w-16 h-16 rounded-full bg-saffron-100 border-2 border-saffron-500 flex items-center justify-center text-saffron-800 font-bold text-xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              {language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'User Profile'}
            </h1>
            <p className="text-xs text-charcoal-500">
              {language === 'hi' ? 'सत्यापित सत्र • अतिथि मोड' : 'Verified Session • Guest Mode'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 flex items-center justify-between text-sm">
            <span className="font-medium text-charcoal-700">
              {language === 'hi' ? 'उपयोगकर्ता पहचान' : 'User ID'}
            </span>
            <span className="font-mono text-xs text-charcoal-600 bg-white px-2 py-1 rounded border">
              guest-session-local
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 flex items-center justify-between text-sm">
            <span className="font-medium text-charcoal-700">
              {language === 'hi' ? 'प्राथमिक भाषा' : 'Primary Language'}
            </span>
            <span className="font-bold text-xs text-saffron-700 bg-white px-2 py-1 rounded border">
              {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <span>
            {language === 'hi'
              ? 'आपकी जनसांख्यिकीय जानकारी केवल योजना पात्रता जांच के लिए उपयोग की जाती है और तीसरे पक्ष के साथ साझा नहीं की जाती।'
              : 'Your demographic details are encrypted and solely utilized to evaluate welfare entitlement eligibility.'}
          </span>
        </div>
      </div>
    </div>
  );
};
