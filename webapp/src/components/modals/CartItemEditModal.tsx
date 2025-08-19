'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { CartItem } from '@/services/cartService';

interface CartItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, formData: {
    deliveryTime: number;
    additionalInstructions: string;
    references: string[];
  }) => void;
  cartItem: CartItem | null;
}

const CartItemEditModal: React.FC<CartItemEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cartItem
}) => {
  const [deliveryTime, setDeliveryTime] = useState(7);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [references, setReferences] = useState<string[]>([]);

  // Reset form when modal opens or cartItem changes
  useEffect(() => {
    if (isOpen && cartItem) {
      setDeliveryTime(cartItem.deliveryTime || 7);
      setAdditionalInstructions(cartItem.additionalInstructions || '');
      setReferences(cartItem.references || []);
    }
  }, [isOpen, cartItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartItem) {
      alert('Cart item information is missing');
      return;
    }

    const formData = {
      deliveryTime,
      additionalInstructions,
      references,
    };

    onSave(cartItem.id, formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For now, we'll just store file names
      // In a real implementation, you'd upload to cloudinary or similar
      const fileNames = Array.from(files).map(file => file.name);
      setReferences(prev => [...prev, ...fileNames]);
    }
  };

  const removeReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || !cartItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Package Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Package Info */}
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">{cartItem.packageName}</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700">{cartItem.platform}</span>
                <span className="font-semibold text-orange-900">₹{cartItem.packagePrice}</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">Creator: {cartItem.creatorName}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Delivery Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Delivery Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="7"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many days do you need this delivered by?
              </p>
            </div>

            {/* Additional Instructions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                Additional Instructions
              </label>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe your requirements, style preferences, or any specific instructions for the creator..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about what you want to achieve
              </p>
            </div>

            {/* References */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-2" />
                Reference Files (Optional)
              </label>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="edit-file-upload"
                />
                <label
                  htmlFor="edit-file-upload"
                  className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium"
                >
                  Click to upload files
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Upload inspiration images, brand guidelines, or reference documents
                </p>
              </div>

              {/* Uploaded Files List */}
              {references.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h5>
                  <div className="space-y-2">
                    {references.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-700 truncate">{file}</span>
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartItemEditModal;
