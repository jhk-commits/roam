/**
 * App-wide constants — category labels, mappings, icon names, and configuration.
 */

import colors from '../theme/colors';

// Default location: Greenwich, CT
export const DEFAULT_LOCATION = {
  latitude: 41.0262,
  longitude: -73.6282,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Category display configuration — label, color, and Ionicons icon name
export const CATEGORIES = {
  arts: {
    key: 'arts',
    label: 'Arts & Culture',
    shortLabel: 'Arts',
    color: colors.category.arts,
    icon: 'color-palette',
  },
  nature: {
    key: 'nature',
    label: 'Nature & Outdoors',
    shortLabel: 'Nature',
    color: colors.category.nature,
    icon: 'leaf',
  },
  sports: {
    key: 'sports',
    label: 'Sports & Active',
    shortLabel: 'Sports',
    color: colors.category.sports,
    icon: 'football',
  },
  learning: {
    key: 'learning',
    label: 'Learning & Education',
    shortLabel: 'Learning',
    color: colors.category.learning,
    icon: 'book',
  },
  museums: {
    key: 'museums',
    label: 'Museums',
    shortLabel: 'Museums',
    color: colors.category.museums,
    icon: 'business',
  },
  events: {
    key: 'events',
    label: 'Seasonal & Events',
    shortLabel: 'Events',
    color: colors.category.events,
    icon: 'calendar',
  },
  indoor_play: {
    key: 'indoor_play',
    label: 'Indoor Play',
    shortLabel: 'Indoor Play',
    color: colors.category.indoor_play,
    icon: 'game-controller',
  },
};

// "When" filter options
export const WHEN_FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'this_weekend', label: 'This Weekend' },
  { key: 'this_week', label: 'This Week' },
  { key: 'any_time', label: 'Any Time' },
];

// Search radius options (in miles)
export const RADIUS_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_RADIUS = 10;

// Onboarding flag key for AsyncStorage
export const ONBOARDING_COMPLETE_KEY = '@roam_onboarding_complete';
export const BOOKMARKS_STORAGE_KEY = '@roam_bookmarks';
export const PROFILE_STORAGE_KEY = '@roam_profile';
export const PREFERENCES_STORAGE_KEY = '@roam_preferences';
