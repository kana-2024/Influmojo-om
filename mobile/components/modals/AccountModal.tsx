import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { clearToken, clearAllData } from '../../services/storage';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onKycPress?: () => void;
  onPaymentsPress?: () => void;
  user: {
    name?: string;
    email?: string;
    profile_image_url?: string;
    user_type?: string;
    role_in_organization?: string;
  };
}

const AccountModal: React.FC<AccountModalProps> = ({ visible, onClose, onKycPress, onPaymentsPress, user }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data including user data and cover image
              await clearAllData();
              
              // Dispatch logout action to clear Redux state
              dispatch(logout());
              
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
              
              // Close the modal
              onClose();
              
              console.log('[AccountModal] Logout successful - all data cleared');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

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
            <Text style={styles.headerTitle}>{user.name || 'Account'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color="#1A1D1F" />
            </TouchableOpacity>
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
              <Text style={styles.profileName}>{user.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.role_in_organization || 'no role'}</Text>
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
          
          <TouchableOpacity style={styles.row} onPress={onKycPress}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>KYC Verification</Text>
                <Text style={styles.rowDesc}>Verify your identity</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.row} onPress={onPaymentsPress}>
            <View style={styles.rowLeft}>
              <Ionicons name="card-outline" size={22} color="#1A1D1F" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>Payments</Text>
                <Text style={styles.rowDesc}>Manage your payments</Text>
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
          <TouchableOpacity style={[styles.row, { marginTop: 8 }]} onPress={handleLogout}>
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: '#20536d',
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
