import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Bookmarks: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-saffron-100 shadow-card text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-saffron-50 text-saffron-600 mx-auto flex items-center justify-center">
          <Bookmark className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          {language === 'hi' ? 'सहेजी गई योजनाएं (Bookmarks)' : 'My Saved Bookmarks'}
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-md mx-auto">
          {language === 'hi'
            ? 'अपनी पसंदीदा योजनाओं को एक ही स्थान पर सुरक्षित रखें और बाद में कभी भी देखें।'
            : 'Access your shortlisted welfare schemes, required document checklists, and application links.'}
        </p>
        <div>
          <Link
            to="/wizard"
            className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-medium text-sm inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {language === 'hi' ? 'योजनाएं खोजें' : 'Find Schemes'}
          </Link>
        </div>
      </div>
    </div>
  );
};
