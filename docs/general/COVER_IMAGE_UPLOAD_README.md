# Cover Image Upload Functionality

This document describes the cover image upload functionality that has been implemented for both Creator and Brand profiles.

## Overview

Users can now upload cover images to their profiles by clicking on the camera icon in the cover image area. The implementation includes:

- Database schema updates
- Backend API endpoint
- Mobile app integration with Cloudinary
- UI updates for both Creator and Brand profiles

## Database Changes

### Schema Update
Added `cover_image_url` field to the `User` table:

```prisma
model User {
  // ... existing fields
  cover_image_url           String?
  // ... rest of fields
}
```

### Migration
Run the migration to add the new field:
```bash
cd backend
npx prisma migrate dev --name add_cover_image_url
```

## Backend API

### New Endpoint
- **POST** `/api/profile/update-cover-image`
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "cover_image_url": "https://res.cloudinary.com/..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Cover image updated successfully",
    "data": {
      "user_id": "123",
      "cover_image_url": "https://res.cloudinary.com/...",
      "profile_image_url": "https://res.cloudinary.com/...",
      "user_type": "creator"
    }
  }
  ```

### Validation
- URL format validation
- Authentication required
- Error handling for invalid URLs

## Mobile App Integration

### New Services

#### 1. Image Service (`mobile/services/imageService.ts`)
Handles image picking and uploading:

```typescript
export const imageService = {
  pickAndUploadCoverImage: async (): Promise<ImageUploadResult>
  takeAndUploadCoverImage: async (): Promise<ImageUploadResult>
  showImageSourceOptions: async (): Promise<ImageUploadResult>
}
```

#### 2. API Service Update (`mobile/services/apiService.ts`)
Added cover image update method:

```typescript
updateCoverImage: async (data: { cover_image_url: string }) => {
  return await apiRequest(API_ENDPOINTS.UPDATE_COVER_IMAGE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### UI Updates

#### Creator Profile (`mobile/screens/creator/CreatorProfile.tsx`)
- Added cover image display
- Added camera icon with upload functionality
- Added `handleCoverImageUpload` function

#### Brand Profile (`mobile/screens/brand/BrandProfile.tsx`)
- Updated cover image source to use `cover_image_url`
- Added camera icon with upload functionality
- Added `handleCoverImageUpload` function

### Type Updates
Updated User interface in `mobile/store/slices/authSlice.ts`:
```typescript
interface User {
  // ... existing fields
  cover_image_url?: string;
  // ... rest of fields
}
```

## Cloudinary Integration

The implementation uses the existing Cloudinary service (`mobile/services/cloudinaryService.ts`) for:
- File upload to Cloudinary
- Progress tracking
- URL generation

### Upload Process
1. User clicks camera icon
2. Image picker opens (using expo-document-picker)
3. Selected image is uploaded to Cloudinary
4. Cloudinary URL is sent to backend API
5. Profile is updated with new cover image URL
6. UI refreshes to show new cover image

## Usage

### For Users
1. Navigate to your profile (Creator or Brand)
2. Click the camera icon on the cover image area
3. Select "Select Image" from the dialog
4. Choose an image from your device
5. Wait for upload to complete
6. Your cover image will be updated

### For Developers
To test the functionality:

1. **Backend Test**:
   ```bash
   node test-cover-image-upload.js
   ```

2. **Mobile App**:
   - Run the mobile app
   - Navigate to a profile
   - Click the camera icon
   - Test image upload

## Error Handling

The implementation includes comprehensive error handling:
- Permission denied errors
- Upload failures
- Network errors
- Invalid file types
- API errors

## Future Enhancements

1. **Camera Integration**: Install `expo-image-picker` for direct camera access
2. **Image Editing**: Add image cropping and editing capabilities
3. **Multiple Formats**: Support for different image formats
4. **Image Optimization**: Automatic image compression and optimization
5. **Cover Image Templates**: Pre-designed cover image templates

## Dependencies

### Required Packages
- `expo-document-picker` (already installed)
- Cloudinary service (already configured)

### Optional Packages (for future enhancements)
- `expo-image-picker` (for camera functionality)
- `expo-image-manipulator` (for image editing)

## Configuration

### Cloudinary Settings
The implementation uses the existing Cloudinary configuration:
- Cloud Name: `dbfwrgwke`
- Upload Preset: `influmojo_portfolio`
- Folder: `influmojo/portfolio`

### API Endpoints
Added to `mobile/config/env.ts`:
```typescript
UPDATE_COVER_IMAGE: `${ENV.API_BASE_URL}/api/profile/update-cover-image`
```

## Testing

### Manual Testing
1. Test cover image upload on Creator profile
2. Test cover image upload on Brand profile
3. Test error scenarios (no internet, invalid files, etc.)
4. Test profile refresh after upload

### Automated Testing
Use the provided test file:
```bash
node test-cover-image-upload.js
```

## Troubleshooting

### Common Issues
1. **Upload fails**: Check Cloudinary configuration
2. **Image not showing**: Verify URL format and accessibility
3. **Permission errors**: Ensure proper permissions are granted
4. **API errors**: Check authentication token and network connectivity

### Debug Information
The implementation includes console logging for debugging:
- Upload progress
- API responses
- Error details
- Profile refresh status 