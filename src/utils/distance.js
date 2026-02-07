/**
 * Distance calculation using the Haversine formula.
 * Returns the distance in miles between two geographic coordinates.
 */

const EARTH_RADIUS_MILES = 3958.8;

/**
 * Convert degrees to radians.
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the distance in miles between two coordinates using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles, rounded to 1 decimal place
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_MILES * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Format a distance value for display.
 * Returns a string like "0.8 mi" or "12.3 mi".
 */
export function formatDistance(miles) {
  if (miles < 0.1) return '< 0.1 mi';
  return `${miles} mi`;
}
