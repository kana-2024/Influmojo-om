import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KycModalProps {
  onClose: () => void;
  onBack: () => void;
  onNext?: () => void;
}

const KycModal: React.FC<KycModalProps> = ({ onClose, onBack }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<'aadhaar' | 'pan' | null>(null);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToStep = (nextStep: 1 | 2) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  // Simulate upload for demo
  const handleUpload = (side: 'front' | 'back') => {
    if (side === 'front') setFrontUploaded(true);
    if (side === 'back') setBackUploaded(true);
  };

  // Step 1: Choose ID proof
  const renderStep1 = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.header}>Choose your ID proof</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.infoText}>
        Your details are secured with us! We never share your Proofs details to any third party.
      </Text>
      <View style={styles.proofRow}>
        <TouchableOpacity
          style={[styles.proofCard, selected === 'aadhaar' && styles.proofCardSelected]}
          onPress={() => setSelected('aadhaar')}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={24} color={selected === 'aadhaar' ? '#2D5BFF' : '#6B7280'} style={{ marginBottom: 8 }} />
          <Text style={[styles.proofCardText, selected === 'aadhaar' && styles.proofCardTextSelected]}>Aadhaar Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.proofCard, selected === 'pan' && styles.proofCardSelected]}
          onPress={() => setSelected('pan')}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={24} color={selected === 'pan' ? '#2D5BFF' : '#6B7280'} style={{ marginBottom: 8 }} />
          <Text style={[styles.proofCardText, selected === 'pan' && styles.proofCardTextSelected]}>Pan Card</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, !selected && { opacity: 0.5 }]}
          onPress={() => selected && goToStep(2)}
          disabled={!selected}
        >
          <Text style={styles.submitBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Step 2: Upload ID proof
  const renderStep2 = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => goToStep(1)}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.header}>Upload ID proof</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.infoText}>
        You can upload the front picture of your proof and back
      </Text>
      <View style={styles.uploadRow}>
        <TouchableOpacity
          style={[styles.uploadCard, frontUploaded && styles.uploadCardUploaded]}
          onPress={() => handleUpload('front')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={frontUploaded ? '#2DD36F' : '#2D5BFF'} style={{ marginBottom: 8 }} />
          <Text style={[styles.uploadCardText, frontUploaded && styles.uploadCardTextUploaded]}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.uploadCard, backUploaded && styles.uploadCardUploaded]}
          onPress={() => handleUpload('back')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={backUploaded ? '#2DD36F' : '#2D5BFF'} style={{ marginBottom: 8 }} />
          <Text style={[styles.uploadCardText, backUploaded && styles.uploadCardTextUploaded]}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, !(frontUploaded && backUploaded) && { opacity: 0.5 }]}
          onPress={() => (frontUploaded && backUploaded) && onClose()}
          disabled={!(frontUploaded && backUploaded)}
        >
          <Text style={styles.submitBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12, opacity: fadeAnim }]}> 
        {step === 1 ? renderStep1() : renderStep2()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
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
    paddingHorizontal: 0,
    paddingBottom: 0,
    minHeight: 260,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    marginBottom: 8,
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
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  infoText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 18,
    marginHorizontal: 24,
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  proofCard: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#F3F7FF',
  },
  proofCardSelected: {
    borderColor: '#2D5BFF',
    backgroundColor: '#E6F0FF',
  },
  proofCardText: {
    color: '#2D5BFF',
    fontWeight: '600',
    fontSize: 15,
  },
  proofCardTextSelected: {
    color: '#1A1D1F',
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: '#F3F7FF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#F3F7FF',
  },
  uploadCardUploaded: {
    borderColor: '#2DD36F',
    backgroundColor: '#E6FFEF',
  },
  uploadCardText: {
    color: '#2D5BFF',
    fontWeight: '600',
    fontSize: 15,
  },
  uploadCardTextUploaded: {
    color: '#2DD36F',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#2D5BFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default KycModal; 