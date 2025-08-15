'use client';

import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { profileAPI } from '@/services/apiService';
import { cloudinaryService } from '@/services/cloudinaryService';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPortfolioCreated: () => void;
}

export default function CreatePortfolioModal({ isOpen, onClose, onPortfolioCreated }: CreatePortfolioModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <VideoCameraIcon className="w-8 h-8 text-red-500" />;
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  const handleSubmitPortfolio = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    setSaving(true);
    try {
      // Upload file to Cloudinary
      const cloudinaryResponse = await cloudinaryService.uploadFile(file);
      console.log('File uploaded to Cloudinary:', cloudinaryResponse);
      
      // Create portfolio item with backend-expected field names
      await profileAPI.createPortfolio({
        mediaUrl: cloudinaryResponse.secure_url,
        mediaType: getFileType(file.type),
        fileName: file.name,
        fileSize: cloudinaryResponse.bytes || file.size || 0,
        mimeType: file.type
      });
      
      alert('Portfolio item created successfully!');
      onPortfolioCreated();
      onClose();
    } catch (error) {
      console.error('Create portfolio error:', error);
      alert('Failed to create portfolio item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full max-h-[90vh] rounded-t-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Portfolio Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Media File *
            </label>
            
            {!file ? (
              <div
                onClick={pickFile}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to select a file</p>
                <p className="text-sm text-gray-500">
                  Supports images, videos, and documents (Max 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{file.name}</h4>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-500">{file.type}</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload Progress */}
                {/* The uploading state and progress bar are removed as per the edit hint */}
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">File Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Images: JPG, PNG, GIF (Max 10MB)</li>
              <li>• Videos: MP4, MOV, AVI (Max 50MB)</li>
              <li>• Documents: PDF, DOC, ZIP (Max 20MB)</li>
              <li>• All files will be reviewed before approval</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitPortfolio}
              disabled={!file || saving}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Add to Portfolio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
