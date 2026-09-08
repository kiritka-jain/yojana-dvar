import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Sparkles, HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8 animate-fadeIn">
      {/* 404 Visual Icon Box */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-saffron-100 to-amber-100 border-2 border-saffron-300 text-saffron-700 flex items-center justify-center shadow-lg">
          <HelpCircle className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
        </div>
        <span className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-saffron-600 text-white font-black text-xs sm:text-sm shadow-md">
          404
        </span>
      </div>

      {/* Message */}
      <div className="space-y-3 max-w-lg mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          {language === 'hi' ? 'यह पृष्ठ उपलब्ध नहीं है' : 'Page Not Found'}
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed font-medium">
          {language === 'hi'
            ? 'क्षमा करें, आपके द्वारा खोजा गया वेब पृष्ठ स्थानांतरित या हटा दिया गया है। आप नीचे दिए गए बटनों द्वारा मुख्य पृष्ठ पर लौट सकते हैं।'
            : 'Sorry, the page you are looking for does not exist or has been moved. You can navigate back to discover government schemes below.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-saffron-500 hover:bg-saffron-600 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Back to Home'}</span>
        </Link>

        <Link
          to="/find"
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl border-2 border-cream-300 bg-white hover:bg-cream-50 hover:border-saffron-400 active:scale-98 text-charcoal-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-saffron-600" />
          <span>{language === 'hi' ? 'पात्र योजनाएं खोजें' : 'Find Eligible Schemes'}</span>
        </Link>
      </div>

      {/* Helpful Links Grid */}
      <div className="pt-8 border-t border-cream-300 max-w-md mx-auto">
        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block mb-3">
          {language === 'hi' ? 'त्वरित लिंक' : 'Quick Navigation'}
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-charcoal-700">
          <Link to="/results" className="p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 hover:text-saffron-800 transition-colors">
            📋 {language === 'hi' ? 'सभी योजनाएं' : 'All Schemes'}
          </Link>
          <Link to="/bookmarks" className="p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 hover:text-saffron-800 transition-colors">
            🔖 {language === 'hi' ? 'सहेजी गई सूची' : 'Saved Bookmarks'}
          </Link>
          <Link to="/profile" className="p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 hover:text-saffron-800 transition-colors">
            👤 {language === 'hi' ? 'नागरिक सत्र' : 'Citizen Profile'}
          </Link>
          <Link to="/about" className="p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 hover:text-saffron-800 transition-colors">
            🏛️ {language === 'hi' ? 'हमारे बारे में' : 'About Platform'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
