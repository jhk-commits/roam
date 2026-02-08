/**
 * ExploreScreen — the main map view with filter bar and draggable bottom sheet.
 * This is the home screen of the app.
 *
 * Uses a custom bottom sheet built with React Native's Animated API and
 * PanResponder to avoid compatibility issues with third-party libraries.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ActivityCard from '../components/ActivityCard';
import FilterBar from '../components/FilterBar';
import MapMarker from '../components/MapMarker';
import EmptyState from '../components/EmptyState';
import mockActivities from '../data/mockData';
import { DEFAULT_LOCATION, CATEGORIES } from '../utils/constants';
import { getDistance } from '../utils/distance';
import { applyFilters } from '../utils/filters';
import { useProfile } from '../context/ProfileContext';
import { useLiveEvents } from '../context/LiveEventsContext';
import { searchEvents } from '../services/eventSearch';
import colors from '../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bottom sheet snap points (height of the sheet from the bottom)
const SNAP_COLLAPSED = SCREEN_HEIGHT * 0.30;
const SNAP_HALF = SCREEN_HEIGHT * 0.55;
const SNAP_EXPANDED = SCREEN_HEIGHT * 0.88;

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { kids, preferences } = useProfile();
  const { liveEvents, updateLiveEvents } = useLiveEvents();

  // Filter state
  const [filters, setFilters] = useState({
    when: null,
    categories: [],
    age: null,
    freeOnly: false,
  });

  // Live event search state
  const [isSearching, setIsSearching] = useState(false);
  const hasSearched = liveEvents.length > 0;

  // Bottom sheet animation value (represents the height of the sheet)
  const sheetHeight = useRef(new Animated.Value(SNAP_COLLAPSED)).current;
  const lastSnap = useRef(SNAP_COLLAPSED);

  // Snap the sheet to a given height with a spring animation
  const snapTo = useCallback(
    (toValue) => {
      lastSnap.current = toValue;
      Animated.spring(sheetHeight, {
        toValue,
        useNativeDriver: false,
        tension: 60,
        friction: 12,
      }).start();
    },
    [sheetHeight]
  );

  // Find the closest snap point to a given value
  const getClosestSnap = useCallback((value) => {
    const snaps = [SNAP_COLLAPSED, SNAP_HALF, SNAP_EXPANDED];
    let closest = snaps[0];
    let minDist = Math.abs(value - snaps[0]);
    for (let i = 1; i < snaps.length; i++) {
      const dist = Math.abs(value - snaps[i]);
      if (dist < minDist) {
        closest = snaps[i];
        minDist = dist;
      }
    }
    return closest;
  }, []);

  // Pan responder for dragging the bottom sheet handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        // Dragging up (negative dy) should increase height
        const newHeight = lastSnap.current - gestureState.dy;
        const clamped = Math.max(
          SNAP_COLLAPSED * 0.8,
          Math.min(SNAP_EXPANDED, newHeight)
        );
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = lastSnap.current - gestureState.dy;
        // Fast flick up → go to next snap up
        if (gestureState.vy < -0.5) {
          const nextUp =
            lastSnap.current < SNAP_HALF ? SNAP_HALF : SNAP_EXPANDED;
          snapTo(nextUp);
        }
        // Fast flick down → go to next snap down
        else if (gestureState.vy > 0.5) {
          const nextDown =
            lastSnap.current > SNAP_HALF ? SNAP_HALF : SNAP_COLLAPSED;
          snapTo(nextDown);
        }
        // Otherwise snap to closest
        else {
          snapTo(getClosestSnap(currentHeight));
        }
      },
    })
  ).current;

  // Combine mock data with live events, add distance, and sort
  const allActivities = useMemo(() => {
    return liveEvents.length > 0 ? [...mockActivities, ...liveEvents] : mockActivities;
  }, [liveEvents]);

  const activitiesWithDistance = useMemo(() => {
    return allActivities
      .map((activity) => ({
        ...activity,
        distance: getDistance(
          DEFAULT_LOCATION.latitude,
          DEFAULT_LOCATION.longitude,
          activity.coordinates.latitude,
          activity.coordinates.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [allActivities]);

  // Handle live event search
  const handleSearchEvents = useCallback(async () => {
    setIsSearching(true);
    try {
      const results = await searchEvents({
        kids,
        radius: preferences.searchRadius,
      });
      updateLiveEvents(results);
      snapTo(SNAP_HALF);
    } catch (error) {
      Alert.alert(
        'Search Failed',
        error.message.includes('API key')
          ? 'API key not configured. Add your key in src/config/apiKeys.js'
          : 'Could not fetch events. Check your internet connection and try again.'
      );
    } finally {
      setIsSearching(false);
    }
  }, [kids, preferences.searchRadius, snapTo, updateLiveEvents]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    return applyFilters(activitiesWithDistance, filters);
  }, [activitiesWithDistance, filters]);

  // Handle marker press — expand the bottom sheet
  const handleMarkerPress = useCallback(() => {
    snapTo(SNAP_HALF);
  }, [snapTo]);

  // Navigate to activity detail
  const handleActivityPress = useCallback(
    (activity) => {
      navigation.navigate('ActivityDetail', { activity });
    },
    [navigation]
  );

  // Render an activity card in the list
  const renderItem = useCallback(
    ({ item }) => (
      <ActivityCard
        activity={item}
        distance={item.distance}
        onPress={() => handleActivityPress(item)}
      />
    ),
    [handleActivityPress]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const hasFilters =
    filters.when ||
    filters.categories.length > 0 ||
    filters.age !== null ||
    filters.freeOnly;

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_LOCATION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {filteredActivities.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={activity.coordinates}
            onPress={handleMarkerPress}
          >
            <MapMarker category={activity.category} />
            <Callout tooltip onPress={() => handleActivityPress(activity)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName} numberOfLines={1}>
                  {activity.name}
                </Text>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutCategory}>
                    {CATEGORIES[activity.category]?.shortLabel}
                  </Text>
                  <Text style={styles.calloutDistance}>
                    {activity.distance} mi
                  </Text>
                </View>
                <Text style={styles.calloutView}>Tap to view</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Filter bar — positioned below safe area at top of screen */}
      <View style={[styles.filterBarContainer, { top: insets.top }]}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </View>

      {/* Custom draggable bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* List header with search button */}
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>
            {filteredActivities.length}{' '}
            {filteredActivities.length === 1 ? 'activity' : 'activities'} nearby
            {hasFilters ? ' (filtered)' : ''}
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchEvents}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color={colors.white} />
                <Text style={styles.searchButtonText}>
                  {hasSearched ? 'Refresh' : 'Find Events'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Activity list */}
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No activities found"
            subtitle="Try adjusting your filters to see more results."
            buttonLabel="Clear Filters"
            onButtonPress={() =>
              setFilters({
                when: null,
                categories: [],
                age: null,
                freeOnly: false,
              })
            }
          />
        ) : (
          <FlatList
            data={filteredActivities}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  filterBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  callout: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    maxWidth: 240,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calloutDistance: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  calloutView: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  // Custom bottom sheet styles
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minWidth: 110,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  listContent: {
    paddingBottom: 100,
  },
});
