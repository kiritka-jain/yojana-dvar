import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Sparkles, ExternalLink, Bookmark } from 'lucide-react';

export const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-saffron-700 font-medium hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        {language === 'hi' ? 'परिणामों पर लौटें' : 'Back to Results'}
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-saffron-100 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-300 pb-6">
          <div>
            <span className="text-xs font-semibold px-3 py-1 bg-saffron-100 text-saffron-800 rounded-full">
              {language === 'hi' ? 'केंद्रीय योजना' : 'Central Scheme'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mt-2">
              Pradhan Mantri Matru Vandana Yojana (PMMVY)
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Ministry of Women and Child Development • ID: {id || 'pmmvy-central'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl border border-saffron-300 text-saffron-700 hover:bg-saffron-50">
              <Bookmark className="w-5 h-5" />
            </button>
            <a
              href="https://pmmvy.wcd.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-medium text-sm flex items-center gap-2"
            >
              <span>{language === 'hi' ? 'आवेदन पोर्टल' : 'Official Portal'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* AI Explanation Banner */}
        <div className="p-5 rounded-2xl bg-forest-50/70 border border-forest-200 space-y-2">
          <div className="flex items-center gap-2 text-forest-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-forest-600" />
            <span>{language === 'hi' ? 'एआई स्पष्टीकरण (Gemini AI)' : 'AI Plain-Language Explanation'}</span>
          </div>
          <p className="text-sm text-forest-950 leading-relaxed">
            {language === 'hi'
              ? 'आप गर्भवती माता हैं और ग्रामीण क्षेत्र से हैं, इसलिए आपको ₹5,000 की वित्तीय सहायता सीधे बैंक खाते में दो किस्तों में मिलेगी।'
              : 'You qualify for direct financial assistance of Rs 5,000 directly transferred to your bank account in 2 installments for nutritional support.'}
          </p>
        </div>
      </div>
    </div>
  );
};
