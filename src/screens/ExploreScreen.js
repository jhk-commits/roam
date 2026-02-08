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
  Modal,
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

const TYPE_OPTIONS = [
  { key: null, label: 'All' },
  { key: 'event', label: 'Happening Soon' },
  { key: 'attraction', label: 'Always Open' },
];

const TIME_PERIODS = [
  { key: 'weekend', label: 'This Weekend' },
  { key: 'week', label: 'This Week' },
  { key: '2weeks', label: 'Next 2 Weeks' },
  { key: 'month', label: 'This Month' },
];

const DISTANCE_OPTIONS = [
  { key: 5, label: '5 mi' },
  { key: 10, label: '10 mi' },
  { key: 25, label: '25 mi' },
  { key: 40, label: '40 mi' },
];

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { kids, preferences } = useProfile();
  const { liveEvents, updateLiveEvents } = useLiveEvents();

  // Filter state
  const [filters, setFilters] = useState({
    type: null,
    when: null,
    categories: [],
    age: null,
    freeOnly: false,
  });

  // Search settings state
  const [timePeriod, setTimePeriod] = useState('2weeks');
  const [searchRadius, setSearchRadius] = useState(preferences.searchRadius || 10);
  const [showSearchSettings, setShowSearchSettings] = useState(false);

  // Live event search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
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
        const newHeight = lastSnap.current - gestureState.dy;
        const clamped = Math.max(
          SNAP_COLLAPSED * 0.8,
          Math.min(SNAP_EXPANDED, newHeight)
        );
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentHeight = lastSnap.current - gestureState.dy;
        if (gestureState.vy < -0.5) {
          const nextUp =
            lastSnap.current < SNAP_HALF ? SNAP_HALF : SNAP_EXPANDED;
          snapTo(nextUp);
        } else if (gestureState.vy > 0.5) {
          const nextDown =
            lastSnap.current > SNAP_HALF ? SNAP_HALF : SNAP_COLLAPSED;
          snapTo(nextDown);
        } else {
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
    setSearchStatus('Searching local events and activities...');
    try {
      await new Promise((r) => setTimeout(r, 300));
      setSearchStatus('Checking libraries, museums, and parks...');
      const results = await searchEvents({
        kids,
        radius: searchRadius,
        timePeriod,
      });
      setSearchStatus(`Found ${results.length} activities!`);
      updateLiveEvents(results);
      snapTo(SNAP_HALF);
      setTimeout(() => setSearchStatus(''), 2000);
    } catch (error) {
      setSearchStatus('');
      Alert.alert(
        'Search Failed',
        error.message.includes('API key')
          ? 'API key not configured. Add your key in src/config/apiKeys.js'
          : 'Could not fetch events. Check your internet connection and try again.'
      );
    } finally {
      setIsSearching(false);
    }
  }, [kids, searchRadius, timePeriod, snapTo, updateLiveEvents]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    return applyFilters(activitiesWithDistance, filters);
  }, [activitiesWithDistance, filters]);

  // Handle marker press
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
    filters.type ||
    filters.when ||
    filters.categories.length > 0 ||
    filters.age !== null ||
    filters.freeOnly;

  const currentTimePeriod = TIME_PERIODS.find((t) => t.key === timePeriod);
  const currentDistance = DISTANCE_OPTIONS.find((d) => d.key === searchRadius);

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

      {/* Filter bar */}
      <View style={[styles.filterBarContainer, { top: insets.top }]}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </View>

      {/* Custom draggable bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Type segmented control */}
        <View style={styles.segmentedContainer}>
          {TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key || 'all'}
              style={[
                styles.segmentedButton,
                filters.type === opt.key && styles.segmentedButtonActive,
              ]}
              onPress={() => setFilters({ ...filters, type: opt.key })}
            >
              <Text
                style={[
                  styles.segmentedText,
                  filters.type === opt.key && styles.segmentedTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search row: settings + button */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.settingsPill}
            onPress={() => setShowSearchSettings(true)}
          >
            <Ionicons name="options-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.settingsPillText}>
              {currentTimePeriod?.label} · {currentDistance?.label}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonSearching]}
            onPress={handleSearchEvents}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color={colors.white} />
                <Text style={styles.searchButtonText}>Find Things To Do</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search status message */}
        {searchStatus ? (
          <View style={styles.statusBar}>
            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.statusText}>{searchStatus}</Text>
          </View>
        ) : (
          <View style={styles.countRow}>
            <Text style={styles.listCount}>
              {filteredActivities.length}{' '}
              {filteredActivities.length === 1 ? 'activity' : 'activities'} nearby
              {hasFilters ? ' (filtered)' : ''}
            </Text>
          </View>
        )}

        {/* Activity list */}
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No activities found"
            subtitle="Try adjusting your filters to see more results."
            buttonLabel="Clear Filters"
            onButtonPress={() =>
              setFilters({
                type: null,
                when: null,
                categories: [],
                age: null,
                freeOnly: false,
              })
            }
          />
        ) : (
          <FlatList
            style={styles.list}
            data={filteredActivities}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* Search settings modal */}
      <Modal
        visible={showSearchSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchSettings(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSearchSettings(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Settings</Text>

            <Text style={styles.modalLabel}>Time Period</Text>
            <View style={styles.optionRow}>
              {TIME_PERIODS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionChip,
                    timePeriod === opt.key && styles.optionChipActive,
                  ]}
                  onPress={() => setTimePeriod(opt.key)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      timePeriod === opt.key && styles.optionChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Distance</Text>
            <View style={styles.optionRow}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionChip,
                    searchRadius === opt.key && styles.optionChipActive,
                  ]}
                  onPress={() => setSearchRadius(opt.key)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      searchRadius === opt.key && styles.optionChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalDone}
              onPress={() => setShowSearchSettings(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Bottom sheet
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
  // Segmented control for type
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.filterInactive,
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentedButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentedTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  settingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    flex: 1,
  },
  settingsPillText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  searchButtonSearching: {
    backgroundColor: colors.textSecondary,
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  countRow: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.filterInactive,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.white,
  },
  modalDone: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  modalDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
