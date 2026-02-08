# Roam — Family Activity Discovery App

## What This Is
A React Native / Expo app that helps parents find family-friendly activities near Greenwich, CT. Shows a map with events, attractions, museums, parks, and play spaces — filterable by age, category, and timing.

## Tech Stack
- **React Native 0.81** + **Expo SDK 54** (managed workflow, Expo Go compatible)
- **React Navigation 7** — bottom tabs (Explore, Saved, Profile) with native stacks per tab
- **react-native-maps** — map view with custom markers
- **AsyncStorage** — persists bookmarks and kid profiles locally
- **Claude API** — event search via `src/services/eventSearch.js` (requires API key in `src/config/apiKeys.js`)
- **Plain JavaScript** (no TypeScript)

## Project Structure
```
App.js                              # Entry point, wraps providers + onboarding check
src/
  navigation/AppNavigator.js        # Tab + stack navigators
  screens/
    OnboardingScreen.js             # 3-step first-launch flow
    ExploreScreen.js                # Map + custom bottom sheet + filters + event search
    ActivityDetailScreen.js         # Full detail view for an activity
    SavedScreen.js                  # Bookmarked activities (events/places tabs)
    ProfileScreen.js                # Kid profiles + preferences + settings
  components/
    ActivityCard.js                 # Reusable card with bookmark, badges, distance
    FilterBar.js                    # Horizontal scrolling filter chips
    FilterChip.js                   # Individual filter chip
    CategoryBadge.js                # Colored category label
    AgeMatchBanner.js               # "Great for your kids" indicator
    MapMarker.js                    # Custom colored map pin
    EmptyState.js                   # Empty state placeholder
  context/
    BookmarkContext.js              # Bookmark IDs + AsyncStorage persistence
    ProfileContext.js               # Kid profiles + user preferences (radius, notifications)
    LiveEventsContext.js            # Stores API-fetched events for cross-screen access
  services/eventSearch.js           # Claude API integration for live event search
  data/mockData.js                  # 25 hardcoded activities for offline use
  utils/
    constants.js                    # Categories, default location (Greenwich 41.0262, -73.6282)
    filters.js                      # Filter logic: when, category, age, free
    distance.js                     # Haversine distance calculation
  config/
    apiKeys.js                      # API key (placeholder — needs real key)
    apiKeys.example.js              # Setup instructions
  theme/colors.js                   # Color palette
```

## Key Architecture Decisions
- **Custom bottom sheet** in ExploreScreen using Animated + PanResponder (replaced @gorhom/bottom-sheet for Expo compatibility)
- **Context-based state** — no Redux/Zustand, just 3 React contexts
- **Mock + live data merged** — mockData.js always available, API results added on top via LiveEventsContext
- **Location hardcoded** to Greenwich, CT — expo-location is installed and permission requested but device location is never actually used

## Running the App
```bash
npm install
npx expo start          # scan QR with Expo Go on phone
npx expo start --tunnel  # if QR/local network doesn't work
```

## Known Issues & Gaps
- **No tests** — no test files, no test framework configured
- **No linting** — no ESLint or Prettier
- **API key in source** — `src/config/apiKeys.js` is committed with placeholder; `.gitignore` entry is commented out
- **Geolocation not wired up** — onboarding requests permission but never stores/uses actual location
- **Stub features** — Get Directions, Share, Send Feedback all show placeholder alerts
- **Notifications** — preference toggles exist in ProfileScreen but no push notification implementation
- **Images** — all activity cards use color placeholders, no real images
- **Date sensitivity** — mock data has hardcoded Feb 2026 dates

## Development Notes
- All deps are Expo Go compatible — no native builds needed
- The main branch has only the initial README commit; all app code is on feature branches
- When editing filters.js, be careful with weekend/date logic — there were previous bugs with isThisWeekend not including Saturday
