/**
 * FilterBar — horizontal scrollable row of filter chips.
 * Includes "When" filters, category filters, age filter, and a free toggle.
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterChip from './FilterChip';
import { WHEN_FILTERS, CATEGORIES } from '../utils/constants';
import colors from '../theme/colors';
import { useProfile } from '../context/ProfileContext';

export default function FilterBar({ filters, onFilterChange }) {
  const { kids } = useProfile();

  const hasActiveFilters =
    filters.when ||
    filters.categories.length > 0 ||
    filters.age !== null ||
    filters.freeOnly;

  // Toggle a "when" filter (only one active at a time)
  const handleWhenPress = (key) => {
    onFilterChange({
      ...filters,
      when: filters.when === key ? null : key,
    });
  };

  // Toggle a category filter (multiple can be active)
  const handleCategoryPress = (key) => {
    const current = filters.categories;
    const updated = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    onFilterChange({ ...filters, categories: updated });
  };

  // Toggle age filter
  const handleAgePress = (age) => {
    onFilterChange({
      ...filters,
      age: filters.age === age ? null : age,
    });
  };

  // Toggle free filter
  const handleFreePress = () => {
    onFilterChange({ ...filters, freeOnly: !filters.freeOnly });
  };

  // Clear all filters
  const handleClear = () => {
    onFilterChange({ when: null, categories: [], age: null, freeOnly: false });
  };

  // Build unique ages from kid profiles
  const kidAges = [...new Set(kids.map((k) => k.age))].sort((a, b) => a - b);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* When filters */}
        {WHEN_FILTERS.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            isActive={filters.when === filter.key}
            onPress={() => handleWhenPress(filter.key)}
          />
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Category filters */}
        {Object.values(CATEGORIES).map((cat) => (
          <FilterChip
            key={cat.key}
            label={cat.shortLabel}
            isActive={filters.categories.includes(cat.key)}
            onPress={() => handleCategoryPress(cat.key)}
            color={cat.color}
          />
        ))}

        {/* Divider */}
        {kidAges.length > 0 && <View style={styles.divider} />}

        {/* Age filters from kid profiles */}
        {kidAges.map((age) => (
          <FilterChip
            key={`age-${age}`}
            label={`Age ${age}`}
            isActive={filters.age === age}
            onPress={() => handleAgePress(age)}
          />
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Free toggle */}
        <FilterChip
          label="Free"
          isActive={filters.freeOnly}
          onPress={handleFreePress}
        />

        {/* Clear button */}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
