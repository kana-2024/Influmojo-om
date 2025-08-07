'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PackageCardProps {
  item: {
    id: string;
    title?: string;
    platform?: string;
    content_type?: string;
    description?: string;
    duration1?: string;
    quantity?: number;
    revisions?: number;
    price?: number;
  };
  creatorId?: string;
  creatorName?: string;
  creatorImage?: string;
  onEdit?: (item: any) => void;
  onDelete?: () => void;
  readonly?: boolean;
  onAddToCart?: (item: any) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ 
  item, 
  creatorId, 
  creatorName, 
  creatorImage, 
  onEdit, 
  onDelete, 
  readonly = false, 
  onAddToCart 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const title = item.title || `${item.platform?.toUpperCase()} ${item.content_type?.toUpperCase()}`;

  const getPlaceholderImageUrl = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return 'https://img.icons8.com/color/96/instagram-new.png';
      case 'facebook':
        return 'https://img.icons8.com/color/96/facebook-new.png';
      case 'youtube':
        return 'https://img.icons8.com/color/96/youtube-play.png';
      case 'tiktok':
        return 'https://img.icons8.com/color/96/tiktok.png';
      case 'twitter':
        return 'https://img.icons8.com/color/96/twitter.png';
      case 'linkedin':
        return 'https://img.icons8.com/color/96/linkedin.png';
      default:
        return 'https://img.icons8.com/color/96/social-network.png';
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return { name: '📷', color: '#E4405F' };
      case 'facebook':
        return { name: '📘', color: '#1877F2' };
      case 'youtube':
        return { name: '🎥', color: '#FF0000' };
      case 'tiktok':
        return { name: '🎵', color: '#000000' };
      case 'twitter':
        return { name: '🐦', color: '#1DA1F2' };
      case 'linkedin':
        return { name: '💼', color: '#0077B5' };
      default:
        return { name: '🌐', color: '#666666' };
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setDeleting(true);
      try {
        await onDelete();
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        setDeleting(false);
        setShowDeleteModal(false);
      }
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  const platformIcon = getPlatformIcon(item.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-4"
    >
      <div className="flex items-start">
        {/* Platform Icon */}
        <div className="flex flex-col items-center mr-4">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1"
            style={{ backgroundColor: platformIcon.color + '20' }}
          >
            {platformIcon.name}
          </div>
          <span className="text-small text-textGray font-poppins-semibold uppercase">
            {item.platform}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-subtitle font-poppins-bold text-textDark">
              {title}
            </h3>
            {!readonly && (
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit size={14} className="text-textGray" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Trash2 size={14} className="text-error" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-caption text-textGray mb-3">
              {item.description}
            </p>
          )}

          {/* Details Row */}
          <div className="flex flex-wrap gap-4 mb-3 ml-0">
            {item.duration1 && (
              <span className="text-small text-textDark">
                Duration: <span className="font-poppins-bold">{item.duration1}</span>
              </span>
            )}
            {item.quantity && (
              <span className="text-small text-textDark">
                Quantity: <span className="font-poppins-bold">{item.quantity}</span>
              </span>
            )}
            {item.revisions && (
              <span className="text-small text-textDark">
                Revisions: <span className="font-poppins-bold">{item.revisions}</span>
              </span>
            )}
          </div>

          {/* Footer Row */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-small text-textDark font-poppins-semibold">
                Price:
              </span>
              <span className="text-lg font-poppins-bold text-textDark ml-2">
                ${item.price || 0}
              </span>
            </div>
            
            {onAddToCart && (
              <button
                onClick={handleAddToCart}
                className="btn-primary flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-poppins-bold mb-4">Delete Package</h3>
            <p className="text-textGray mb-6">
              Are you sure you want to delete this package? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-error text-white font-poppins-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PackageCard; 