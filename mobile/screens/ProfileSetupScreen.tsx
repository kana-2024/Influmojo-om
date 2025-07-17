import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import CustomDropdown from '../components/CustomDropdown';

export default function ProfileSetupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('500023');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
  }, []);

  // Sample states and cities
  const states = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala'];
  const cities: { [key: string]: string[] } = {
    'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Guntur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode']
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
        <Text style={styles.progressPercent}>90%</Text>

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

        {/* Email */}
        <Text style={styles.sectionTitle}>Email ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. azharweb90@gmail.com"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.emailWarningBox}>
          <Ionicons name="warning-outline" size={16} color="#FF9900" style={{ marginRight: 6 }} />
          <Text style={styles.emailWarningText}>
            please verify your email
          </Text>
        </View>

        {/* DOB */}
        <Text style={styles.sectionTitle}>DOB</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="12/02/1990"
            placeholderTextColor="#B0B0B0"
            value={dob}
            onChangeText={setDob}
          />
          <TouchableOpacity style={styles.calendarIcon}>
            <Ionicons name="calendar-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>Field is required</Text>

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
        <Text style={styles.errorText}>Field is required</Text>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {navigation.navigate('ProfileComplete')}}
        >
          <Text style={styles.nextButtonText}>Next 2 / 2</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
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
    position: 'absolute', left: 0, top: 0, height: 8, width: '90%',
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
  inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', marginBottom: 8 },
  calendarIcon: { position: 'absolute', right: 12, top: 12 },
  dropdownIcon: { position: 'absolute', right: 16, top: 18 },
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