import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name?: string;
    email?: string;
    profile_image_url?: string;
  };
}

const AccountModal: React.FC<AccountModalProps> = ({ visible, onClose, user }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account</Text>
            <View style={{ width: 32 }} />
          </View>
          {/* Profile Info */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              {user.profile_image_url ? (
                <Image source={{ uri: user.profile_image_url }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person-circle-outline" size={64} color="#B0B0B0" />
              )}
              <TouchableOpacity style={styles.avatarEditBtn}>
                <Ionicons name="pencil" size={14} color="#1A1D1F" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user.name || 'Mohammed Azhar'}</Text>
              <Text style={styles.profileEmail}>{user.email || 'azharweb90@gmail.com'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </View>
          {/* Account Section */}
          <Text style={styles.sectionLabel}>Account</Text>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Notifications</Text>
                <Text style={styles.rowDesc}>Push notifications</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="settings-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Settings</Text>
                <Text style={styles.rowDesc}>you can edit other settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          {/* Help & Support Section */}
          <Text style={styles.sectionLabel}>Help & Support</Text>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="calendar-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Raise a Ticket</Text>
                <Text style={styles.rowDesc}>We are here to help you 24 / 7</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
                <Text style={styles.rowDesc}>Security Notifications</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Terms & Conditions</Text>
                <Text style={styles.rowDesc}>Cancellation Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>FAQs.</Text>
                <Text style={styles.rowDesc}>Get in touch with us</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          {/* Logout */}
          <TouchableOpacity style={[styles.row, { marginTop: 8 }] }>
            <View style={styles.rowLeft}>
              <Ionicons name="power-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Logout</Text>
                <Text style={styles.rowDesc}>We will wait for you</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: 600,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  profileEmail: {
    color: '#6B7280',
    fontSize: 14,
  },
  sectionLabel: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowTitle: {
    fontWeight: '700',
    color: '#1A1D1F',
    fontSize: 15,
  },
  rowDesc: {
    color: '#6B7280',
    fontSize: 13,
  },
});

export default AccountModal; 