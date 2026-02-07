/**
 * ProfileContext — manages kid profiles and user preferences with AsyncStorage persistence.
 * Kid profiles are used for age-matching on activity cards.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PROFILE_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
  DEFAULT_RADIUS,
} from '../utils/constants';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  // Each kid: { id: string, name: string, age: number }
  const [kids, setKids] = useState([]);
  const [preferences, setPreferences] = useState({
    searchRadius: DEFAULT_RADIUS,
    notifyNewEvents: true,
    notifyWeekendPicks: false,
    notifyReminders: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    async function load() {
      try {
        const [storedKids, storedPrefs] = await Promise.all([
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          AsyncStorage.getItem(PREFERENCES_STORAGE_KEY),
        ]);
        if (storedKids) setKids(JSON.parse(storedKids));
        if (storedPrefs) setPreferences((prev) => ({ ...prev, ...JSON.parse(storedPrefs) }));
      } catch (error) {
        console.warn('Failed to load profile:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  // Persist kids whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(kids)).catch((error) =>
      console.warn('Failed to save kids:', error)
    );
  }, [kids, isLoaded]);

  // Persist preferences whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences)).catch(
      (error) => console.warn('Failed to save preferences:', error)
    );
  }, [preferences, isLoaded]);

  // Add a new kid
  const addKid = useCallback((name, age) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setKids((prev) => [...prev, { id, name: name.trim(), age: parseInt(age, 10) }]);
  }, []);

  // Update an existing kid
  const updateKid = useCallback((id, name, age) => {
    setKids((prev) =>
      prev.map((kid) =>
        kid.id === id ? { ...kid, name: name.trim(), age: parseInt(age, 10) } : kid
      )
    );
  }, []);

  // Remove a kid
  const removeKid = useCallback((id) => {
    setKids((prev) => prev.filter((kid) => kid.id !== id));
  }, []);

  // Update a preference value
  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        kids,
        setKids,
        addKid,
        updateKid,
        removeKid,
        preferences,
        updatePreference,
        isLoaded,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
