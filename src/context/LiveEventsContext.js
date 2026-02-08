/**
 * LiveEventsContext — stores live events fetched from the API
 * so they can be accessed by multiple screens (Explore + Saved).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const LiveEventsContext = createContext();

export function LiveEventsProvider({ children }) {
  const [liveEvents, setLiveEvents] = useState([]);

  const updateLiveEvents = useCallback((events) => {
    setLiveEvents(events);
  }, []);

  return (
    <LiveEventsContext.Provider value={{ liveEvents, updateLiveEvents }}>
      {children}
    </LiveEventsContext.Provider>
  );
}

export function useLiveEvents() {
  const context = useContext(LiveEventsContext);
  if (!context) {
    throw new Error('useLiveEvents must be used within a LiveEventsProvider');
  }
  return context;
}
