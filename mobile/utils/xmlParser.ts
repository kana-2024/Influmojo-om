import { AadhaarData } from '../services/eKycService';

/**
 * Parse UIDAI eKYC XML data
 * This is a simplified parser for demonstration purposes
 * In production, use a proper XML parsing library like react-native-xml2js
 */
export class XMLParser {
  /**
   * Parse Aadhaar XML data from string
   */
  static parseAadhaarXML(xmlString: string): { success: boolean; data?: AadhaarData; error?: string } {
    try {
      // Basic XML parsing (in production, use a proper XML parser)
      const xmlDoc = this.parseXMLString(xmlString);
      if (!xmlDoc) {
        return { success: false, error: 'Invalid XML format' };
      }

      // Extract PrintLetterBarcodeData element
      const barcodeData = xmlDoc.getElementsByTagName('PrintLetterBarcodeData')[0];
      if (!barcodeData) {
        return { success: false, error: 'PrintLetterBarcodeData element not found' };
      }

      // Extract attributes
      const uid = barcodeData.getAttribute('uid');
      const name = barcodeData.getAttribute('name');
      const gender = barcodeData.getAttribute('gender');
      const yob = barcodeData.getAttribute('yob');
      const house = barcodeData.getAttribute('house');
      const street = barcodeData.getAttribute('street');
      const locality = barcodeData.getAttribute('locality');
      const vtc = barcodeData.getAttribute('vtc');
      const po = barcodeData.getAttribute('po');
      const dist = barcodeData.getAttribute('dist');
      const state = barcodeData.getAttribute('state');
      const pc = barcodeData.getAttribute('pc');
      const dob = barcodeData.getAttribute('dob');

      // Extract photo
      const photoElement = barcodeData.getElementsByTagName('Photo')[0];
      const photo = photoElement ? photoElement.textContent || '' : '';

      // Validate required fields
      if (!uid || !name || !gender || !yob || !dob) {
        return { success: false, error: 'Missing required Aadhaar data fields' };
      }

      // Construct address
      const addressParts = [house, street, locality, vtc, po, dist, state, pc].filter(Boolean);
      const address = addressParts.join(', ');

      // Parse date of birth
      const parsedDob = this.parseDateOfBirth(dob, yob);

      const aadhaarData: AadhaarData = {
        uid: uid.trim(),
        name: name.trim(),
        gender: gender.trim(),
        dateOfBirth: parsedDob,
        address: address.trim(),
        photo: photo.trim(),
      };

      return { success: true, data: aadhaarData };

    } catch (error) {
      console.error('XML parsing error:', error);
      return { success: false, error: 'Failed to parse Aadhaar XML data' };
    }
  }

  /**
   * Parse XML string to DOM-like object
   * This is a simplified parser for demonstration
   */
  private static parseXMLString(xmlString: string): any {
    try {
      // Remove XML declaration and comments
      const cleanXML = xmlString
        .replace(/<\?xml[^>]*\?>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();

      // Simple XML parsing (in production, use a proper XML parser)
      const parser = new DOMParser();
      return parser.parseFromString(cleanXML, 'text/xml');
    } catch (error) {
      console.error('XML string parsing error:', error);
      return null;
    }
  }

  /**
   * Parse date of birth from UIDAI format
   */
  private static parseDateOfBirth(dob: string, yob: string): string {
    try {
      // UIDAI provides date in DD/MM/YYYY format
      if (dob && dob.includes('/')) {
        const [day, month, year] = dob.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Fallback to year of birth
      if (yob) {
        return `${yob}-01-01`;
      }
      
      return '';
    } catch (error) {
      console.error('Date parsing error:', error);
      return '';
    }
  }

  /**
   * Validate Aadhaar XML structure
   */
  static validateXMLStructure(xmlString: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Check for required elements
      if (!xmlString.includes('<PrintLetterBarcodeData')) {
        errors.push('PrintLetterBarcodeData element missing');
      }

      if (!xmlString.includes('uid=')) {
        errors.push('UID attribute missing');
      }

      if (!xmlString.includes('name=')) {
        errors.push('Name attribute missing');
      }

      if (!xmlString.includes('gender=')) {
        errors.push('Gender attribute missing');
      }

      if (!xmlString.includes('<Photo>')) {
        errors.push('Photo element missing');
      }

      // Check for basic XML structure
      if (!xmlString.includes('<?xml')) {
        errors.push('XML declaration missing');
      }

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      errors.push('XML validation failed');
      return {
        isValid: false,
        errors
      };
    }
  }

  /**
   * Extract specific field from XML
   */
  static extractField(xmlString: string, fieldName: string): string | null {
    try {
      const regex = new RegExp(`${fieldName}="([^"]*)"`, 'i');
      const match = xmlString.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error(`Error extracting field ${fieldName}:`, error);
      return null;
    }
  }

  /**
   * Extract photo data from XML
   */
  static extractPhoto(xmlString: string): string | null {
    try {
      const photoRegex = /<Photo>([\s\S]*?)<\/Photo>/i;
      const match = xmlString.match(photoRegex);
      return match ? match[1].trim() : null;
    } catch (error) {
      console.error('Error extracting photo:', error);
      return null;
    }
  }
}

/**
 * Mock DOMParser for React Native
 * In production, use a proper XML parsing library
 */
class DOMParser {
  parseFromString(xmlString: string, contentType: string): any {
    // This is a simplified mock implementation
    // In production, use react-native-xml2js or similar
    
    const elements: any = {};
    const attributes: any = {};
    
    // Simple regex-based parsing for demonstration
    const uidMatch = xmlString.match(/uid="([^"]*)"/);
    if (uidMatch) attributes.uid = uidMatch[1];
    
    const nameMatch = xmlString.match(/name="([^"]*)"/);
    if (nameMatch) attributes.name = nameMatch[1];
    
    const genderMatch = xmlString.match(/gender="([^"]*)"/);
    if (genderMatch) attributes.gender = genderMatch[1];
    
    const yobMatch = xmlString.match(/yob="([^"]*)"/);
    if (yobMatch) attributes.yob = yobMatch[1];
    
    const dobMatch = xmlString.match(/dob="([^"]*)"/);
    if (dobMatch) attributes.dob = dobMatch[1];
    
    // Mock DOM-like object
    return {
      getElementsByTagName: (tagName: string) => {
        if (tagName === 'PrintLetterBarcodeData') {
          return [{
            getAttribute: (attr: string) => attributes[attr] || null,
            getElementsByTagName: (innerTag: string) => {
              if (innerTag === 'Photo') {
                const photoMatch = xmlString.match(/<Photo>([\s\S]*?)<\/Photo>/);
                return [{
                  textContent: photoMatch ? photoMatch[1] : ''
                }];
              }
              return [];
            }
          }];
        }
        return [];
      }
    };
  }
}

export default XMLParser; 