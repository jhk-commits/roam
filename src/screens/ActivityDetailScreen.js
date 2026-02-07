/**
 * ActivityDetailScreen — full detail view for a single activity.
 * Shows hero image area, info, age matching, timing, description, and mini map.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryBadge from '../components/CategoryBadge';
import AgeMatchBanner from '../components/AgeMatchBanner';
import { useBookmarks } from '../context/BookmarkContext';
import { CATEGORIES } from '../utils/constants';
import { getDistance, formatDistance } from '../utils/distance';
import { DEFAULT_LOCATION } from '../utils/constants';
import colors from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Format the event date/time for the detail screen.
 */
function formatDetailDate(activity) {
  if (activity.type === 'attraction') return null;
  if (!activity.eventDate) return null;

  const date = new Date(activity.eventDate);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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

  return text;
}

export default function ActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params;
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(activity.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categoryConfig = CATEGORIES[activity.category];

  const distance = getDistance(
    DEFAULT_LOCATION.latitude,
    DEFAULT_LOCATION.longitude,
    activity.coordinates.latitude,
    activity.coordinates.longitude
  );

  const ageText = activity.ageRange
    ? `Ages ${activity.ageRange.min}–${activity.ageRange.max}`
    : 'All ages';

  const priceText = activity.isFree ? 'Free' : activity.price || 'Paid';

  const locationText = activity.isIndoor && activity.isOutdoor
    ? 'Indoor / Outdoor'
    : activity.isIndoor
    ? 'Indoor'
    : 'Outdoor';

  // Bookmark animation
  const handleBookmark = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    toggleBookmark(activity.id);
  };

  const handleGetDirections = () => {
    Alert.alert('Get Directions', 'This would open Apple Maps or Google Maps with directions to this location.');
  };

  const handleShare = () => {
    Alert.alert('Share', 'This would open the share sheet so you can send this activity to a friend.');
  };

  const eventDateText = formatDetailDate(activity);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero area */}
        <View style={[styles.hero, { backgroundColor: activity.imageColor || '#E5E7EB' }]}>
          <Ionicons
            name={categoryConfig ? categoryConfig.icon : 'location'}
            size={64}
            color="rgba(255,255,255,0.4)"
          />

          {/* Overlay buttons */}
          <View style={[styles.heroNav, { paddingTop: 8 }]}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButton} onPress={handleBookmark}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Ionicons
                    name={bookmarked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={bookmarked ? colors.bookmarkActive : colors.white}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <CategoryBadge category={activity.category} size="large" />

          <Text style={styles.title}>{activity.name}</Text>

          {/* Quick info row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{formatDistance(distance)} away</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{ageText}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="wallet-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{priceText}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name={activity.isIndoor ? 'home-outline' : 'leaf-outline'}
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>{locationText}</Text>
            </View>
          </View>

          {/* Age match */}
          <AgeMatchBanner ageRange={activity.ageRange} />

          {/* Timing section */}
          {activity.type === 'event' && eventDateText && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.sectionText}>{eventDateText}</Text>
              </View>
              {activity.isRecurring && activity.recurringDescription && (
                <Text style={styles.recurringText}>
                  Repeats {activity.recurringDescription.toLowerCase()}
                </Text>
              )}
            </View>
          )}

          {activity.type === 'attraction' && activity.hours && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.sectionText}>
                  {activity.isOpenNow ? 'Open today' : 'Hours'}: {activity.hours}
                </Text>
              </View>
              {activity.isOpenNow !== undefined && (
                <View style={[
                  styles.statusBadge,
                  activity.isOpenNow ? styles.openBadge : styles.closedBadge,
                ]}>
                  <Text style={[
                    styles.statusText,
                    activity.isOpenNow ? styles.openText : styles.closedText,
                  ]}>
                    {activity.isOpenNow ? 'Open now' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.description}>{activity.description}</Text>
          </View>

          {/* Location section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.address}>{activity.address}</Text>

            <View style={styles.miniMapContainer}>
              <MapView
                style={styles.miniMap}
                initialRegion={{
                  ...activity.coordinates,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker coordinate={activity.coordinates}>
                  <View style={[styles.miniPin, { backgroundColor: activity.imageColor }]}>
                    <Ionicons name="location" size={16} color={colors.white} />
                  </View>
                </Marker>
              </MapView>
            </View>

            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleGetDirections}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Source attribution */}
          {activity.source && (
            <Text style={styles.source}>Listing via {activity.source}</Text>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroRight: {
    flexDirection: 'row',
    gap: 8,
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  recurringText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 26,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  openBadge: {
    backgroundColor: '#F0FDF4',
  },
  closedBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: colors.success,
  },
  closedText: {
    color: '#EF4444',
  },
  description: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  address: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  miniMapContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  directionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  source: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
});
