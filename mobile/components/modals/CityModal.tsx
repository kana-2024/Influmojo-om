import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../config/colors';

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  selectedCity?: string;
}

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 
  'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 
  'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 
  'Solapur', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 
  'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Saharanpur', 
  'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 
  'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 
  'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Jamnagar', 'Ujjain', 'Siliguri',
  'Jhansi', 'Jammu', 'Mangalore', 'Erode', 'Belgaum', 'Tirunelveli', 'Gaya', 'Jalgaon', 
  'Udaipur', 'Tirupur', 'Kozhikode', 'Kurnool', 'Bokaro', 'Bellary', 'Patiala', 
  'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Latur', 'Dhule', 'Rohtak', 'Korba',
  'Bhilwara', 'Brahmapur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Kadapa', 
  'Bilaspur', 'Satara', 'Bijapur', 'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh', 
  'Thrissur', 'Alwar', 'Bardhaman', 'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 
  'Tumkur', 'Hisar', 'Bihar Sharif', 'Panipat', 'Darbhanga', 'Aizawl', 'Dewas', 
  'Tirupati', 'Karnal', 'Bathinda', 'Shivpuri', 'Ratlam', 'Modinagar', 'Pali', 
  'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Katihar', 'Nagercoil',
  'Thanjavur', 'Hajipur', 'Sasaram', 'Hospet', 'Vellore', 'Mirzapur', 'Secunderabad', 
  'Pudukkottai', 'Shimla', 'Bharatpur', 'Sonipat', 'Farrukhabad', 'Sagar', 'Durg', 
  'Imphal', 'Hapur', 'Arrah', 'Karimnagar', 'Anantapur', 'Etawah', 'Ambernath', 
  'Begusarai', 'New Delhi', 'Chhapra', 'Satna', 'Vizianagaram', 'Hardwar', 'Proddatur', 
  'Machilipatnam', 'Bettiah', 'Purulia', 'Hassan', 'Baidyabati', 'Raigarh', 'Adra', 
  'Bhusawal', 'Bahraich', 'Vasco da Gama', 'Vapi'
];

const CityModal: React.FC<CityModalProps> = ({ visible, onClose, onSelectCity, selectedCity }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return CITIES;
    }
    return CITIES.filter(city => 
      city.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text style={styles.headerTitle}>Select City</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Search Input - Modified to prevent keyboard */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities..."
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
        
        {/* City List */}
        <ScrollView 
          style={styles.cityList}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          contentContainerStyle={styles.cityListContent}
          keyboardShouldPersistTaps="handled"
        >
          {filteredCities.map(city => (
            <TouchableOpacity
              key={city}
              style={styles.cityItem}
              onPress={() => {
                onSelectCity(city);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.cityText,
                selectedCity === city && styles.selectedCityText
              ]}>
                {city}
              </Text>
              {selectedCity === city && (
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
    backgroundColor: '#f8f4e8',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  cityList: {
    flex: 1,
  },
  cityListContent: {
    paddingBottom: 20,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cityText: {
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '400',
  },
  selectedCityText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default CityModal; 
