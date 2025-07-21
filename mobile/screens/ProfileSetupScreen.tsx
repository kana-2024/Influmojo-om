import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import CustomDropdown from '../components/CustomDropdown';
import { profileAPI, authAPI } from '../services/apiService';
import OtpModal from '../components/modals/OtpModal';
import DatePickerModal from '../components/modals/DatePickerModal';
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
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('500023');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load user profile to determine signup method
  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getUserProfile();
      setUserProfile(profile.user);
      
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
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Default to showing email field if profile loading fails
      setIsGoogleUser(false);
    }
  };

  // Date picker functions
  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    setDob(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }));
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Sample states and cities
  const states = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala'];
  const cities: { [key: string]: string[] } = {
    'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Guntur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode']
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

    if (!dob.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    if (!state.trim()) {
      Alert.alert('Error', 'Please select your state');
      return;
    }

    if (!city.trim()) {
      Alert.alert('Error', 'Please select your city');
      return;
    }

    if (!pincode.trim()) {
      Alert.alert('Error', 'Please enter your pincode');
      return;
    }

    setLoading(true);
    try {
      const requestData: any = {
        gender,
        dob: selectedDate ? selectedDate.toISOString().split('T')[0] : dob.trim(),
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim()
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
      }
      await profileAPI.updateBasicInfo(requestData);

      Alert.alert('Success', 'Basic info saved successfully!', [
        { text: 'OK', onPress: () => {
          // Navigate to appropriate preferences based on user type
          const userType = userProfile?.user_type || 'creator';
          if (userType === 'brand') {
            navigation.navigate('BrandPreferences');
          } else {
            navigation.navigate('CreatorPreferences');
          }
        }}
      ]);
    } catch (error) {
      console.error('Save basic info error:', error);
      Alert.alert('Error', 'Failed to save basic info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone verification success
  const handlePhoneVerified = (verifiedPhone: string) => {
    setPhone(verifiedPhone);
    setShowOtpModal(false);
  };

  // Handle send OTP button press
  const handleSendOtp = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number first');
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
    setShowOtpModal(true);
  };

  // Handle verify email button press
  const handleVerifyEmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    // For now, we'll use Google OAuth to verify the email
    // This will open Google Sign-In to verify the email
    handleGoogleEmailVerification();
  };

  // Handle Google email verification
  const handleGoogleEmailVerification = async () => {
    try {
      const result = await googleAuthService.signIn();
      
      if (result.success && result.user && result.idToken) {
        // Check if the Google email matches the entered email
        if (result.user.email.toLowerCase() === email.trim().toLowerCase()) {
          // Email verified successfully
          Alert.alert('Success', 'Email verified successfully!');
          setEmail(result.user.email); // Update with verified email
        } else {
          Alert.alert('Error', 'Email verification failed. The Google account email does not match the entered email.');
        }
      } else {
        Alert.alert('Error', 'Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Google email verification error:', error);
      Alert.alert('Error', 'Email verification failed. Please try again.');
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
          Just a few more details to complete your profile. This helps us personalize your experience and keep your account secure.
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
            {/* Phone Number for Google users (they need to verify phone) */}
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#B0B0B0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleSendOtp}
              >
                <Text style={styles.verifyButtonText}>Send OTP</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emailWarningBox}>
              <Ionicons name="warning-outline" size={16} color="#FF9900" style={{ marginRight: 6 }} />
              <Text style={styles.emailWarningText}>
                Please verify your phone number
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Email for Phone users (they need to verify email) */}
            <Text style={styles.sectionTitle}>Email ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. azharweb90@gmail.com"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerifyEmail}
              >
                <Text style={styles.verifyButtonText}>Verify Email</Text>
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
            style={[styles.input, { flex: 1 }]}
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

        {/* State */}
        <Text style={styles.sectionTitle}>State</Text>
        <CustomDropdown value={state} setValue={s => { setState(s); setCity(''); }} options={states} />

        {/* City */}
        <Text style={styles.sectionTitle}>City</Text>
        <CustomDropdown value={city} setValue={setCity} options={state ? cities[state] || [] : []} />

        {/* Pincode */}
        <Text style={styles.sectionTitle}>pincode</Text>
        <TextInput
          style={styles.input}
          placeholder="500023"
          placeholderTextColor="#B0B0B0"
          value={pincode}
          onChangeText={setPincode}
        />

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleSaveBasicInfo}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : 'Next 2 / 2'}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  progressBarContainer: { height: 8, width: '100%', marginTop: 8, marginBottom: 4, position: 'relative' },
  progressBarBg: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '100%',
    backgroundColor: '#E5E7EB', borderRadius: 4,
  },
  progressBarFill: {
    position: 'absolute', left: 0, top: 0, height: 8, width: '50%',
    backgroundColor: '#FF6B2C', borderRadius: 4, zIndex: 1,
  },
  progressPercent: { alignSelf: 'flex-end', color: '#6B7280', fontSize: 13, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1D1F', marginTop: 18, marginBottom: 6 },
  genderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 16 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 6,
  },
  radioOuterSelected: { borderColor: '#2563EB', backgroundColor: '#E6F0FF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB' },
  radioLabel: { fontSize: 15, color: '#1A1D1F', fontWeight: '400' },
  input: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, marginBottom: 8, minHeight: 48,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', marginBottom: 8, gap: 8 },
  calendarIcon: { position: 'absolute', right: 12, top: 12 },
  dropdownIcon: { position: 'absolute', right: 16, top: 18 },
  verifyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emailWarningBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4ED',
    borderRadius: 8, padding: 8, marginBottom: 8,
  },
  emailWarningText: { color: '#FF9900', fontSize: 13, flex: 1, flexWrap: 'wrap' },
  errorText: { color: '#FF3B30', fontSize: 13, marginBottom: 8 },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B2C', borderRadius: 8, paddingVertical: 14, marginTop: 16, marginBottom: 8,
  },
  nextButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
}); 