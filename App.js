/**
 * App.js — Entry point for the Roam app.
 * Handles onboarding flow, context providers, and navigation setup.
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { BookmarkProvider } from './src/context/BookmarkContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { LiveEventsProvider } from './src/context/LiveEventsContext';
import { ONBOARDING_COMPLETE_KEY } from './src/utils/constants';
import colors from './src/theme/colors';

// Suppress non-critical warnings in Expo Go
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding has been completed
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setShowOnboarding(value !== 'true');
      } catch {
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    }
    checkOnboarding();
  }, []);

  // Show loading spinner while checking AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ProfileProvider>
          <BookmarkProvider>
            <LiveEventsProvider>
              <StatusBar style="dark" />
              {showOnboarding ? (
                <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
              ) : (
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              )}
            </LiveEventsProvider>
          </BookmarkProvider>
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
