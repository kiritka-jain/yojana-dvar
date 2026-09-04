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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    setBookmarked(isLocalBookmarked(scheme.scheme_id));
  }, [scheme.scheme_id]);

  const handleCardNavigate = () => {
    navigate(`/schemes/${scheme.scheme_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardNavigate();
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent | React.KeyboardEvent) => {
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
      role="article"
      tabIndex={0}
      onClick={handleCardNavigate}
      onKeyDown={handleKeyDown}
      aria-label={`${scheme.name} - ${scheme.ministry}`}
      className="cursor-pointer rounded-3xl border border-cream-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-saffron-300 hover:-translate-y-1 focus:outline-none focus:ring-3 focus:ring-saffron-400 transition-all duration-200 flex flex-col justify-between group relative"
    >
      <div>
        {/* ========================================================================= */}
        {/* ELEMENT 1 & 2: Top Row (Binary Eligibility Badge + Scope Pill + Bookmark)  */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Element 2: Binary Eligibility Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{t('badgeEligible')}</span>
            </span>

            {/* Scope Badge (Central vs State) */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cream-100 text-charcoal-700 border border-cream-200">
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

        {/* ========================================================================= */}
        {/* ELEMENT 1: Scheme Title & Ministry                                        */}
        {/* ========================================================================= */}
        <div className="space-y-1 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug line-clamp-2">
            {scheme.name}
          </h3>

          <p className="text-xs text-charcoal-500 flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-saffron-600" />
            <span className="line-clamp-1">{scheme.ministry}</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* ELEMENT 3: Benefit Highlight Box (High Contrast)                          */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200 mb-4 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Gift className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-extrabold text-forest-900 block mb-0.5 uppercase tracking-wider">
                {t('cardKeyBenefits')}
              </span>
              <p className="text-xs sm:text-sm font-medium text-forest-950 leading-relaxed line-clamp-3">
                {scheme.benefits}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ELEMENT 4: Primary Action CTA Button (Solid Saffron, 48px+ Touch Target)  */}
      {/* ========================================================================= */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardNavigate();
          }}
          className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-saffron-500 hover:bg-saffron-600 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-md"
        >
          <span>{t('cardViewDetails')}</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default SchemeCard;
