/**
 * MapMarker — custom colored map pin for an activity.
 * Color is determined by the activity's category.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../utils/constants';

export default function MapMarker({ category }) {
  const config = CATEGORIES[category];
  const pinColor = config ? config.color : '#3B82F6';
  const iconName = config ? config.icon : 'location';

  return (
    <View style={styles.container}>
      <View style={[styles.pin, { backgroundColor: pinColor }]}>
        <Ionicons name={iconName} size={16} color="#FFFFFF" />
      </View>
      <View style={[styles.triangle, { borderTopColor: pinColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
