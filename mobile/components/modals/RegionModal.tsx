import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RegionModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyChanges: (selectedStates: string[], selectedCities: string[]) => void;
  initialSelectedStates?: string[];
  initialSelectedCities?: string[];
}

const RegionModal: React.FC<RegionModalProps> = ({
  visible,
  onClose,
  onApplyChanges,
  initialSelectedStates = [],
  initialSelectedCities = []
}) => {
  const [selectedStates, setSelectedStates] = useState<string[]>(initialSelectedStates);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialSelectedCities);
  const [showStateSection, setShowStateSection] = useState(true);
  const [showCitySection, setShowCitySection] = useState(false);
  const [stateSearchText, setStateSearchText] = useState('');

  const states = [
    'Telangana', 'Andhra Pradesh', 'Maharashtra', 'Assam', 'Arunachal Pradesh', 
    'Bihar', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat', 'Rajasthan', 
    'Madhya Pradesh', 'Uttar Pradesh', 'West Bengal', 'Odisha', 'Jharkhand',
    'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand', 'Punjab', 'Haryana',
    'Delhi', 'Goa', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim',
    'Tripura', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep'
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur',
    'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh',
    'Solapur', 'Hubballi-Dharwad', 'Bareilly', 'Moradabad', 'Mysore',
    'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar',
    'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur',
    'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack',
    'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur',
    'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola',
    'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
    'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode',
    'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon',
    'Udaipur', 'Maheshtala', 'Tiruppur', 'Davanagere', 'Kozhikode',
    'Akron', 'Kurnool', 'Rajpur Sonarpur', 'Bokaro', 'South Dumdum',
    'Bellary', 'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar',
    'Bhatpara', 'Panihati', 'Latur', 'Dhule', 'Rohtak', 'Korba', 'Bhilwara',
    'Berhampur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi',
    'Kadapa', 'Kamarhati', 'Bilaspur', 'Shahjahanpur', 'Satara', 'Bijapur',
    'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar',
    'Bardhaman', 'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 'Tumkur',
    'Hisar', 'Ozhukarai', 'Bihar Sharif', 'Panipat', 'Darbhanga', 'Bally',
    'Aizawl', 'Dewas', 'Ichalkaranji', 'Tirupati', 'Karnal', 'Bathinda',
    'Rampur', 'Shivpuri', 'Rewa', 'Puducherry', 'Gandhinagar', 'Sagar',
    'Thanjavur', 'Karimnagar', 'Tiruvottiyur', 'Nagaon', 'Bharatpur',
    'Begusarai', 'New Delhi', 'Gandhidham', 'Baranagar', 'Tiruvannamalai',
    'Puducherry', 'Sikar', 'Thoothukkudi', 'Rewa', 'Mirzapur', 'Raichur',
    'Pali', 'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Katihar',
    'Nagercoil', 'Sri Ganganagar', 'Karawal Nagar', 'Mango', 'Thane',
    'Nanded-Waghala', 'Durg', 'Imphal', 'Ratlam', 'Hapur', 'Arcot',
    'Anantapur', 'Karur', 'Parbhani', 'Etawah', 'Bharatpur', 'Begusarai',
    'New Delhi', 'Gandhidham', 'Baranagar', 'Tiruvannamalai', 'Puducherry',
    'Sikar', 'Thoothukkudi', 'Rewa', 'Mirzapur', 'Raichur', 'Pali',
    'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Katihar',
    'Nagercoil', 'Sri Ganganagar', 'Karawal Nagar', 'Mango', 'Thane',
    'Nanded-Waghala', 'Durg', 'Imphal', 'Ratlam', 'Hapur', 'Arcot'
  ];

  useEffect(() => {
    setSelectedStates(initialSelectedStates);
    setSelectedCities(initialSelectedCities);
  }, [initialSelectedStates, initialSelectedCities]);

  const handleStateToggle = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleResetToDefaults = () => {
    setSelectedStates([]);
    setSelectedCities([]);
  };

  const handleApplyChanges = () => {
    onApplyChanges(selectedStates, selectedCities);
    onClose();
  };

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.regionSheet}>
        {/* Header */}
        <View style={styles.regionHeader}>
          <Text style={styles.regionTitle}>Sort By Region</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.regionContent} showsVerticalScrollIndicator={false}>
          {/* Region Label */}
          <Text style={styles.regionLabel}>Region</Text>

          {/* State Section */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowStateSection(!showStateSection)}
            >
              <Text style={styles.sectionTitle}>State</Text>
              <Ionicons 
                name={showStateSection ? "remove" : "add"} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            
            {showStateSection && (
              <View style={styles.sectionContent}>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={16} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search State"
                    value={stateSearchText}
                    onChangeText={setStateSearchText}
                    editable={false}
                    showSoftInputOnFocus={false}
                    contextMenuHidden={true}
                    selectTextOnFocus={false}
                    onPressIn={() => {
                      // When user taps the search input, we can show a different UI or handle differently
                      // For now, we'll just allow the search to work without keyboard
                    }}
                  />
                </View>
                
                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  {filteredStates.slice(0, 10).map((state) => (
                    <TouchableOpacity
                      key={state}
                      style={styles.optionRow}
                      onPress={() => handleStateToggle(state)}
                    >
                      <Text style={styles.optionText}>{state}</Text>
                      <View style={[
                        styles.checkbox,
                        selectedStates.includes(state) && styles.checkboxSelected
                      ]}>
                        {selectedStates.includes(state) && (
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {filteredStates.length > 10 && (
                    <TouchableOpacity style={styles.viewAllButton}>
                      <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* City Section */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowCitySection(!showCitySection)}
            >
              <Text style={styles.sectionTitle}>City</Text>
              <Ionicons 
                name={showCitySection ? "remove" : "add"} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            
            {showCitySection && (
              <View style={styles.sectionContent}>
                <Text style={styles.comingSoonText}>City selection coming soon...</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
            <Text style={styles.resetButtonText}>Reset to defaults</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyChanges}>
            <Text style={styles.applyButtonText}>Apply Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  regionSheet: {
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
    zIndex: 1000,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  regionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  regionContent: {
    flex: 1,
  },
  regionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20536d',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#20536d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#20536d',
    backgroundColor: '#FFFFFF', // Changed from '#F5F5F5' to '#FFFFFF'
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  optionsList: {
    maxHeight: 200,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FD5D27',
    borderColor: '#FD5D27',
  },
  viewAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  comingSoonText: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FD5D27',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FD5D27',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FD5D27',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RegionModal; 
