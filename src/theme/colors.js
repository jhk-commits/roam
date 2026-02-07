/**
 * Roam color palette — single source of truth for all colors used in the app.
 */

const colors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',

  // Primary accent
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',

  // Category colors (used for map pins, badges, and card accents)
  category: {
    arts: '#6366F1',        // indigo
    nature: '#22C55E',      // green
    sports: '#F97316',      // orange
    learning: '#8B5CF6',    // purple
    museums: '#3B82F6',     // blue
    events: '#EC4899',      // pink
    indoor_play: '#EAB308', // yellow
  },

  // UI elements
  bookmarkActive: '#EF4444',
  filterActive: '#3B82F6',
  filterInactive: '#F3F4F6',
  filterTextInactive: '#6B7280',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',

  // Borders and dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Shadows (used in style objects)
  shadow: '#000000',

  // White and transparent
  white: '#FFFFFF',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export default colors;
