import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Wizard: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personaParam = searchParams.get('persona');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-saffron-100 shadow-card text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-saffron-50 text-saffron-600 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          {language === 'hi' ? 'पात्रता खोज विज़ार्ड' : 'Scheme Eligibility Wizard'}
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-xl mx-auto">
          {language === 'hi'
            ? 'अपनी आयु, राज्य, श्रेणी और आय दर्ज करें ताकि 9-नियम इंजन आपकी पात्र योजनाओं का चयन कर सके।'
            : 'Enter your demographic details to discover high-priority schemes evaluated by the 9-rule match engine.'}
        </p>

        {personaParam && (
          <div className="p-4 rounded-xl bg-saffron-50 border border-saffron-200 text-xs sm:text-sm text-saffron-900 font-medium">
            {language === 'hi' ? `डेमो प्रोफाइल चयनित: ${personaParam}` : `Selected Demo Persona: ${personaParam}`}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={() => navigate('/results')}
            className="px-6 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-semibold flex items-center gap-2 mx-auto shadow-md"
          >
            <span>{language === 'hi' ? 'परिणाम देखें' : 'View Matching Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
