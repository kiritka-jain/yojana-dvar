import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchUserBookmarks, 
  addUserBookmark, 
  removeUserBookmark, 
  getSchemeById,
  getLocalBookmarks,
} from '../services/api';
import type { SchemeMatchResult } from '../services/api';

const BOOKMARKS_STORAGE_KEY = 'yojana_saved_bookmarks';

interface BookmarkContextType {
  bookmarkedIds: Set<string>;
  bookmarks: SchemeMatchResult[];
  bookmarkCount: number;
  isLoading: boolean;
  isBookmarked: (schemeId: string) => boolean;
  toggleBookmark: (scheme: SchemeMatchResult | string) => Promise<boolean>;
  addBookmark: (scheme: SchemeMatchResult | string) => Promise<void>;
  removeBookmark: (schemeId: string) => Promise<void>;
  clearBookmarks: () => Promise<void>;
  refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set(getLocalBookmarks()));
  const [bookmarks, setBookmarks] = useState<SchemeMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state from storage and remote API
  const refreshBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const localIds = getLocalBookmarks();
      let remoteSchemes: SchemeMatchResult[] = [];

      if (isAuthenticated && token) {
        try {
          remoteSchemes = await fetchUserBookmarks(token);
        } catch (err) {
          console.warn('Could not fetch remote bookmarks, fallback to local:', err);
        }
      }

      const remoteIds = remoteSchemes.map((s) => s.scheme_id);
      const mergedIds = Array.from(new Set([...localIds, ...remoteIds]));

      // Update local storage with merged set if authenticated
      if (isAuthenticated && mergedIds.length !== localIds.length) {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(mergedIds));
      }

      setBookmarkedIds(new Set(mergedIds));

      if (mergedIds.length === 0) {
        setBookmarks([]);
        setIsLoading(false);
        return;
      }

      const remoteMap = new Map<string, SchemeMatchResult>();
      remoteSchemes.forEach((s) => remoteMap.set(s.scheme_id, s));

      // Resolve scheme details for all IDs
      const promises = mergedIds.map(async (id) => {
        if (remoteMap.has(id)) {
          return remoteMap.get(id)!;
        }
        try {
          return await getSchemeById(id);
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validSchemes = results.filter((s): s is SchemeMatchResult => s !== null);
      setBookmarks(validSchemes);
    } catch (err) {
      console.error('Error refreshing bookmarks in context:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Initial load and listen for external events
  useEffect(() => {
    refreshBookmarks();

    const handleUpdate = () => {
      const currentLocal = getLocalBookmarks();
      setBookmarkedIds(new Set(currentLocal));
    };

    window.addEventListener('yojana_bookmarks_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('yojana_bookmarks_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshBookmarks]);

  const isBookmarked = useCallback((schemeId: string): boolean => {
    return bookmarkedIds.has(schemeId);
  }, [bookmarkedIds]);

  const addBookmark = useCallback(async (scheme: SchemeMatchResult | string) => {
    const schemeId = typeof scheme === 'string' ? scheme : scheme.scheme_id;
    if (bookmarkedIds.has(schemeId)) return;

    // Optimistic local update
    const newSet = new Set(bookmarkedIds);
    newSet.add(schemeId);
    setBookmarkedIds(newSet);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(newSet)));

    if (typeof scheme !== 'string') {
      setBookmarks((prev) => (prev.some((s) => s.scheme_id === schemeId) ? prev : [scheme, ...prev]));
    }

    window.dispatchEvent(new Event('yojana_bookmarks_updated'));

    // Remote sync
    if (isAuthenticated && token) {
      try {
        await addUserBookmark(schemeId, token);
      } catch (err) {
        console.warn('Failed to add remote bookmark:', err);
      }
    }
  }, [bookmarkedIds, isAuthenticated, token]);

  const removeBookmark = useCallback(async (schemeId: string) => {
    // Optimistic local update
    const newSet = new Set(bookmarkedIds);
    newSet.delete(schemeId);
    setBookmarkedIds(newSet);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
    setBookmarks((prev) => prev.filter((s) => s.scheme_id !== schemeId));

    window.dispatchEvent(new Event('yojana_bookmarks_updated'));

    // Remote sync
    if (isAuthenticated && token) {
      try {
        await removeUserBookmark(schemeId, token);
      } catch (err) {
        console.warn('Failed to remove remote bookmark:', err);
      }
    }
  }, [bookmarkedIds, isAuthenticated, token]);

  const toggleBookmark = useCallback(async (scheme: SchemeMatchResult | string): Promise<boolean> => {
    const schemeId = typeof scheme === 'string' ? scheme : scheme.scheme_id;
    const isCurrentlySaved = bookmarkedIds.has(schemeId);

    if (isCurrentlySaved) {
      await removeBookmark(schemeId);
      return false;
    } else {
      await addBookmark(scheme);
      return true;
    }
  }, [bookmarkedIds, addBookmark, removeBookmark]);

  const clearBookmarks = useCallback(async () => {
    const oldIds = Array.from(bookmarkedIds);
    setBookmarkedIds(new Set());
    setBookmarks([]);
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
    window.dispatchEvent(new Event('yojana_bookmarks_updated'));

    if (isAuthenticated && token) {
      try {
        await Promise.all(oldIds.map((id) => removeUserBookmark(id, token)));
      } catch (err) {
        console.warn('Failed to clear remote bookmarks:', err);
      }
    }
  }, [bookmarkedIds, isAuthenticated, token]);

  const value = useMemo(() => ({
    bookmarkedIds,
    bookmarks,
    bookmarkCount: bookmarkedIds.size,
    isLoading,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    clearBookmarks,
    refreshBookmarks,
  }), [bookmarkedIds, bookmarks, isLoading, isBookmarked, toggleBookmark, addBookmark, removeBookmark, clearBookmarks, refreshBookmarks]);

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export default BookmarkContext;
