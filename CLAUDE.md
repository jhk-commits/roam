# Roam — Family Activity Discovery App

## About the Developer
- **Non-programmer** — has basic technical experience (HTML, Excel) but has never built an app before
- Uses a **Windows PC** (no Mac) and an **iPhone** for testing
- Runs the app via **Expo Go** using `npx expo start --tunnel` (tunnel mode required for their network setup)
- Project lives at `C:\Users\J\roam` on their machine
- All instructions should be **step-by-step and beginner-friendly** — never assume terminal/git familiarity
- The developer has an **Anthropic API key** configured locally in `src/config/apiKeys.js` (not committed)

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
- When pushing code changes, always give the user a simple set of commands to update their local copy (git pull, npm install if deps changed, restart expo)
- Previous chats hit context limits ("Prompt is too long") — expect to start fresh chats periodically

## Roadmap / Next Steps (prioritized)
1. **Wire up real geolocation** — app requests permission but never uses device location; hardcoded to Greenwich
2. **Implement Get Directions & Share** — currently show placeholder alerts
3. **Add real images** to activity cards (currently color placeholders)
4. **Add push notifications** via expo-notifications (preference toggles already exist)
5. **Build a backend proxy** for the Claude API (don't ship API keys in client for production)
6. **Add unit tests** — start with filters.js and distance.js (pure functions)
7. **Add ESLint + Prettier**
8. **Accessibility audit** — no labels or focus states currently

## Project History
- Built from scratch in a single Claude Code session (Feb 7-8, 2026)
- Started with Expo SDK 52, upgraded to SDK 54 to match user's Expo Go version
- Replaced @gorhom/bottom-sheet with custom Animated+PanResponder implementation (incompatible with Reanimated v4)
- Claude API event search integration added — fetches real local events and merges with mock data
- Multiple rounds of code review caught and fixed: date filter bugs, FlatList scroll issues, API response truncation, nullish coalescing errors
