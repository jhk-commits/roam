/**
 * ExploreScreen — the main map view with filter bar and draggable bottom sheet.
 * This is the home screen of the app.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityCard from '../components/ActivityCard';
import FilterBar from '../components/FilterBar';
import MapMarker from '../components/MapMarker';
import EmptyState from '../components/EmptyState';
import activities from '../data/mockData';
import { DEFAULT_LOCATION, CATEGORIES } from '../utils/constants';
import { getDistance } from '../utils/distance';
import { applyFilters } from '../utils/filters';
import colors from '../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    when: null,
    categories: [],
    age: null,
    freeOnly: false,
  });

  // Add distance to each activity and sort by distance
  const activitiesWithDistance = useMemo(() => {
    return activities
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
  }, []);

  // Apply filters
  const filteredActivities = useMemo(() => {
    return applyFilters(activitiesWithDistance, filters);
  }, [activitiesWithDistance, filters]);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => {
    // Collapsed shows ~2 cards, half screen, nearly full
    const collapsed = Math.min(220, SCREEN_HEIGHT * 0.25);
    return [collapsed, '50%', '90%'];
  }, []);

  // Handle marker press — expand the bottom sheet and scroll to the activity
  const handleMarkerPress = useCallback((activity) => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  // Navigate to activity detail
  const handleActivityPress = useCallback(
    (activity) => {
      navigation.navigate('ActivityDetail', { activity });
    },
    [navigation]
  );

  // Render an activity card in the bottom sheet list
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

  // List header showing count
  const ListHeader = useCallback(() => {
    const hasFilters = filters.when || filters.categories.length > 0 || filters.age !== null || filters.freeOnly;
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} nearby
          {hasFilters ? ' (filtered)' : ''}
        </Text>
      </View>
    );
  }, [filteredActivities.length, filters]);

  // List empty component
  const ListEmpty = useCallback(
    () => (
      <EmptyState
        icon="search-outline"
        title="No activities found"
        subtitle="Try adjusting your filters to see more results."
        buttonLabel="Clear Filters"
        onButtonPress={() =>
          setFilters({ when: null, categories: [], age: null, freeOnly: false })
        }
      />
    ),
    []
  );

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
            onPress={() => handleMarkerPress(activity)}
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

      {/* Filter bar — positioned between map and bottom sheet */}
      <View style={styles.filterBarContainer}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </View>

      {/* Bottom sheet with activity list */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <ListHeader />
        <BottomSheetFlatList
          data={filteredActivities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheet>
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
    top: 0,
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
  sheetBackground: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
  },
  sheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  listCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 40,
  },
});
