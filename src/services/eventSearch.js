/**
 * eventSearch.js — uses the Claude API with web search to find real local events.
 * Returns structured event data that matches the app's activity format.
 */

import { ANTHROPIC_API_KEY } from '../config/apiKeys';
import { CATEGORIES } from '../utils/constants';

const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Build the search prompt based on user location and kid profiles.
 */
function buildPrompt(location, kids, radius) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build the next 7 days range
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 14);
  const endDateStr = endDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const kidDescriptions = kids.length > 0
    ? kids.map((k) => `${k.name} (age ${k.age})`).join(', ')
    : 'children ages 0-12';

  return `You are a local family event finder. Today is ${dateStr}.

Search for real, upcoming family-friendly events and activities near Greenwich, CT within a ${radius}-mile radius. These are for: ${kidDescriptions}.

SEARCH STRATEGY:
1. Search for family events on mommypoppins.com, eventbrite.com, local library calendars, museum websites
2. Check: Greenwich Library, Bruce Museum, Stepping Stones Museum, Stamford Museum & Nature Center
3. Search for: storytimes, workshops, open gyms, family concerts, nature walks, craft fairs, kids classes
4. Look for events from ${dateStr} through ${endDateStr}

IMPORTANT RULES:
- Only include events with specific dates and times
- Include both free and paid events
- Include the venue name and full address
- Include permanent family-friendly attractions that are currently open (museums, parks, play spaces)
- Aim for 15-20 results total, mixing events and attractions
- For each result, categorize as one of: arts, nature, sports, learning, museums, events, indoor_play

Return ONLY a JSON array (no markdown, no explanation) where each item has this exact structure:
{
  "name": "Event Name",
  "type": "event" or "attraction",
  "category": "arts|nature|sports|learning|museums|events|indoor_play",
  "description": "2-3 sentence description",
  "address": "Full street address",
  "latitude": 41.0262,
  "longitude": -73.6282,
  "ageMin": 0,
  "ageMax": 12,
  "isFree": true or false,
  "price": "$15" or null,
  "isIndoor": true or false,
  "isOutdoor": true or false,
  "eventDate": "2026-02-15T10:00:00" or null for attractions,
  "eventEndDate": "2026-02-15T12:00:00" or null,
  "isRecurring": true or false,
  "recurringDescription": "Every Saturday" or null,
  "hours": "9:00 AM - 5:00 PM" or null for events,
  "source": "Website name where you found this"
}

Return ONLY the JSON array. No other text.`;
}

/**
 * Map a category string to its color.
 */
function getCategoryColor(category) {
  const config = CATEGORIES[category];
  return config ? config.color : '#3B82F6';
}

/**
 * Parse the Claude API response into activity objects matching the app's data model.
 */
function parseResponse(responseText) {
  // Extract JSON array from response (Claude sometimes wraps it in markdown)
  let jsonStr = responseText.trim();

  // Remove markdown code fences if present
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let items;
  try {
    items = JSON.parse(jsonStr);
  } catch (e) {
    // Response may have been truncated — try to recover complete items
    // Find the last complete object (ending with "}") and close the array
    const lastCompleteObj = jsonStr.lastIndexOf('}');
    if (lastCompleteObj > 0) {
      try {
        const recovered = jsonStr.substring(0, lastCompleteObj + 1) + ']';
        items = JSON.parse(recovered);
      } catch {
        throw new Error('Could not parse event data from API response');
      }
    } else {
      throw new Error('Could not parse event data from API response');
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No events found in API response');
  }

  return items.map((item, index) => ({
    id: `live-${index}-${Date.now()}`,
    name: item.name,
    type: item.type || 'event',
    category: item.category || 'events',
    description: item.description || '',
    address: item.address || '',
    coordinates: {
      latitude: item.latitude ?? 41.0262,
      longitude: item.longitude ?? -73.6282,
    },
    ageRange: item.ageMin != null && item.ageMax != null
      ? { min: item.ageMin ?? 0, max: item.ageMax ?? 12 }
      : null,
    isFree: item.isFree || false,
    price: item.price || null,
    isIndoor: item.isIndoor ?? true,
    isOutdoor: item.isOutdoor ?? false,
    imageColor: getCategoryColor(item.category),
    source: item.source || 'Web Search',
    eventDate: item.eventDate || null,
    eventEndDate: item.eventEndDate || null,
    isRecurring: item.isRecurring || false,
    recurringDescription: item.recurringDescription || null,
    hours: item.hours || null,
    isOpenNow: item.type === 'attraction',
  }));
}

/**
 * Search for real events near the given location using Claude's web search.
 *
 * @param {Object} options
 * @param {Array} options.kids - Kid profiles [{ name, age }]
 * @param {number} options.radius - Search radius in miles
 * @returns {Promise<Array>} Array of activity objects
 */
export async function searchEvents({ kids = [], radius = 10 } = {}) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your-api-key-here') {
    throw new Error('API key not configured. See src/config/apiKeys.example.js');
  }

  const prompt = buildPrompt(null, kids, radius);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Unexpected API response format');
  }

  if (data.stop_reason === 'max_tokens') {
    console.warn('Event search response was truncated — some results may be missing');
  }

  const text = data.content[0].text;

  return parseResponse(text);
}
