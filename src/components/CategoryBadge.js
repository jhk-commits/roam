/**
 * CategoryBadge — a small colored tag showing an activity's category.
 * Used on activity cards and the detail screen.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../utils/constants';

export default function CategoryBadge({ category, size = 'small' }) {
  const config = CATEGORIES[category];
  if (!config) return null;

  const isLarge = size === 'large';

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '18' }, isLarge && styles.badgeLarge]}>
      <Ionicons
        name={config.icon}
        size={isLarge ? 14 : 11}
        color={config.color}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: config.color }, isLarge && styles.labelLarge]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelLarge: {
    fontSize: 13,
  },
});
