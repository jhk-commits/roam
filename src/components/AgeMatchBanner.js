/**
 * AgeMatchBanner — shows whether an activity is age-appropriate for the user's kids.
 * Displays green checkmarks for matches and yellow warnings for mismatches.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import colors from '../theme/colors';

export default function AgeMatchBanner({ ageRange }) {
  const { kids } = useProfile();

  if (kids.length === 0) return null;

  // If activity has no age range, it's suitable for all ages
  if (!ageRange) {
    return (
      <View style={[styles.container, styles.matchContainer]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        <Text style={[styles.text, styles.matchText]}>
          Great for all ages
        </Text>
      </View>
    );
  }

  const matching = [];
  const notMatching = [];
  const seen = new Set();

  kids.forEach((kid) => {
    // Deduplicate kids with the same name and age
    const key = `${kid.name}-${kid.age}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (kid.age >= ageRange.min && kid.age <= ageRange.max) {
      matching.push(kid);
    } else {
      notMatching.push(kid);
    }
  });

  // Format names naturally: "Emma (3)", "Emma (3) and Liam (5)", "Emma (3), Liam (5), and Noah (7)"
  const formatNames = (list) => {
    const names = list.map((k) => `${k.name} (${k.age})`);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  };

  // All kids match
  if (notMatching.length === 0) {
    return (
      <View style={[styles.container, styles.matchContainer]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        <Text style={[styles.text, styles.matchText]}>
          Great for {formatNames(matching)}
        </Text>
      </View>
    );
  }

  // No kids match
  if (matching.length === 0) {
    return (
      <View style={[styles.container, styles.warningContainer]}>
        <Ionicons name="alert-circle" size={18} color={colors.warning} />
        <Text style={[styles.text, styles.warningText]}>
          Best for ages {ageRange.min}–{ageRange.max}. May not be ideal for your kids.
        </Text>
      </View>
    );
  }

  // Some match, some don't
  return (
    <View style={[styles.container, styles.matchContainer]}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={[styles.text, styles.matchText]}>
        Great for {formatNames(matching)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  matchContainer: {
    backgroundColor: '#F0FDF4',
  },
  warningContainer: {
    backgroundColor: '#FFFBEB',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  matchText: {
    color: '#166534',
  },
  warningText: {
    color: '#92400E',
  },
});
