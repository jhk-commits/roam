/**
 * Filter logic for activities.
 * Each filter function takes an array of activities and returns a filtered array.
 * Filters compose cleanly — chain them together to apply multiple criteria.
 */

/**
 * Check if a date falls on today.
 */
function isToday(date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Check if a date falls on this weekend (upcoming Saturday or Sunday).
 */
function isThisWeekend(date) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Find this Saturday and Sunday
  let saturday, sunday;

  if (dayOfWeek === 6) {
    // Today is Saturday
    saturday = new Date(now);
    sunday = new Date(now);
    sunday.setDate(now.getDate() + 1);
  } else if (dayOfWeek === 0) {
    // Today is Sunday — include yesterday (Saturday) and today
    saturday = new Date(now);
    saturday.setDate(now.getDate() - 1);
    sunday = new Date(now);
  } else {
    // Weekday — find the upcoming Saturday
    const daysUntilSaturday = 6 - dayOfWeek;
    saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
  }

  saturday.setHours(0, 0, 0, 0);
  sunday.setHours(23, 59, 59, 999);

  return date >= saturday && date <= sunday;
}

/**
 * Check if a date falls within this week (today through end of Sunday).
 */
function isThisWeek(date) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfToday && date <= endOfWeek;
}

/**
 * Filter activities by time window.
 * Attractions pass through all time filters (they're always available).
 * Events are filtered by their event date.
 * Recurring events pass through all filters.
 *
 * @param {Array} activities
 * @param {string|null} whenFilter - "today", "this_weekend", "this_week", "any_time", or null
 * @returns {Array}
 */
export function filterByWhen(activities, whenFilter) {
  if (!whenFilter || whenFilter === 'any_time') return activities;

  return activities.filter((activity) => {
    // Attractions always show
    if (activity.type === 'attraction') return true;

    // Recurring events always show (they repeat regularly)
    if (activity.isRecurring) return true;

    if (!activity.eventDate) return true;

    const eventDate = new Date(activity.eventDate);

    switch (whenFilter) {
      case 'today':
        return isToday(eventDate);
      case 'this_weekend':
        return isThisWeekend(eventDate);
      case 'this_week':
        return isThisWeek(eventDate);
      default:
        return true;
    }
  });
}

/**
 * Filter activities by category.
 *
 * @param {Array} activities
 * @param {Array<string>} activeCategories - Array of category keys (e.g., ["arts", "nature"])
 * @returns {Array}
 */
export function filterByCategory(activities, activeCategories) {
  if (!activeCategories || activeCategories.length === 0) return activities;
  return activities.filter((activity) =>
    activeCategories.includes(activity.category)
  );
}

/**
 * Filter activities by age appropriateness.
 * An activity matches if the given age falls within its age range.
 * Activities with no age range (all ages) always match.
 *
 * @param {Array} activities
 * @param {number|null} age - The child's age to filter by, or null to skip
 * @returns {Array}
 */
export function filterByAge(activities, age) {
  if (age === null || age === undefined) return activities;

  return activities.filter((activity) => {
    if (!activity.ageRange) return true; // "all ages"
    return age >= activity.ageRange.min && age <= activity.ageRange.max;
  });
}

/**
 * Filter to show only free activities.
 *
 * @param {Array} activities
 * @param {boolean} freeOnly
 * @returns {Array}
 */
export function filterByFree(activities, freeOnly) {
  if (!freeOnly) return activities;
  return activities.filter((activity) => activity.isFree);
}

/**
 * Filter activities by type (event vs attraction).
 *
 * @param {Array} activities
 * @param {string|null} activityType - "event", "attraction", or null for all
 * @returns {Array}
 */
export function filterByType(activities, activityType) {
  if (!activityType) return activities;
  return activities.filter((activity) => activity.type === activityType);
}

/**
 * Apply all active filters to an array of activities.
 *
 * @param {Array} activities - Full list of activities
 * @param {Object} filters - Active filter state
 * @param {string|null} filters.when - Time filter
 * @param {Array<string>} filters.categories - Active category keys
 * @param {number|null} filters.age - Age to filter by
 * @param {boolean} filters.freeOnly - Show only free activities
 * @param {string|null} filters.type - "event", "attraction", or null
 * @returns {Array}
 */
export function applyFilters(activities, filters) {
  let result = activities;
  result = filterByType(result, filters.type);
  result = filterByWhen(result, filters.when);
  result = filterByCategory(result, filters.categories);
  result = filterByAge(result, filters.age);
  result = filterByFree(result, filters.freeOnly);
  return result;
}
