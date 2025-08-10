import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../config/colors';

interface RoleModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: string) => void;
  selectedRole?: string;
}

const ROLES = [
  'Founder/CEO', 'Marketing Manager', 'Brand Manager', 'Digital Marketing Specialist',
  'Product Manager', 'Business Development', 'Sales Manager', 'Creative Director',
  'Social Media Manager', 'PR Manager', 'Operations Manager', 'Other'
];

const RoleModal: React.FC<RoleModalProps> = ({ visible, onClose, onSelectRole, selectedRole }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter roles based on search query
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) {
      return ROLES;
    }
    return ROLES.filter(role => 
      role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Select Role</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Search Input - Modified to prevent keyboard */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search roles..."
                            placeholderTextColor={COLORS.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
            showSoftInputOnFocus={false}
            contextMenuHidden={true}
            selectTextOnFocus={false}
            onPressIn={() => {
              // When user taps the search input, we can show a different UI or handle differently
              // For now, we'll just allow the search to work without keyboard
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Role List */}
        <ScrollView 
          style={styles.roleList}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          contentContainerStyle={styles.roleListContent}
          keyboardShouldPersistTaps="handled"
        >
          {filteredRoles.map(role => (
            <TouchableOpacity
              key={role}
              style={styles.roleItem}
              onPress={() => {
                onSelectRole(role);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.roleText,
                selectedRole === role && styles.selectedRoleText
              ]}>
                {role}
              </Text>
              {selectedRole === role && (
                <Ionicons name="checkmark" size={20} color="#2563EB" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D1F',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#20536d',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D1F',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  roleList: {
    flex: 1,
  },
  roleListContent: {
    paddingBottom: 20,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  roleText: {
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '400',
  },
  selectedRoleText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default RoleModal; 
