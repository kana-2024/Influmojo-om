'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MapPin, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    bio?: string;
    age?: number;
    date_of_birth?: string;
    location?: string;
    followers?: string;
    engagement_rate?: string;
    platform?: string;
    cover_image?: string;
    profile_image?: string;
    user?: {
      age?: number;
      date_of_birth?: string;
    };
  };
  platform: string;
  onPress: (creator: any, platform: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, platform, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const calculateAge = (dateOfBirth: any) => {
    if (!dateOfBirth || 
        dateOfBirth === '' || 
        dateOfBirth === null || 
        dateOfBirth === undefined ||
        (typeof dateOfBirth === 'object' && Object.keys(dateOfBirth).length === 0)) {
      return 'Age not specified';
    }
    
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return 'Age not specified';
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 0 || age > 120) {
        return 'Age not specified';
      }
      
      return `${age} years old`;
    } catch (error) {
      return 'Age not specified';
    }
  };

  const getAgeDisplay = () => {
    if (creator.age !== undefined && creator.age !== null && creator.age !== '') {
      return `${creator.age} years old`;
    }
    
    const dateOfBirth = creator.date_of_birth || creator.dateOfBirth || creator.dob;
    if (dateOfBirth) {
      return calculateAge(dateOfBirth);
    }
    
    if (creator.user && creator.user.age) {
      return `${creator.user.age} years old`;
    }
    
    if (creator.user && creator.user.date_of_birth) {
      return calculateAge(creator.user.date_of_birth);
    }
    
    return 'Age not specified';
  };

  const formatFollowerCount = (followerCount: string) => {
    if (!followerCount) return 'New';
    const count = parseInt(followerCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '🌐';
    }
  };

  const handleFavoritePress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card w-80 cursor-pointer overflow-hidden"
      onClick={() => onPress(creator, platform)}
    >
      {/* Image Container */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={creator.cover_image || '/default-cover.jpg'}
          alt={creator.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Platform Badge */}
        <div className="absolute top-3 left-3 bg-black/60 text-white rounded-full p-2 text-sm">
          {getPlatformIcon(platform)}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoritePress}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
        >
          <Heart
            size={16}
            className={isFavorite ? 'fill-red-500 text-red-500' : ''}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-poppins-bold text-textDark flex-1 mr-2">
            {creator.name}
          </h3>
          <span className="chip-blue">
            Available
          </span>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-caption text-textGray leading-relaxed mb-3">
            {creator.bio}
          </p>
        )}

        {/* Demographics Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center flex-1">
            <Calendar size={14} className="text-textGray mr-1" />
            <span className="text-small text-textGray">{getAgeDisplay()}</span>
          </div>
          {creator.location && (
            <div className="flex items-center flex-1">
              <MapPin size={14} className="text-textGray mr-1" />
              <span className="text-small text-textGray">{creator.location}</span>
            </div>
          )}
        </div>

        {/* Engagement Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users size={14} className="text-secondary mr-1" />
            <span className="text-small text-secondary font-poppins-semibold">
              {formatFollowerCount(creator.followers || '0')} followers
            </span>
          </div>
          {creator.engagement_rate && (
            <span className="chip-yellow">
              {creator.engagement_rate}% engagement
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreatorCard; 