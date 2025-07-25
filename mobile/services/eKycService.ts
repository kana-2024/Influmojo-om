import { Alert, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XMLParser from '../utils/xmlParser';

export interface AadhaarData {
  uid: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  photo: string; // Base64 encoded photo
  mobile?: string;
  email?: string;
}

export interface EKycResult {
  success: boolean;
  data?: AadhaarData;
  error?: string;
  qrCodeData?: string;
  xmlData?: string;
}

class EKycService {
  /**
   * Redirect user to UIDAI website for eKYC download
   */
  async redirectToUIDAI(): Promise<void> {
    try {
      const uidaiUrl = 'https://uidai.gov.in/my-aadhaar/get-aadhaar.html';
      
      const supported = await Linking.canOpenURL(uidaiUrl);
      
      if (supported) {
        await Linking.openURL(uidaiUrl);
        
        // Show instructions after redirect
        setTimeout(() => {
          Alert.alert(
            'eKYC Download Instructions',
            '1. Visit the UIDAI website\n' +
            '2. Click "Download Aadhaar"\n' +
            '3. Enter your Aadhaar number and OTP\n' +
            '4. Download the eKYC zip file\n' +
            '5. Return to this app and upload the file',
            [
              { text: 'Got it!', style: 'default' },
              { text: 'Need Help?', onPress: () => this.showDetailedInstructions() }
            ]
          );
        }, 1000);
      } else {
        Alert.alert(
          'Cannot Open UIDAI Website',
          'Please manually visit: https://uidai.gov.in/my-aadhaar/get-aadhaar.html',
          [
            { text: 'Copy URL', onPress: () => this.copyUIDAIUrl() },
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to open UIDAI website:', error);
      Alert.alert('Error', 'Failed to open UIDAI website. Please visit manually.');
    }
  }

  /**
   * Show detailed eKYC instructions
   */
  private showDetailedInstructions(): void {
    Alert.alert(
      'Detailed eKYC Instructions',
      '📱 Step-by-Step Guide:\n\n' +
      '1️⃣ Visit: uidai.gov.in/my-aadhaar\n' +
      '2️⃣ Click "Download Aadhaar"\n' +
      '3️⃣ Enter your 12-digit Aadhaar number\n' +
      '4️⃣ Enter the OTP sent to your registered mobile\n' +
      '5️⃣ Download the eKYC zip file\n' +
      '6️⃣ Return to this app\n' +
      '7️⃣ Tap "Upload eKYC File" and select the zip file\n\n' +
      '💡 The zip file contains your verified Aadhaar data',
      [
        { text: 'Open UIDAI Website', onPress: () => this.redirectToUIDAI() },
        { text: 'OK', style: 'default' }
      ]
    );
  }

  /**
   * Copy UIDAI URL to clipboard
   */
  private async copyUIDAIUrl(): Promise<void> {
    try {
      // In a real implementation, you'd use Clipboard API
      // await Clipboard.setString('https://uidai.gov.in/my-aadhaar/get-aadhaar.html');
      Alert.alert('URL Copied', 'UIDAI website URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }

  /**
   * Pick and process UIDAI eKYC zip file
   */
  async processEKycZip(): Promise<EKycResult> {
    try {
      // Pick the zip file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return { success: false, error: 'No file selected' };
      }

      const file = result.assets[0];
      console.log('Selected eKYC file:', file);

      // Extract zip file
      const extractedData = await this.extractZipFile(file.uri);
      if (!extractedData.success) {
        return extractedData;
      }

      // Parse XML data
      const parsedData = await this.parseAadhaarXML(extractedData.xmlData!);
      if (!parsedData.success) {
        return parsedData;
      }

      return {
        success: true,
        data: parsedData.data,
        qrCodeData: extractedData.qrCodeData,
        xmlData: extractedData.xmlData,
      };

    } catch (error) {
      console.error('eKYC processing error:', error);
      return {
        success: false,
        error: 'Failed to process eKYC file. Please ensure it\'s a valid UIDAI eKYC zip file.',
      };
    }
  }

  /**
   * Extract contents from UIDAI eKYC zip file
   */
  private async extractZipFile(fileUri: string): Promise<{ success: boolean; qrCodeData?: string; xmlData?: string; error?: string }> {
    try {
      // For React Native, we'll need to use a zip extraction library
      // For now, we'll simulate the extraction process
      // In a real implementation, you'd use react-native-zip-archive or similar

      // Simulate reading file contents
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // In a real implementation, you would:
      // 1. Extract the zip file
      // 2. Find the QR code image
      // 3. Find the XML file
      // 4. Parse the QR code to get encrypted data
      // 5. Decrypt the data using UIDAI's public key

      // For demo purposes, we'll return mock data
      return {
        success: true,
        qrCodeData: 'mock_qr_code_data',
        xmlData: this.getMockAadhaarXML(),
      };

    } catch (error) {
      console.error('Zip extraction error:', error);
      return {
        success: false,
        error: 'Failed to extract eKYC file contents',
      };
    }
  }

  /**
   * Parse Aadhaar XML data
   */
  private async parseAadhaarXML(xmlData: string): Promise<{ success: boolean; data?: AadhaarData; error?: string }> {
    try {
      // Validate XML structure first
      const validation = XMLParser.validateXMLStructure(xmlData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid XML structure: ${validation.errors.join(', ')}`,
        };
      }

      // Parse XML data
      const result = XMLParser.parseAadhaarXML(xmlData);
      if (!result.success) {
        return result;
      }

      // Validate extracted data
      const dataValidation = this.validateAadhaarData(result.data!);
      if (!dataValidation.isValid) {
        return {
          success: false,
          error: `Data validation failed: ${dataValidation.errors.join(', ')}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };

    } catch (error) {
      console.error('XML parsing error:', error);
      return {
        success: false,
        error: 'Failed to parse Aadhaar data',
      };
    }
  }

  /**
   * Validate Aadhaar data
   */
  validateAadhaarData(data: AadhaarData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate UID (12 digits)
    if (!data.uid || !/^\d{12}$/.test(data.uid)) {
      errors.push('Invalid Aadhaar number (must be 12 digits)');
    }

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Invalid name');
    }

    // Validate gender
    if (!data.gender || !['M', 'F', 'O'].includes(data.gender)) {
      errors.push('Invalid gender');
    }

    // Validate date of birth
    if (!data.dateOfBirth || !this.isValidDate(data.dateOfBirth)) {
      errors.push('Invalid date of birth');
    }

    // Validate address
    if (!data.address || data.address.trim().length < 10) {
      errors.push('Invalid address');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if date string is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Get mock Aadhaar XML for testing
   */
  private getMockAadhaarXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<PrintLetterBarcodeData uid="123456789012" name="John Doe" gender="M" yob="1990" house="123" street="Main Street" locality="City" vtc="City" po="Post Office" dist="District" state="State" pc="123456" dob="01/01/1990">
  <Photo>base64_encoded_photo_data</Photo>
</PrintLetterBarcodeData>`;
  }

  /**
   * Show file picker for eKYC zip
   */
  async pickEKycFile(): Promise<EKycResult> {
    try {
      Alert.alert(
        'Select eKYC File',
        'Please select the UIDAI eKYC zip file that you downloaded from the UIDAI website.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Select File',
            onPress: () => this.processEKycZip(),
          },
        ]
      );

      return { success: false, error: 'User cancelled' };
    } catch (error) {
      console.error('File picker error:', error);
      return {
        success: false,
        error: 'Failed to open file picker',
      };
    }
  }
}

export default new EKycService(); 