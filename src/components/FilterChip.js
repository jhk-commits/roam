/**
 * FilterChip — an individual tappable filter chip.
 * Active chips are filled blue with white text; inactive chips are light gray.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function FilterChip({ label, isActive, onPress, color }) {
  const activeColor = color || colors.filterActive;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: activeColor }
          : { backgroundColor: colors.filterInactive },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isActive ? { color: colors.white } : { color: colors.filterTextInactive },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
