/**
 * AppNavigator — sets up the tab bar and stack navigators for the app.
 *
 * Structure:
 * - Bottom Tab Navigator
 *   - Explore Tab → Stack (ExploreScreen, ActivityDetailScreen)
 *   - Saved Tab → Stack (SavedScreen, ActivityDetailScreen)
 *   - Profile Tab → Stack (ProfileScreen)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from '../screens/ExploreScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Explore tab stack — map view + activity detail
function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="Explore" component={ExploreScreen} />
      <ExploreStack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </ExploreStack.Navigator>
  );
}

// Saved tab stack — bookmarks + activity detail
function SavedStackScreen() {
  return (
    <SavedStack.Navigator screenOptions={{ headerShown: false }}>
      <SavedStack.Screen name="Saved" component={SavedScreen} />
      <SavedStack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </SavedStack.Navigator>
  );
}

// Profile tab stack
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'ExploreTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'SavedTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.divider,
          paddingBottom: 4,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStackScreen}
        options={{ tabBarLabel: 'Saved' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
