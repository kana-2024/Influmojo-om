# Offline eKYC Integration Guide

## Overview

This guide explains how to integrate UIDAI's offline eKYC functionality into your mobile application. Offline eKYC allows users to verify their Aadhaar details without requiring real-time internet connectivity by using a QR code that contains encrypted Aadhaar data.

## What is Offline eKYC?

Offline eKYC is a UIDAI initiative that enables Aadhaar-based verification through:
- **QR Code**: Contains encrypted Aadhaar data
- **XML File**: Contains the actual Aadhaar data in XML format
- **Digital Signature**: For verification authenticity
- **Metadata**: Information about the eKYC process

## UIDAI Zip File Structure

When a user downloads their eKYC data from the UIDAI website, they receive a zip file containing:

```
eKYC_Data.zip
├── QR_Code.png          # QR code with encrypted data
├── eKYC_Data.xml        # XML file with Aadhaar details
├── Digital_Signature.txt # Digital signature for verification
└── Metadata.json        # Process metadata
```

### XML File Structure

The XML file contains the following Aadhaar data:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PrintLetterBarcodeData 
    uid="123456789012" 
    name="John Doe" 
    gender="M" 
    yob="1990" 
    house="123" 
    street="Main Street" 
    locality="City" 
    vtc="City" 
    po="Post Office" 
    dist="District" 
    state="State" 
    pc="123456" 
    dob="01/01/1990">
    <Photo>base64_encoded_photo_data</Photo>
</PrintLetterBarcodeData>
```

## Implementation Steps

### 1. User Journey

1. **User visits UIDAI website** (https://uidai.gov.in)
2. **Downloads eKYC data** using Aadhaar number and OTP
3. **Receives zip file** with encrypted data
4. **Uploads zip file** in your mobile app
5. **App processes and validates** the data
6. **Data is submitted** to your backend

### 2. Mobile App Integration

#### Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "expo-document-picker": "~13.1.6",
    "expo-file-system": "~17.0.0",
    "react-native-zip-archive": "^6.1.0",
    "react-native-xml2js": "^1.0.3"
  }
}
```

#### File Structure

```
mobile/
├── services/
│   └── eKycService.ts          # eKYC processing service
├── components/
│   └── modals/
│       └── KycModal.tsx        # Updated KYC modal
└── utils/
    └── xmlParser.ts            # XML parsing utilities
```

### 3. Backend Integration

#### Database Schema Updates

Update your Prisma schema to handle eKYC data:

```prisma
model KYC {
  id                  BigInt         @id @default(autoincrement())
  creator_id          BigInt         @unique
  document_type       String         // PAN, AADHAAR, EKYC
  document_number     String?        // Aadhaar number for eKYC
  document_front_url  String?
  document_back_url   String?
  ekyc_data          Json?          // Store eKYC data as JSON
  verification_method String?        // "manual_upload" or "offline_ekyc"
  status              KYCStatus      @default(pending)
  submitted_at        DateTime       @default(now())
  verified_at         DateTime?
  rejected_at         DateTime?
  rejection_reason    String?
  verified_by         BigInt?
  creator             CreatorProfile @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  verifier            User?          @relation("KYCVerifier", fields: [verified_by], references: [id], onDelete: Cascade)

  @@index([status])
}
```

#### API Endpoint Updates

The `/api/profile/submit-kyc` endpoint now accepts:

```json
{
  "documentType": "ekyc",
  "aadhaarData": {
    "uid": "123456789012",
    "name": "John Doe",
    "gender": "M",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main Street, City, State - 123456",
    "photo": "base64_encoded_photo_data",
    "mobile": "9876543210",
    "email": "john.doe@example.com"
  },
  "verificationMethod": "offline_ekyc"
}
```

## Security Considerations

### 1. Data Validation

- **Verify digital signature** using UIDAI's public key
- **Validate XML structure** against UIDAI schema
- **Check data integrity** using checksums
- **Validate Aadhaar number** format (12 digits)

### 2. Data Storage

- **Encrypt sensitive data** before storing in database
- **Use secure transmission** (HTTPS) for API calls
- **Implement data retention** policies
- **Log access** to eKYC data

### 3. Privacy Compliance

- **Comply with Aadhaar Act** and UIDAI guidelines
- **Get user consent** before processing eKYC data
- **Implement data minimization** principles
- **Provide data deletion** options

## Testing

### 1. Mock Data

For development, use mock eKYC data:

```typescript
const mockAadhaarData = {
  uid: '123456789012',
  name: 'John Doe',
  gender: 'M',
  dateOfBirth: '1990-01-01',
  address: '123 Main Street, City, State - 123456',
  photo: 'base64_encoded_photo_data',
  mobile: '9876543210',
  email: 'john.doe@example.com'
};
```

### 2. Test Cases

- [ ] Valid eKYC zip file upload
- [ ] Invalid zip file handling
- [ ] Corrupted XML data handling
- [ ] Missing required fields validation
- [ ] Digital signature verification
- [ ] Network error handling
- [ ] Large file size handling

## Production Deployment

### 1. UIDAI Registration

- **Register with UIDAI** as an Authentication User Agency (AUA)
- **Get API credentials** for production use
- **Implement proper logging** as per UIDAI guidelines
- **Set up monitoring** for API usage

### 2. Compliance

- **Aadhaar Act compliance** verification
- **Data Protection** implementation
- **Audit trail** maintenance
- **Regular security** assessments

### 3. Monitoring

- **API usage metrics**
- **Error rate monitoring**
- **Performance tracking**
- **Security incident** response

## Troubleshooting

### Common Issues

1. **Zip file extraction fails**
   - Check file format and size
   - Verify file permissions
   - Ensure proper error handling

2. **XML parsing errors**
   - Validate XML structure
   - Check encoding format
   - Handle malformed data

3. **Digital signature verification fails**
   - Update UIDAI public keys
   - Check signature format
   - Verify certificate validity

4. **Data validation errors**
   - Check Aadhaar number format
   - Validate required fields
   - Handle missing data gracefully

### Error Handling

```typescript
try {
  const result = await eKycService.processEKycZip();
  if (result.success) {
    // Process successful
  } else {
    // Handle specific errors
    switch (result.error) {
      case 'INVALID_ZIP':
        // Handle invalid zip
        break;
      case 'XML_PARSE_ERROR':
        // Handle XML parsing error
        break;
      case 'SIGNATURE_VERIFICATION_FAILED':
        // Handle signature verification
        break;
      default:
        // Handle generic error
    }
  }
} catch (error) {
  // Handle unexpected errors
  console.error('eKYC processing failed:', error);
}
```

## Resources

- [UIDAI Official Website](https://uidai.gov.in)
- [eKYC API Documentation](https://uidai.gov.in/ecosystem/authentication-devices-documents/authentication-apis.html)
- [Aadhaar Act](https://uidai.gov.in/images/aadhaar_act_2016.pdf)
- [Data Protection Guidelines](https://uidai.gov.in/images/Data_Protection_Guidelines.pdf)

## Support

For technical support or questions about this integration:

1. Check the troubleshooting section above
2. Review UIDAI documentation
3. Contact your development team
4. Reach out to UIDAI support if needed

---

**Note**: This implementation is for educational purposes. For production use, ensure compliance with all applicable laws and UIDAI guidelines. 