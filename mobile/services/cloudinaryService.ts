// Cloudinary upload service for mobile app
// Uses unsigned upload preset for direct client-side uploads

const CLOUDINARY_CLOUD_NAME = 'dbfwrgwke';
const CLOUDINARY_UPLOAD_PRESET = 'influmojo_portfolio';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const cloudinaryService = {
  /**
   * Upload a file to Cloudinary
   * @param file - The file to upload (from expo-document-picker)
   * @param onProgress - Optional progress callback
   * @returns Promise with Cloudinary response
   */
  uploadFile: async (
    file: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryUploadResponse> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name || 'file'
      } as any);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'influmojo/portfolio');

      // Make the upload request
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  },

  /**
   * Get optimized URL for display
   * @param publicId - Cloudinary public ID
   * @param options - Optional transformation parameters
   * @returns Optimized URL
   */
  getOptimizedUrl: (publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string => {
    const { width, height, quality = 80, format } = options;
    let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      url += `/${transformations.join(',')}`;
    }
    
    return `${url}/${publicId}`;
  },

  /**
   * Delete a file from Cloudinary (requires signed request, typically done server-side)
   * @param publicId - Cloudinary public ID
   * @returns Promise
   */
  deleteFile: async (publicId: string): Promise<void> => {
    // Note: This would typically be done server-side for security
    // For now, we'll just log the request
    console.log('Delete file request for:', publicId);
    throw new Error('File deletion should be handled server-side for security');
  }
}; 