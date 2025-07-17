import React, { useState, useRef, useEffect, FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, StatusBar, Platform, Pressable, Dimensions, LayoutRectangle, findNodeHandle, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDropdownDefault from '../components/CustomDropdown';

const platforms = ['Instagram', 'Facebook', 'Youtube', 'Snapchat'];
const contentTypes = ['Reel', 'Story', 'Feed post', 'Carousel Post'];
const durations1 = ['1 Minute', '2 Minutes', '3 Minutes'];
const durations2 = ['30 Seconds', '45 Seconds', '1 Minute'];

interface CreatePackageScreenProps {
  navigation?: any;
  onClose?: () => void;
  CustomDropdown?: FC<any>;
}

const CreatePackageScreen: React.FC<CreatePackageScreenProps> = ({ navigation, onClose = () => navigation?.goBack?.(), CustomDropdown }) => {
  const insets = useSafeAreaInsets();
  useEffect(() => {
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('Reel');
  const [quantity, setQuantity] = useState('1');
  const [revisions, setRevisions] = useState('1');
  const [duration1, setDuration1] = useState('1 Minute');
  const [duration2, setDuration2] = useState('30 Seconds');
  const [price, setPrice] = useState('50000');
  const [desc, setDesc] = useState('');

  const Dropdown = CustomDropdown || CustomDropdownDefault;

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <View style={[styles.safeArea, { paddingTop: insets.top + 8 }]}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <Text style={styles.header}>Create Package</Text>
            <TouchableOpacity style={[styles.closeBtn, { flex: 1, alignItems: 'flex-end' }]} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={event => {
              const y = event.nativeEvent.contentOffset.y;
              setScrolled(y > 10);
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.label}>Choose platform*</Text>
            <Dropdown value={platform} setValue={setPlatform} options={platforms} />

            <Text style={styles.label}>Select Content type*</Text>
            <Dropdown value={contentType} setValue={setContentType} options={contentTypes} />

            <Text style={styles.label}>Quantity*</Text>
            <Dropdown value={quantity} setValue={setQuantity} options={['1', '2', '3', '4', '5']} />

            <Text style={styles.label}>Revisions</Text>
            <TextInput style={styles.input} value={revisions} onChangeText={setRevisions} keyboardType="numeric" />

            <Text style={styles.label}>Duration*</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              <View style={{ flex: 1 }}>
                <Dropdown value={duration1} setValue={setDuration1} options={durations1} />
              </View>
              <View style={{ flex: 1 }}>
                <Dropdown value={duration2} setValue={setDuration2} options={durations2} />
              </View>
            </View>

            <Text style={styles.label}>Price (INR)*</Text>
            <Dropdown value={price} setValue={setPrice} options={['50000', '100000', '200000']} />

            <Text style={styles.label}>Brief Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Brief description of your package has to be add here."
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Changed from '#EFF3F5' to transparent
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  card: {
    flex: 1.2, // Make the card a bit taller (was 1)
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    marginBottom: 8,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flex: 2,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1D1F',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  form: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
    overflow: 'visible', // Allow dropdowns to overflow
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1D1F'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    fontSize: 15,
    marginBottom: 24,
    backgroundColor: '#F8F9FB',
    color: '#1A1D1F',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 0,
    position: 'relative',
    zIndex: 10, // Ensure dropdown container is above others
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 2,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ffcba9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFF4F0',
  },
  cancelBtnText: {
    color: '#FF6B2C',
    fontWeight: '700',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dropdownListModal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 10000,
  },
});

export default CreatePackageScreen; 