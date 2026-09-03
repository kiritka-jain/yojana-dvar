import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Bookmark, 
  CheckCircle2, 
  ArrowRight, 
  Building2,
  Gift
} from 'lucide-react';
import type { SchemeMatchResult } from '../../services/api';
import { isLocalBookmarked, toggleLocalBookmark } from '../../services/api';

interface SchemeCardProps {
  scheme: SchemeMatchResult;
  onBookmarkChange?: (schemeId: string, isSaved: boolean, schemeName: string) => void;
}

export function parseLifeStageTags(rawTags: any): string[] {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === 'string') {
    const trimmed = rawTags.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim());
      } catch {
        // Fallback
      }
    }
    return trimmed.split(',').map((t) => t.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, '')).filter(Boolean);
  }
  return [];
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onBookmarkChange }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    setBookmarked(isLocalBookmarked(scheme.scheme_id));
  }, [scheme.scheme_id]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleLocalBookmark(scheme.scheme_id);
    setBookmarked(newState);
    if (onBookmarkChange) {
      onBookmarkChange(scheme.scheme_id, newState, scheme.name);
    }
  };

  const isCentral = !scheme.state || scheme.state.toLowerCase() === 'all' || scheme.state.toLowerCase() === 'all india';

  return (
    <div 
      onClick={() => navigate(`/schemes/${scheme.scheme_id}`)}
      className="cursor-pointer rounded-3xl border border-cream-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-saffron-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group relative"
    >
      <div>
        {/* Card Top Row: Clear Eligibility Badge + Scope + Bookmark */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Binary Eligibility Badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? '✓ आप पात्र हैं' : '✓ You Qualify'}</span>
            </span>

            {/* Scope Badge (Central vs State) */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-700 border border-cream-200">
              {isCentral ? t('tagCentral') : `${scheme.state} ${t('tagState')}`}
            </span>
          </div>

          {/* Bookmark Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            title={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
              bookmarked 
                ? 'bg-saffron-100 text-saffron-700 border border-saffron-300 scale-105 shadow-xs' 
                : 'text-charcoal-400 hover:text-saffron-600 hover:bg-cream-100 border border-transparent'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
          </button>
        </div>

        {/* Scheme Title */}
        <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug mb-2 line-clamp-2">
          {scheme.name}
        </h3>

        {/* Ministry / Department */}
        <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mb-4">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-saffron-600" />
          <span className="line-clamp-1 font-medium">{scheme.ministry}</span>
        </p>

        {/* Benefit Highlight Box (High Contrast) */}
        <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-200 mb-4">
          <div className="flex items-start gap-2.5">
            <Gift className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-forest-900 block mb-0.5 uppercase tracking-wide">
                {t('cardKeyBenefits')}
              </span>
              <p className="text-xs sm:text-sm font-medium text-forest-950 leading-relaxed line-clamp-3">
                {scheme.benefits}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate(`/schemes/${scheme.scheme_id}`)}
          className="w-full py-3 px-4 rounded-2xl bg-saffron-50 hover:bg-saffron-500 text-saffron-800 hover:text-white border border-saffron-300 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-2xs"
        >
          <span>{t('cardViewDetails')}</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default SchemeCard;
