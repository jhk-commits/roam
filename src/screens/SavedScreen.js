/**
 * SavedScreen — displays bookmarked activities, split into events and places.
 * Features swipe-to-delete and an empty state with a link to Explore.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ActivityCard from '../components/ActivityCard';
import EmptyState from '../components/EmptyState';
import { useBookmarks } from '../context/BookmarkContext';
import activities from '../data/mockData';
import { getDistance } from '../utils/distance';
import { DEFAULT_LOCATION } from '../utils/constants';
import colors from '../theme/colors';

export default function SavedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { bookmarkedIds, removeBookmark } = useBookmarks();
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'places'

  // Get full activity objects for bookmarked IDs, with distance
  const bookmarkedActivities = useMemo(() => {
    return activities
      .filter((a) => bookmarkedIds.includes(a.id))
      .map((a) => ({
        ...a,
        distance: getDistance(
          DEFAULT_LOCATION.latitude,
          DEFAULT_LOCATION.longitude,
          a.coordinates.latitude,
          a.coordinates.longitude
        ),
      }));
  }, [bookmarkedIds]);

  // Split into events and attractions
  const events = useMemo(() => {
    return bookmarkedActivities
      .filter((a) => a.type === 'event')
      .sort((a, b) => {
        if (a.eventDate && b.eventDate) {
          return new Date(a.eventDate) - new Date(b.eventDate);
        }
        return 0;
      });
  }, [bookmarkedActivities]);

  const places = useMemo(() => {
    return bookmarkedActivities
      .filter((a) => a.type === 'attraction')
      .sort((a, b) => a.distance - b.distance);
  }, [bookmarkedActivities]);

  const displayedItems = activeTab === 'events' ? events : places;

  const handleActivityPress = useCallback(
    (activity) => {
      navigation.navigate('ActivityDetail', { activity });
    },
    [navigation]
  );

  const navigateToExplore = () => {
    navigation.navigate('ExploreTab');
  };

  // No bookmarks at all
  if (bookmarkedActivities.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.screenTitle}>Saved</Text>
        <EmptyState
          icon="heart-outline"
          title="No saved activities yet"
          subtitle="Tap the heart on any activity to save it for later."
          buttonLabel="Explore nearby"
          onButtonPress={navigateToExplore}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.screenTitle}>Saved</Text>

      {/* Segmented control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'events' && styles.segmentActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'events' && styles.segmentTextActive,
            ]}
          >
            Upcoming Events ({events.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'places' && styles.segmentActive]}
          onPress={() => setActiveTab('places')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'places' && styles.segmentTextActive,
            ]}
          >
            Saved Places ({places.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity list */}
      {displayedItems.length === 0 ? (
        <EmptyState
          icon={activeTab === 'events' ? 'calendar-outline' : 'location-outline'}
          title={activeTab === 'events' ? 'No saved events' : 'No saved places'}
          subtitle={
            activeTab === 'events'
              ? 'Bookmark upcoming events to see them here.'
              : 'Bookmark attractions and places to see them here.'
          }
        />
      ) : (
        <SectionList
          sections={[{ title: activeTab, data: displayedItems }]}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ActivityCard
                activity={item}
                distance={item.distance}
                onPress={() => handleActivityPress(item)}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeBookmark(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          renderSectionHeader={() => null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 22,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
