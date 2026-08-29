import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Bookmark, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  Check, 
  Building2,
  Gift
} from 'lucide-react';
import type { SchemeMatchResult } from '../../services/api';
import { isLocalBookmarked, toggleLocalBookmark } from '../../services/api';

interface SchemeCardProps {
  scheme: SchemeMatchResult;
  onBookmarkChange?: (schemeId: string, isSaved: boolean) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onBookmarkChange }) => {
  const { t } = useLanguage();
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
      onBookmarkChange(scheme.scheme_id, newState);
    }
  };

  const isCentral = !scheme.state || scheme.state.toLowerCase() === 'all' || scheme.state.toLowerCase() === 'all india';
  const score = scheme.match_score ?? 80;

  // Dynamic score pill styling
  const scoreBadgeClasses = score >= 80 
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
    : score >= 60 
    ? 'bg-saffron-100 text-saffron-800 border-saffron-300' 
    : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="rounded-3xl border border-cream-300 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group">
      
      <div>
        {/* Card Header: Score, Scope, Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Match Score Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${scoreBadgeClasses}`}>
              <Sparkles className="w-3 h-3 mr-1" />
              {score}% {t('cardMatchScore')}
            </span>

            {/* Scope Badge (Central vs State) */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-200 text-charcoal-700">
              {isCentral ? t('tagCentral') : `${scheme.state} ${t('tagState')}`}
            </span>

            {/* Category Tag */}
            {scheme.category && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                {scheme.category}
              </span>
            )}
          </div>

          {/* Bookmark Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            title={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            className={`p-2 rounded-xl transition-all duration-200 ${
              bookmarked 
                ? 'bg-saffron-50 text-saffron-600 border border-saffron-300' 
                : 'text-charcoal-400 hover:text-saffron-600 hover:bg-cream-100 border border-transparent'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
          </button>
        </div>

        {/* Scheme Title */}
        <Link to={`/schemes/${scheme.scheme_id}`}>
          <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug mb-1.5">
            {scheme.name}
          </h3>
        </Link>

        {/* Ministry / Department */}
        <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mb-4">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-charcoal-400" />
          <span className="line-clamp-1">{scheme.ministry}</span>
        </p>

        {/* Benefits Highlight Box */}
        <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 mb-4">
          <div className="flex items-start gap-2.5">
            <Gift className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-forest-900 block mb-0.5">
                {t('cardKeyBenefits')}
              </span>
              <p className="text-xs sm:text-sm text-forest-950 leading-relaxed line-clamp-3">
                {scheme.benefits}
              </p>
            </div>
          </div>
        </div>

        {/* Match Reasons List */}
        {scheme.match_reasons && scheme.match_reasons.length > 0 && (
          <div className="mb-6 space-y-1.5">
            <span className="text-xs font-bold text-charcoal-700 block uppercase tracking-wide">
              {t('cardWhyYouQualify')}
            </span>
            <ul className="space-y-1">
              {scheme.match_reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-charcoal-600">
                  <Check className="w-3.5 h-3.5 text-forest-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* AI Explanation Button */}
          <Link
            to={`/schemes/${scheme.scheme_id}#explain`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-semibold border border-saffron-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            <span>{t('btnExplain')}</span>
          </Link>

          {/* Official Apply Portal */}
          {scheme.apply_url && (
            <a
              href={scheme.apply_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-charcoal-600 hover:text-saffron-700 hover:bg-cream-100 text-xs font-medium transition-colors"
            >
              <span>{t('btnApply')}</span>
              <ExternalLink className="w-3 h-3 text-charcoal-400" />
            </a>
          )}
        </div>

        {/* View Details Link */}
        <Link
          to={`/schemes/${scheme.scheme_id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-saffron-600 hover:text-saffron-800 group/btn"
        >
          <span>{t('cardViewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};
