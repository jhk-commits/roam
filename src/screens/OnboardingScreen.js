/**
 * OnboardingScreen — a 3-step horizontal pager shown on first launch.
 * Step 1: Welcome
 * Step 2: Add kids
 * Step 3: Location permission
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../context/ProfileContext';
import { ONBOARDING_COMPLETE_KEY } from '../utils/constants';
import colors from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }) {
  const flatListRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { addKid } = useProfile();

  // State for the "add kids" form
  const [kidInputs, setKidInputs] = useState([{ name: '', age: '' }]);

  // Navigate to next step
  const goToStep = (step) => {
    flatListRef.current?.scrollToIndex({ index: step, animated: true });
    setCurrentStep(step);
  };

  // Complete onboarding
  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    onComplete();
  };

  // Add kids from the form and proceed
  const handleAddKids = () => {
    kidInputs.forEach((input) => {
      if (input.name.trim() && input.age) {
        addKid(input.name, input.age);
      }
    });
    goToStep(2);
  };

  // Add another kid row to the form
  const addKidRow = () => {
    setKidInputs((prev) => [...prev, { name: '', age: '' }]);
  };

  // Update a kid row
  const updateKidInput = (index, field, value) => {
    setKidInputs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Request location permission
  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        finishOnboarding();
      } else {
        Alert.alert(
          'Location not enabled',
          "That's okay — the app will still work using a default location. You can enable location later in your phone's Settings.",
          [{ text: 'Continue', onPress: finishOnboarding }]
        );
      }
    } catch {
      finishOnboarding();
    }
  };

  // The three onboarding pages
  const pages = [
    // Step 1: Welcome
    {
      key: 'welcome',
      render: () => (
        <View style={styles.page}>
          <View style={styles.iconCircle}>
            <Ionicons name="compass" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>Welcome to Roam</Text>
          <Text style={styles.subtitle}>
            Discover what's nearby for your family
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => goToStep(1)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    // Step 2: Add Kids
    {
      key: 'kids',
      render: () => (
        <KeyboardAvoidingView
          style={styles.page}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.kidsIconCircle}>
            <Ionicons name="people" size={44} color={colors.primary} />
          </View>
          <Text style={styles.title}>Who's coming along?</Text>
          <Text style={styles.note}>
            This helps us show age-appropriate activities
          </Text>

          {kidInputs.map((input, index) => (
            <View key={index} style={styles.kidRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First name"
                placeholderTextColor={colors.textSecondary}
                value={input.name}
                onChangeText={(val) => updateKidInput(index, 'name', val)}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, styles.ageInput]}
                placeholder="Age"
                placeholderTextColor={colors.textSecondary}
                value={input.age}
                onChangeText={(val) => updateKidInput(index, 'age', val.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addKidLink} onPress={addKidRow}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addKidText}>Add another child</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAddKids}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => goToStep(2)}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      ),
    },
    // Step 3: Location
    {
      key: 'location',
      render: () => (
        <View style={styles.page}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>Enable location</Text>
          <Text style={styles.subtitle}>
            Roam uses your location to show what's nearby.{'\n'}Your location is never shared.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLocationPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Enable Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={finishOnboarding}
          >
            <Text style={styles.skipText}>Not now</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }}>{item.render()}</View>
        )}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />

      {/* Page indicator dots */}
      <View style={styles.dots}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentStep === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  kidsIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  note: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
  skipButton: {
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  kidRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 12,
    gap: 12,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameInput: {
    flex: 2,
  },
  ageInput: {
    flex: 1,
    textAlign: 'center',
  },
  addKidLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  addKidText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
