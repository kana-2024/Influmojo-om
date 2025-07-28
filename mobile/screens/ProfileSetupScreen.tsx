import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import CustomDropdown from '../components/CustomDropdown';
import CityModal from '../components/modals/CityModal';
import * as apiService from '../services/apiService';
import OtpModal from '../components/modals/OtpModal';
import DatePickerModal from '../components/modals/DatePickerModal';
import GoogleVerificationModal from '../components/modals/GoogleVerificationModal';
import googleAuthService from '../services/googleAuth';

export default function ProfileSetupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);


  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [googleVerifying, setGoogleVerifying] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);



  // Load user profile to determine signup method
  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await apiService.authAPI.getUserProfile();
      setUserProfile(profile.user);
      
      console.log('🔍 ProfileSetupScreen: User profile loaded:', {
        user_type: profile.user?.user_type,
        auth_provider: profile.user?.auth_provider
      });
      
      // Determine if user signed up with Google
      const isGoogle = profile.user?.auth_provider === 'google';
      setIsGoogleUser(isGoogle);
      
      // Pre-fill the field based on signup method
      if (isGoogle) {
        // Google user - show phone field, pre-fill email if available
        setEmail(profile.user?.email || '');
      } else {
        // Phone user - show email field, pre-fill phone if available
        setPhone(profile.user?.phone || '');
      }
      
      // Debug: Check if JWT token is present
      const { getToken } = await import('../services/storage');
      const token = await getToken();
      console.log('[ProfileSetupScreen] loadUserProfile - JWT token present:', !!token, 'length:', token?.length || 0);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Default to showing email field if profile loading fails
      setIsGoogleUser(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Date picker functions
  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    setDob(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }));
    setAge(calculateAge(date));
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };



  // Save basic info to database
  const handleSaveBasicInfo = async () => {
    // Validate based on signup method
    if (isGoogleUser) {
      // Google user - validate phone
      if (!phone.trim()) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      
      // Format phone number to ensure it has +91 prefix
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+91')) {
        if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
          formattedPhone = '+' + formattedPhone;
        } else if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else {
          Alert.alert('Error', 'Please enter a valid 10-digit phone number');
          return;
        }
      }
      
      if (!/^\+91\d{10}$/.test(formattedPhone)) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        return;
      }
      
      setPhone(formattedPhone);
    } else {
      // Phone user - validate email
      if (!email.trim()) {
        Alert.alert('Error', 'Please enter your email address');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    // Validate required fields
    if (!gender.trim()) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Error', 'Please select your date of birth');
      return;
    }
    
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return;
    }

    setLoading(true);
    try {
      const requestData: any = {
        gender,
        dob: selectedDate.toISOString().split('T')[0],
        city: city.trim()
      };

      // Only add email/phone if they have values and are different from existing
      if (isGoogleUser) {
        if (phone.trim()) {
          requestData.phone = phone.trim();
        }
        // Don't send email for Google users as it's already set during signup
      } else {
        if (email.trim()) {
          requestData.email = email.trim();
        }
        // Don't send phone for phone users as it's already set during signup
      }

      if (__DEV__) {
        console.log('Sending basic info data:', requestData);
        console.log('🔍 Debug: selectedDate:', selectedDate);
        console.log('🔍 Debug: dob format:', selectedDate.toISOString().split('T')[0]);
        console.log('🔍 Debug: gender:', gender);
        console.log('🔍 Debug: city:', city.trim());
      }
      await apiService.profileAPI.updateBasicInfo(requestData);

      Alert.alert('Success', 'Basic info saved successfully!', [
        { text: 'OK', onPress: () => {
          // Navigate to creator preferences
          navigation.navigate('CreatorPreferences');
        }}
      ]);
    } catch (error) {
      console.error('Save basic info error:', error);
      Alert.alert('Error', 'Failed to save basic info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerified = (result: any) => {
    console.log('Verified phone result:', result);
    
    // Extract phone number from the result
    let verifiedPhone = '';
    if (result && result.user && result.user.phone) {
      verifiedPhone = result.user.phone;
    } else if (result && result.phone) {
      verifiedPhone = result.phone;
    } else {
      // If no phone in result, use the phone that was passed to OTP modal
      verifiedPhone = phone;
    }
    
    // Ensure phone number has +91 prefix
    if (verifiedPhone && !verifiedPhone.startsWith('+91')) {
      if (verifiedPhone.startsWith('91') && verifiedPhone.length === 12) {
        verifiedPhone = '+' + verifiedPhone;
      } else if (verifiedPhone.length === 10) {
        verifiedPhone = '+91' + verifiedPhone;
      }
    }
    
    console.log('Setting verified phone in state:', verifiedPhone);
    setPhone(verifiedPhone);
    setIsPhoneVerified(true);
    setShowOtpModal(false);
    
    // Don't auto-save - let user fill all fields and click Next manually
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number first');
      return;
    }

    try {
      await apiService.authAPI.sendOTP(phone.trim());
      setShowOtpModal(true);
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyEmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // For now, just show a success message and continue
    Alert.alert('Success', 'Email verification sent! Please check your inbox.', [
      { text: 'OK' }
    ]);
  };

  const handleGoogleEmailVerification = async () => {
    try {
      setGoogleVerifying(true);
      
      // Add a small delay to show the verification modal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await googleAuthService.signIn();
      if (result.success && result.user && result.user.email) {
        setEmail(result.user.email);
        Alert.alert('Success', 'Google account verified! Your email has been updated.', [
          { text: 'OK' }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google email verification error:', error);
      Alert.alert('Error', 'Failed to verify email with Google. Please try again.');
    } finally {
      setGoogleVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top || 20, flexGrow: 1 }
        ]}
        keyboardShouldPersistTaps="handled"
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          setScrolled(y > 10);
        }}
        scrollEventThrottle={16}
      >
        {/* Heading and Explanation */}
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1D1F', marginTop: 8, marginBottom: 4, textAlign: 'left' }}>You're almost there!</Text>
        <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 12, textAlign: 'left' }}>
          Just a few more details to complete your creator profile. This helps us personalize your experience and keep your account secure.
        </Text>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg} />
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressPercent}>50%</Text>

        {/* Gender */}
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.radioBtn}
              onPress={() => setGender(opt)}
            >
              <View style={[styles.radioOuter, gender === opt && styles.radioOuterSelected]}>
                {gender === opt && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Field based on signup method */}
        {isGoogleUser ? (
          <>
            {/* Email for Google users (already verified) */}
            <Text style={styles.sectionTitle}>Email ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: '#F8F9FA', color: '#6B7280' }]}
                value={email}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor="#B0B0B0"
              />
              <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                <Ionicons name="checkmark-circle" size={22} color="#11714f" />
              </View>
            </View>
            <View style={styles.emailWarningBox}>
              <Ionicons name="information-circle-outline" size={16} color="#11714f" style={{ marginRight: 6 }} />
              <Text style={[styles.emailWarningText, { color: '#11714f' }]}>Your email is verified via Google</Text>
            </View>
            {/* Phone Number for Google users (they need to verify phone) */}
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: isPhoneVerified ? '#F8F9FA' : '#F5F5F5', color: isPhoneVerified ? '#6B7280' : '#1A1D1F', marginBottom: 0 }]} 
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#B0B0B0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isPhoneVerified}
                selectTextOnFocus={!isPhoneVerified}
              />
              {isPhoneVerified ? (
                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                  <Ionicons name="checkmark-circle" size={22} color="#11714f" />
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={handleSendOtp}
                >
                  <Text style={styles.verifyButtonText}>Send OTP</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.emailWarningBox}>
              {isPhoneVerified ? (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#11714f" style={{ marginRight: 6 }} />
                  <Text style={[styles.emailWarningText, { color: '#11714f' }]}>Your phone number is verified</Text>
                </>
              ) : (
                <>
                  <Ionicons name="warning-outline" size={16} color="#FF9900" style={{ marginRight: 6 }} />
                  <Text style={styles.emailWarningText}>
                    Please verify your phone number
                  </Text>
                </>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Email for Phone users (verify via Google OAuth) */}
            <Text style={styles.sectionTitle}>Email ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g. xxxxxstill sayin@gmail.com"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TouchableOpacity 
                style={[styles.verifyButton, googleVerifying && styles.verifyButtonDisabled]}
                onPress={handleGoogleEmailVerification}
                disabled={googleVerifying}
              >
                <Text style={styles.verifyButtonText}>{googleVerifying ? 'Verifying...' : 'Verify Email'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emailWarningBox}>
              <Ionicons name="warning-outline" size={16} color="#FF9900" style={{ marginRight: 6 }} />
              <Text style={styles.emailWarningText}>
                Please verify your email address
              </Text>
            </View>
          </>
        )}

        {/* DOB */}
        <Text style={styles.sectionTitle}>Date of Birth</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#B0B0B0"
            value={selectedDate ? formatDate(selectedDate) : ''}
            editable={false}
          />
          <TouchableOpacity 
            style={styles.calendarIcon}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        
        {/* Age Display */}
        {age !== null && (
          <View style={styles.ageContainer}>
            <Text style={styles.ageText}>Age: {age} years</Text>
          </View>
        )}

        {/* City */}
        <Text style={styles.sectionTitle}>City</Text>
        <TouchableOpacity 
          style={styles.cityDropdown}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.7}
        >
          <Text style={city ? styles.cityDropdownText : styles.cityDropdownPlaceholder}>
            {city || 'Select your city'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, (loading || profileLoading) && { opacity: 0.7 }]}
          onPress={handleSaveBasicInfo}
          disabled={loading || profileLoading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : profileLoading ? 'Loading...' : 'Next 1 / 2'}
          </Text>
          {!loading && !profileLoading && <Ionicons name="arrow-forward" size={20} color="#f8f4e8" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </ScrollView>

      {/* Overlays for modals */}
      {showOtpModal && (
        <View style={styles.modalOverlay} />
      )}
      {showDatePicker && (
        <View style={styles.modalOverlay} />
      )}
      {googleVerifying && (
        <View style={styles.modalOverlay} />
      )}
      {showCityModal && (
        <View style={styles.modalOverlay} />
      )}
      


      {/* OTP Modal for phone verification */}
      <OtpModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handlePhoneVerified}
        phone={phone}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelected={handleDateSelected}
        currentDate={selectedDate || new Date()}
        title="Select Date of Birth"
      />

      {/* Google Verification Modal */}
      <GoogleVerificationModal
        visible={googleVerifying}
        onClose={() => setGoogleVerifying(false)}
      />

      {/* City Modal */}
      <CityModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelectCity={setCity}
        selectedCity={city}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4e8' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  progressBarContainer: { height: 8, width: '100%', marginTop: 8, marginBottom: 4, position: 'relative' },
  progressBarBg: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '100%',
    backgroundColor: '#E5E7EB', borderRadius: 4,
  },
  progressBarFill: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '50%',
    backgroundColor: '#f37135', borderRadius: 4, zIndex: 1,
  },
  progressPercent: { alignSelf: 'flex-end', color: '#6B7280', fontSize: 13, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginTop: 18, marginBottom: 6 },
  genderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 16 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#f37135', alignItems: 'center', justifyContent: 'center', marginRight: 6,
  },
  radioOuterSelected: { borderColor: '#f37135', backgroundColor: 'rgba(243, 113, 53, 0.1)' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f37135' },
  radioLabel: { fontSize: 15, color: '#1A1D1F', fontWeight: '400' },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 8, minHeight: 48,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', marginBottom: 8, gap: 8 },
  calendarIcon: { position: 'absolute', right: 12, top: 12 },
  dropdownIcon: { position: 'absolute', right: 16, top: 18 },
  verifyButton: {
    backgroundColor: '#20536d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#f8f4e8',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  emailWarningBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    borderRadius: 8, padding: 8, marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailWarningText: { color: '#FF9900', fontSize: 13, flex: 1, flexWrap: 'wrap' },
  errorText: { color: '#FF3B30', fontSize: 13, marginBottom: 8 },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f37135', borderRadius: 8, paddingVertical: 14, marginTop: 16, marginBottom: 8,
  },
  nextButtonText: { color: '#f8f4e8', fontWeight: '600', fontSize: 16 },
  dropdownList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: -8,
    marginBottom: 8,
    maxHeight: 150,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1A1D1F',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },

  ageContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ageText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    minHeight: 48,
  },
  cityDropdownText: {
    fontSize: 15,
    color: '#1A1D1F',
    fontWeight: '400',
  },
  cityDropdownPlaceholder: {
    fontSize: 15,
    color: '#B0B0B0',
    fontWeight: '400',
  },

}); 
