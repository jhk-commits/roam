/**
 * ActivityCard — reusable card for displaying an activity in list views.
 * Shows thumbnail placeholder, name, category, distance, timing, age range, and bookmark.
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import { useBookmarks } from '../context/BookmarkContext';
import { CATEGORIES } from '../utils/constants';
import { formatDistance } from '../utils/distance';
import colors from '../theme/colors';

/**
 * Format an event date for display on the card.
 * Returns something like "Sat, Feb 8 · 10:00 AM – 12:00 PM" or "Open now".
 */
function formatTiming(activity) {
  if (activity.type === 'attraction') {
    if (activity.isOpenNow) {
      return { text: 'Open now', isOpen: true };
    }
    return { text: activity.hours || 'Hours vary', isOpen: false };
  }

  if (!activity.eventDate) return { text: '', isOpen: false };

  const date = new Date(activity.eventDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();

  const startTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  let text = `${dayName}, ${monthName} ${dayNum} · ${startTime}`;

  if (activity.eventEndDate) {
    const endDate = new Date(activity.eventEndDate);
    const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    text = `${dayName}, ${monthName} ${dayNum} · ${startTime} – ${endTime}`;
  }

  if (activity.isRecurring && activity.recurringDescription) {
    text = `${activity.recurringDescription} · ${startTime}`;
  }

  return { text, isOpen: false };
}

export default function ActivityCard({ activity, distance, onPress }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(activity.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categoryConfig = CATEGORIES[activity.category];
  const timing = formatTiming(activity);

  // Animate the bookmark heart on toggle
  const handleBookmarkPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    toggleBookmark(activity.id);
  };

  // Format age range display
  const ageText = activity.ageRange
    ? `Ages ${activity.ageRange.min}–${activity.ageRange.max}`
    : 'All ages';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Color accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: activity.imageColor || '#E5E7EB' }]} />

      {/* Card content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <CategoryBadge category={activity.category} />
          <View style={styles.topRight}>
            {distance !== undefined && (
              <Text style={styles.distance}>{formatDistance(distance)}</Text>
            )}
            <TouchableOpacity
              onPress={handleBookmarkPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={bookmarked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={bookmarked ? colors.bookmarkActive : colors.border}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {activity.name}
        </Text>

        <Text style={styles.timing} numberOfLines={1}>
          {timing.isOpen && (
            <Text style={styles.openNow}>Open now · </Text>
          )}
          {!timing.isOpen && timing.text}
          {timing.isOpen && activity.hours}
        </Text>

        <View style={styles.badges}>
          <Text style={styles.badgeText}>{ageText}</Text>
          {activity.isIndoor && (
            <View style={styles.badge}>
              <Ionicons name="home-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.badgeText}> Indoor</Text>
            </View>
          )}
          {activity.isOutdoor && (
            <View style={styles.badge}>
              <Ionicons name="leaf-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.badgeText}> Outdoor</Text>
            </View>
          )}
          {activity.isFree && (
            <View style={[styles.badge, styles.freeBadge]}>
              <Text style={styles.freeText}>Free</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accentStrip: {
    width: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distance: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timing: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  openNow: {
    color: colors.success,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  freeBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});
