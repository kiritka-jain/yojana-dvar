import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const Results: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/wizard" className="inline-flex items-center gap-1.5 text-sm text-saffron-700 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {language === 'hi' ? 'पुनः खोजें' : 'Back to Wizard'}
        </Link>
        <span className="text-xs font-semibold px-3 py-1 bg-forest-100 text-forest-800 rounded-full">
          {language === 'hi' ? '3 योजनाएं पात्र' : '3 Matching Schemes Found'}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-saffron-100 shadow-card space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900">
          {language === 'hi' ? 'पात्र योजना परिणाम' : 'Your Eligible Welfare Schemes'}
        </h1>
        <p className="text-sm text-charcoal-600">
          {language === 'hi'
            ? 'आपकी प्रोफ़ाइल के आधार पर शीर्ष कल्याणकारी योजनाएं नीचे दी गई हैं।'
            : 'Top prioritized government schemes matched with your demographic profile.'}
        </p>
        <div className="pt-4">
          <Link
            to="/schemes/pmmvy-central"
            className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-medium text-sm inline-flex items-center gap-2"
          >
            {language === 'hi' ? 'योजना विवरण देखें (PMMVY)' : 'View Scheme Detail (PMMVY)'}
          </Link>
        </div>
      </div>
    </div>
  );
};
