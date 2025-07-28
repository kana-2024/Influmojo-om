import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Alert, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/apiService';
import eKycService, { AadhaarData } from '../../services/eKycService';

interface KycModalProps {
  onClose: () => void;
  onBack: () => void;
  onNext?: () => void;
}

const KycModal: React.FC<KycModalProps> = ({ onClose, onBack }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<'aadhaar' | 'pan' | 'ekyc' | null>(null);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ekycData, setEkycData] = useState<AadhaarData | null>(null);
  const [processingEkyc, setProcessingEkyc] = useState(false);
  const [showEKycGuide, setShowEKycGuide] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToStep = (nextStep: 1 | 2 | 3) => {
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

  // Handle eKYC selection with guidance
  const handleEKycSelection = () => {
    setSelected('ekyc');
    setShowEKycGuide(true);
  };

  // Handle eKYC file processing
  const handleEKycUpload = async () => {
    setProcessingEkyc(true);
    try {
      const result = await eKycService.processEKycZip();
      
      if (result.success && result.data) {
        // Validate the extracted data
        const validation = eKycService.validateAadhaarData(result.data);
        
        if (validation.isValid) {
          setEkycData(result.data);
          Alert.alert('Success', 'eKYC data extracted successfully!', [
            { text: 'OK', onPress: () => goToStep(3) }
          ]);
        } else {
          Alert.alert('Validation Error', `Please check your eKYC file:\n${validation.errors.join('\n')}`);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to process eKYC file');
      }
    } catch (error) {
      console.error('eKYC processing error:', error);
      Alert.alert('Error', 'Failed to process eKYC file. Please try again.');
    } finally {
      setProcessingEkyc(false);
    }
  };

  // Handle eKYC redirect to UIDAI website
  const handleEKycRedirect = async () => {
    try {
      await eKycService.redirectToUIDAI();
    } catch (error) {
      console.error('eKYC redirect error:', error);
      Alert.alert('Error', 'Failed to open UIDAI website. Please visit manually.');
    }
  };

  // Submit KYC to database
  const handleSubmitKYC = async () => {
    if (!selected) {
      Alert.alert('Error', 'Please select a document type');
      return;
    }

    if (selected === 'ekyc') {
      if (!ekycData) {
        Alert.alert('Error', 'Please upload and process eKYC file first');
        return;
      }
    } else {
      if (!frontUploaded || !backUploaded) {
        Alert.alert('Error', 'Please upload both front and back images');
        return;
      }
    }

    setSaving(true);
    try {
      let kycData: any = { documentType: selected };

      if (selected === 'ekyc') {
        // Submit eKYC data
        kycData = {
          documentType: 'ekyc',
          aadhaarData: ekycData,
          verificationMethod: 'offline_ekyc'
        };
      } else {
        // Submit manual upload data
        const frontImageUrl = `https://example.com/kyc/${selected}_front.jpg`;
        const backImageUrl = `https://example.com/kyc/${selected}_back.jpg`;
        kycData = {
          documentType: selected,
          frontImageUrl,
          backImageUrl
        };
      }
      
      await profileAPI.submitKYC(kycData);

      Alert.alert('Success', 'KYC submitted successfully!', [
        { text: 'OK', onPress: () => onClose() }
      ]);
    } catch (error) {
      console.error('Submit KYC error:', error);
      Alert.alert('Error', 'Failed to submit KYC. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // eKYC Guide Modal
  const renderEKycGuide = () => (
    <Modal
      visible={showEKycGuide}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEKycGuide(false)}
    >
      <View style={styles.guideOverlay}>
        <View style={styles.guideContainer}>
          <View style={styles.guideHeader}>
            <Text style={styles.guideTitle}>eKYC Process Guide</Text>
            <TouchableOpacity onPress={() => setShowEKycGuide(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.guideContent} showsVerticalScrollIndicator={false}>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Visit UIDAI Website</Text>
                <Text style={styles.stepDescription}>
                  We'll open the official UIDAI website where you can download your eKYC data.
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Download eKYC File</Text>
                <Text style={styles.stepDescription}>
                  Enter your Aadhaar number and OTP to download the encrypted zip file.
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Return to App</Text>
                <Text style={styles.stepDescription}>
                  Come back to this app and upload the downloaded zip file.
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Automatic Processing</Text>
                <Text style={styles.stepDescription}>
                  We'll extract and validate your Aadhaar data automatically.
                </Text>
              </View>
            </View>

            <View style={styles.guideBenefits}>
              <Text style={styles.benefitsTitle}>Why eKYC?</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2DD36F" />
                <Text style={styles.benefitText}>Government-verified data</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2DD36F" />
                <Text style={styles.benefitText}>No manual data entry</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2DD36F" />
                <Text style={styles.benefitText}>Faster verification</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2DD36F" />
                <Text style={styles.benefitText}>Higher success rate</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.guideActions}>
            <TouchableOpacity 
              style={styles.guideCancelBtn} 
              onPress={() => setShowEKycGuide(false)}
            >
              <Text style={styles.guideCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.guideStartBtn} 
              onPress={() => {
                setShowEKycGuide(false);
                goToStep(2);
              }}
            >
              <Text style={styles.guideStartText}>Start eKYC Process</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      <ScrollView style={styles.proofContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.proofRow}>
          <TouchableOpacity
            style={[styles.proofCard, selected === 'aadhaar' && styles.proofCardSelected]}
            onPress={() => setSelected('aadhaar')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={24} color={selected === 'aadhaar' ? '#2D5BFF' : '#6B7280'} style={{ marginBottom: 8 }} />
            <Text style={[styles.proofCardText, selected === 'aadhaar' && styles.proofCardTextSelected]}>Aadhaar Card</Text>
            <Text style={styles.proofCardSubtext}>Manual Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.proofCard, selected === 'pan' && styles.proofCardSelected]}
            onPress={() => setSelected('pan')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={24} color={selected === 'pan' ? '#2D5BFF' : '#6B7280'} style={{ marginBottom: 8 }} />
            <Text style={[styles.proofCardText, selected === 'pan' && styles.proofCardTextSelected]}>Pan Card</Text>
            <Text style={styles.proofCardSubtext}>Manual Upload</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.proofRow}>
          <TouchableOpacity
            style={[styles.proofCard, selected === 'ekyc' && styles.proofCardSelected, styles.ekycCard]}
            onPress={handleEKycSelection}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={24} color={selected === 'ekyc' ? '#2D5BFF' : '#6B7280'} style={{ marginBottom: 8 }} />
            <Text style={[styles.proofCardText, selected === 'ekyc' && styles.proofCardTextSelected]}>Offline eKYC</Text>
            <Text style={styles.proofCardSubtext}>UIDAI Zip File</Text>
            <Text style={styles.ekycBadge}>Recommended</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      {renderEKycGuide()}
    </>
  );

  // Step 2: Upload ID proof or eKYC
  const renderStep2 = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => goToStep(1)}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.header}>
          {selected === 'ekyc' ? 'Upload eKYC File' : 'Upload ID proof'}
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      {selected === 'ekyc' ? (
        // eKYC upload section
        <>
          <Text style={styles.infoText}>
            Upload the UIDAI eKYC zip file downloaded from the official UIDAI website.
          </Text>
          <View style={styles.ekycUploadSection}>
            {/* Step 1: Redirect to UIDAI */}
            <TouchableOpacity
              style={styles.ekycRedirectCard}
              onPress={handleEKycRedirect}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="globe-outline" 
                size={24} 
                color="#2D5BFF" 
                style={{ marginBottom: 8 }} 
              />
              <Text style={styles.ekycRedirectText}>Step 1: Download from UIDAI</Text>
              <Text style={styles.ekycRedirectSubtext}>Visit UIDAI website to download eKYC</Text>
            </TouchableOpacity>

            {/* Step 2: Upload the file */}
            <TouchableOpacity
              style={[styles.ekycUploadCard, ekycData && styles.uploadCardUploaded]}
              onPress={handleEKycUpload}
              disabled={processingEkyc}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={ekycData ? "checkmark-circle" : "cloud-upload-outline"} 
                size={32} 
                color={ekycData ? '#2DD36F' : '#2D5BFF'} 
                style={{ marginBottom: 12 }} 
              />
              <Text style={[styles.ekycUploadText, ekycData && styles.uploadCardTextUploaded]}>
                {processingEkyc ? 'Processing...' : ekycData ? 'eKYC Processed' : 'Step 2: Upload eKYC File'}
              </Text>
              <Text style={styles.ekycUploadSubtext}>
                {ekycData ? 'Data extracted successfully' : 'Select the downloaded zip file'}
              </Text>
            </TouchableOpacity>
            
            {ekycData && (
              <View style={styles.ekycDataPreview}>
                <Text style={styles.ekycDataTitle}>Extracted Data:</Text>
                <Text style={styles.ekycDataText}>Name: {ekycData.name}</Text>
                <Text style={styles.ekycDataText}>Aadhaar: {ekycData.uid}</Text>
                <Text style={styles.ekycDataText}>DOB: {ekycData.dateOfBirth}</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        // Manual upload section
        <>
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
        </>
      )}
      
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitBtn, 
            (
              (selected === 'ekyc' && !ekycData) || 
              (selected !== 'ekyc' && (!frontUploaded || !backUploaded)) ||
              saving
            ) && { opacity: 0.5 }
          ]}
          onPress={selected === 'ekyc' ? handleSubmitKYC : () => goToStep(3)}
          disabled={
            (selected === 'ekyc' && !ekycData) || 
            (selected !== 'ekyc' && (!frontUploaded || !backUploaded)) ||
            saving
          }
        >
          <Text style={styles.submitBtnText}>
            {selected === 'ekyc' ? (saving ? 'Submitting...' : 'Submit') : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Step 3: Review and submit (for manual uploads)
  const renderStep3 = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => goToStep(2)}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.header}>Review & Submit</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.infoText}>
        Please review your uploaded documents before submission
      </Text>
      <View style={styles.reviewSection}>
        <View style={styles.reviewItem}>
          <Ionicons name="checkmark-circle" size={20} color="#2DD36F" />
          <Text style={styles.reviewText}>Front image uploaded</Text>
        </View>
        <View style={styles.reviewItem}>
          <Ionicons name="checkmark-circle" size={20} color="#2DD36F" />
          <Text style={styles.reviewText}>Back image uploaded</Text>
        </View>
        <View style={styles.reviewItem}>
          <Ionicons name="checkmark-circle" size={20} color="#2DD36F" />
          <Text style={styles.reviewText}>Document type: {selected?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.5 }]}
          onPress={handleSubmitKYC}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>
            {saving ? 'Submitting...' : 'Submit KYC'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12, opacity: fadeAnim }]}> 
        {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#f8f4e8',
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
    maxHeight: '90%',
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
  proofContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  proofCard: {
    flex: 1,
    backgroundColor: '#f8f4e8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#f8f4e8',
    position: 'relative',
  },
  proofCardSelected: {
    borderColor: '#2D5BFF',
    backgroundColor: '#E6F0FF',
  },
  ekycCard: {
    backgroundColor: '#F0FFF4',
    borderColor: '#F0FFF4',
  },
  proofCardText: {
    color: '#2D5BFF',
    fontWeight: '600',
    fontSize: 15,
  },
  proofCardTextSelected: {
    color: '#1A1D1F',
  },
  proofCardSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  ekycBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2DD36F',
    color: '#f8f4e8',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: '#f8f4e8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#f8f4e8',
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
  ekycUploadSection: {
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  ekycRedirectCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#FFB74D',
    marginBottom: 12,
  },
  ekycRedirectText: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  ekycRedirectSubtext: {
    color: '#F57C00',
    fontSize: 12,
  },
  ekycUploadCard: {
    backgroundColor: '#f8f4e8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1.5,
    borderColor: '#F3F7FF',
    marginBottom: 16,
  },
  ekycUploadText: {
    color: '#2D5BFF',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  ekycUploadSubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  ekycDataPreview: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2DD36F',
  },
  ekycDataTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1A1D1F',
    marginBottom: 8,
  },
  ekycDataText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewSection: {
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1A1D1F',
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
    color: '#f8f4e8',
    fontWeight: '600',
    fontSize: 16,
  },
  // New styles for eKYC Guide Modal
  guideOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  guideContainer: {
    backgroundColor: '#f8f4e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  guideContent: {
    marginBottom: 20,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#2D5BFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  guideBenefits: {
    marginTop: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1F',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  guideActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guideCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  guideCancelText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  guideStartBtn: {
    flex: 1,
    backgroundColor: '#2D5BFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  guideStartText: {
    color: '#f8f4e8',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default KycModal; 
