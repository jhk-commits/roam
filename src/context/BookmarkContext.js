/**
 * BookmarkContext — global bookmark state with AsyncStorage persistence.
 * Provides bookmark toggling and lookup across the entire app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BOOKMARKS_STORAGE_KEY } from '../utils/constants';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  // Stores an array of bookmarked activity IDs
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from AsyncStorage on mount
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const stored = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (stored) {
          setBookmarkedIds(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to load bookmarks:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadBookmarks();
  }, []);

  // Persist bookmarks whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedIds)).catch(
      (error) => console.warn('Failed to save bookmarks:', error)
    );
  }, [bookmarkedIds, isLoaded]);

  // Toggle a bookmark on/off
  const toggleBookmark = useCallback((activityId) => {
    setBookmarkedIds((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      }
      return [...prev, activityId];
    });
  }, []);

  // Check if an activity is bookmarked
  const isBookmarked = useCallback(
    (activityId) => bookmarkedIds.includes(activityId),
    [bookmarkedIds]
  );

  // Remove a bookmark (same as toggle off, but explicit)
  const removeBookmark = useCallback((activityId) => {
    setBookmarkedIds((prev) => prev.filter((id) => id !== activityId));
  }, []);

  return (
    <BookmarkContext.Provider
      value={{ bookmarkedIds, toggleBookmark, isBookmarked, removeBookmark, isLoaded }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
