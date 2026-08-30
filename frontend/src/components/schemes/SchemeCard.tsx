import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  onBookmarkChange?: (schemeId: string, isSaved: boolean, schemeName: string) => void;
}

// Helper to safely parse life stage tags from various formats (JSON string, CSV, array)
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
        // Fallback to regex or comma split
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
  const score = scheme.match_score ?? 80;

  // Dynamic score pill styling
  const scoreBadgeClasses = score >= 85 
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200' 
    : score >= 70 
    ? 'bg-saffron-50 text-saffron-800 border-saffron-300 ring-1 ring-saffron-200' 
    : 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200';

  // Parse Life Stage Tags
  const lifeStageTags = useMemo(() => {
    return parseLifeStageTags(scheme.life_stage_tags);
  }, [scheme.life_stage_tags]);

  // Format life stage tag label
  const getTagDisplay = (tag: string) => {
    const lower = tag.toLowerCase().trim();
    if (lower === 'student') return { label: language === 'hi' ? 'छात्रा / शिक्षा' : 'Student', icon: '🎓' };
    if (lower === 'maternal') return { label: language === 'hi' ? 'मातृत्व कल्याण' : 'Maternal Care', icon: '🤱' };
    if (lower === 'entrepreneur') return { label: language === 'hi' ? 'महिला उद्यमी' : 'Entrepreneur', icon: '💼' };
    if (lower === 'senior') return { label: language === 'hi' ? 'वरिष्ठ नागरिक' : 'Senior Citizen', icon: '👵' };
    if (lower === 'single_girl_child') return { label: language === 'hi' ? 'एकल बालिका' : 'Single Girl Child', icon: '👧' };
    if (lower === 'higher_education') return { label: language === 'hi' ? 'उच्च शिक्षा' : 'Higher Education', icon: '📚' };
    return { label: tag.replace(/_/g, ' '), icon: '🏷️' };
  };

  return (
    <div 
      onClick={() => navigate(`/schemes/${scheme.scheme_id}`)}
      className="cursor-pointer rounded-3xl border border-cream-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-saffron-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group relative"
    >
      <div>
        {/* Card Top Row: Match Score %, Scope Badge, Category, Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Match Score Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${scoreBadgeClasses}`}>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>{score}% {t('cardMatchScore')}</span>
            </span>

            {/* Scope Badge (Central vs State) */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cream-200 text-charcoal-700">
              {isCentral ? t('tagCentral') : `${scheme.state} ${t('tagState')}`}
            </span>

            {/* Category Tag */}
            {scheme.category && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                {scheme.category}
              </span>
            )}
          </div>

          {/* Quick Bookmark Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            aria-pressed={bookmarked}
            title={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
            className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
              bookmarked 
                ? 'bg-saffron-100 text-saffron-700 border border-saffron-300 scale-105 shadow-xs' 
                : 'text-charcoal-400 hover:text-saffron-600 hover:bg-cream-100 border border-transparent'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
          </button>
        </div>

        {/* Scheme Title */}
        <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug mb-1.5 line-clamp-2">
          {scheme.name}
        </h3>

        {/* Ministry / Department Badge */}
        <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-saffron-600" />
          <span className="line-clamp-1 font-medium">{scheme.ministry}</span>
        </p>

        {/* Life Stage Tags Row */}
        {lifeStageTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {lifeStageTags.slice(0, 3).map((tag, idx) => {
              const { label, icon } = getTagDisplay(tag);
              return (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-saffron-50 text-saffron-900 border border-saffron-200/70"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Benefits Highlight Box */}
        <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 mb-4">
          <div className="flex items-start gap-2.5">
            <Gift className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-forest-900 block mb-0.5 uppercase tracking-wide">
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
                  <span className="leading-snug line-clamp-2">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="pt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-2"
      >
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
              title={t('cardApplyOfficial')}
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
