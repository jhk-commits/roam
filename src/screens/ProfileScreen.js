/**
 * ProfileScreen — manage kid profiles, preferences, and app settings.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../context/ProfileContext';
import { RADIUS_OPTIONS, ONBOARDING_COMPLETE_KEY } from '../utils/constants';
import colors from '../theme/colors';

// Consistent colors for kid avatars
const AVATAR_COLORS = ['#6366F1', '#3B82F6', '#22C55E', '#F97316', '#EC4899', '#8B5CF6', '#EAB308'];

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { kids, addKid, updateKid, removeKid, preferences, updatePreference } = useProfile();

  // State for add/edit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKid, setEditingKid] = useState(null);
  const [inputName, setInputName] = useState('');
  const [inputAge, setInputAge] = useState('');

  // Open modal for adding a new kid
  const openAddModal = () => {
    setEditingKid(null);
    setInputName('');
    setInputAge('');
    setModalVisible(true);
  };

  // Open modal for editing an existing kid
  const openEditModal = (kid) => {
    setEditingKid(kid);
    setInputName(kid.name);
    setInputAge(kid.age.toString());
    setModalVisible(true);
  };

  // Save from modal
  const handleSave = () => {
    if (!inputName.trim()) {
      Alert.alert('Missing name', 'Please enter a name.');
      return;
    }
    if (!inputAge || parseInt(inputAge, 10) < 0 || parseInt(inputAge, 10) > 18) {
      Alert.alert('Invalid age', 'Please enter an age between 0 and 18.');
      return;
    }

    if (editingKid) {
      updateKid(editingKid.id, inputName, inputAge);
    } else {
      addKid(inputName, inputAge);
    }
    setModalVisible(false);
  };

  // Confirm delete
  const handleDelete = (kid) => {
    Alert.alert(
      `Remove ${kid.name}?`,
      'This will remove them from your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeKid(kid.id),
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Roam',
      'Roam v1.0.0\n\nA family activity discovery app that helps parents find things to do with their kids nearby.\n\nBuilt with love for busy families.',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'Thanks for wanting to help! Feedback functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome screens again next time you open the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
            Alert.alert('Done', 'Close and reopen the app to see the onboarding screens.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Profile</Text>

        {/* My Kids section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Kids</Text>
          </View>

          {kids.length === 0 ? (
            <Text style={styles.emptyNote}>
              Add your children to see age-appropriate activity recommendations.
            </Text>
          ) : (
            kids.map((kid, index) => (
              <View key={kid.id} style={styles.kidRow}>
                <View
                  style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}
                >
                  <Text style={styles.avatarText}>
                    {kid.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.kidInfo}>
                  <Text style={styles.kidName}>{kid.name}</Text>
                  <Text style={styles.kidAge}>Age {kid.age}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(kid)}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(kid)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add a child</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Default search radius</Text>
            <View style={styles.radiusOptions}>
              {RADIUS_OPTIONS.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusChip,
                    preferences.searchRadius === radius && styles.radiusChipActive,
                  ]}
                  onPress={() => updatePreference('searchRadius', radius)}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      preferences.searchRadius === radius && styles.radiusChipTextActive,
                    ]}
                  >
                    {radius} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>New events nearby</Text>
              <Text style={styles.toggleSublabel}>Get notified about new activities</Text>
            </View>
            <Switch
              value={preferences.notifyNewEvents}
              onValueChange={(val) => updatePreference('notifyNewEvents', val)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.notifyNewEvents ? colors.primary : '#F4F3F4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Weekend picks</Text>
              <Text style={styles.toggleSublabel}>Weekly suggestions every Friday</Text>
            </View>
            <Switch
              value={preferences.notifyWeekendPicks}
              onValueChange={(val) => updatePreference('notifyWeekendPicks', val)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.notifyWeekendPicks ? colors.primary : '#F4F3F4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Bookmarked event reminders</Text>
              <Text style={styles.toggleSublabel}>Remind me before saved events</Text>
            </View>
            <Switch
              value={preferences.notifyReminders}
              onValueChange={(val) => updatePreference('notifyReminders', val)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.notifyReminders ? colors.primary : '#F4F3F4'}
            />
          </View>
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.aboutRow} onPress={handleAbout}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.aboutText}>About Roam</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutRow} onPress={handleFeedback}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.aboutText}>Send Feedback</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutRow} onPress={handleResetOnboarding}>
            <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.aboutText}>Reset Onboarding</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Kid Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingKid ? 'Edit Child' : 'Add a Child'}
            </Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="First name"
              placeholderTextColor={colors.textSecondary}
              value={inputName}
              onChangeText={setInputName}
              autoCapitalize="words"
              autoFocus
            />

            <Text style={styles.modalLabel}>Age</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Age"
              placeholderTextColor={colors.textSecondary}
              value={inputAge}
              onChangeText={(val) => setInputAge(val.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderTopWidth: 8,
    borderTopColor: colors.backgroundSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyNote: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
  kidInfo: {
    flex: 1,
    marginLeft: 12,
  },
  kidName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  kidAge: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  preferenceRow: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.filterInactive,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.filterTextInactive,
  },
  radiusChipTextActive: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  toggleSublabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  aboutText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modalSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
