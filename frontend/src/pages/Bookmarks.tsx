import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowRight, 
  Trash2, 
  X, 
  Loader2
} from 'lucide-react';
import { getLocalizedSchemeField } from '../i18n/schemeTranslations';

export const Bookmarks: React.FC = () => {
  const { t, language } = useLanguage();
  const { bookmarks, isLoading: loading, removeBookmark, bookmarkCount } = useBookmarks();

  // Local UI State for Search, Filter, and Toast
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Remove a bookmark
  const handleRemoveBookmark = async (schemeId: string, schemeName?: string) => {
    await removeBookmark(schemeId);
    const nameStr = schemeName ? `"${schemeName.substring(0, 25)}..." ` : '';
    setToastMessage(`${nameStr}${t('toastBookmarkRemoved')}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Extract unique categories from current bookmarks
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Filtered bookmarks list with bilingual search matching
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const localizedName = getLocalizedSchemeField(b, 'name', language).toLowerCase();
        const localizedBenefits = getLocalizedSchemeField(b, 'benefits', language).toLowerCase();
        const localizedMinistry = getLocalizedSchemeField(b, 'ministry', language).toLowerCase();
        const rawName = (b.name || '').toLowerCase();
        const rawBenefits = (b.benefits || '').toLowerCase();
        const rawMinistry = (b.ministry || '').toLowerCase();

        const matches = 
          rawName.includes(q) ||
          localizedName.includes(q) ||
          rawBenefits.includes(q) ||
          localizedBenefits.includes(q) ||
          rawMinistry.includes(q) ||
          localizedMinistry.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bookmarks, selectedCategory, searchQuery, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          role="status"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-charcoal-900 text-white shadow-2xl flex items-center gap-3 border border-saffron-500/40 animate-slideUp max-w-sm"
        >
          <BookmarkCheck className="w-5 h-5 text-saffron-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-charcoal-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Bookmarks Dashboard */}
      <div className="space-y-8 animate-fadeIn">
        
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-saffron-600 fill-saffron-500" />
              <span>{t('bookmarksTitle')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600">
              {t('bookmarksSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-saffron-50 border border-saffron-200 text-center">
              <span className="block text-xl font-black text-saffron-900">
                {bookmarkCount}
              </span>
              <span className="text-[11px] font-semibold text-saffron-700 uppercase tracking-wide">
                {t('bookmarksCountBadge')}
              </span>
            </div>
          </div>
        </div>

        {/* Bookmarks Filter & Search Toolbar */}
        {bookmarks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('bookmarksSearchPlaceholder')}
                className="w-full pl-10 pr-8 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-medium"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <span className="text-xs font-semibold text-charcoal-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-saffron-600" />
                  <span>{t('bookmarksCategoryLabel')}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-charcoal-800 text-white font-bold'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                  }`}
                >
                  {t('bookmarksAllChip')} ({bookmarks.length})
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-charcoal-800 text-white font-bold'
                        : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Bookmarked Schemes Grid / Empty State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-saffron-600 animate-spin mx-auto" />
            <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
              {t('bookmarksLoading')}
            </p>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-charcoal-500 font-medium">
              <span>
                {language === 'hi'
                  ? `${filteredBookmarks.length} ${t('bookmarksShowingCount')} प्रदर्शित`
                  : `Showing ${filteredBookmarks.length} ${t('bookmarksShowingCount')}${filteredBookmarks.length > 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((scheme) => {
                const localizedName = getLocalizedSchemeField(scheme, 'name', language);
                return (
                  <div key={scheme.scheme_id} className="relative group">
                    <SchemeCard 
                      scheme={scheme} 
                      onBookmarkChange={(_id, isSaved, sName) => {
                        if (!isSaved) {
                          handleRemoveBookmark(scheme.scheme_id, sName || localizedName);
                        }
                      }}
                    />

                    {/* Quick Remove Action Pill */}
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(scheme.scheme_id, localizedName)}
                      className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white/90 hover:bg-red-50 text-charcoal-500 hover:text-red-600 border border-cream-300 shadow-sm text-xs flex items-center gap-1 z-10"
                      title={t('bookmarksRemoveBtn')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-cream-300 shadow-card text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-saffron-50 border border-saffron-200 text-saffron-600 mx-auto flex items-center justify-center shadow-xs">
              <Bookmark className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-charcoal-900">
                {t('bookmarksEmptyTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-md mx-auto">
                {t('bookmarksEmptyDesc')}
              </p>
            </div>
            <div>
              <Link
                to="/find"
                className="px-6 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('bookmarksExploreBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Bookmarks;
