import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import CreatorCard from './CreatorCard';

interface CreatorSectionProps {
  platform: string;
  creators: any[];
  onCreatorPress: (creator: any, platform: string) => void;
  onViewAllPress?: () => void;
}

const CreatorSection: React.FC<CreatorSectionProps> = ({ 
  platform, 
  creators, 
  onCreatorPress, 
  onViewAllPress 
}) => {
  const formatPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  if (!creators || creators.length === 0) {
    return null; // Don't render section if no creators
  }

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Section Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222222' }}>
          {formatPlatformName(platform)} Creators
        </Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={{ fontSize: 12, color: '#000' }}>view all</Text>
        </TouchableOpacity>
      </View>

      {/* Creators ScrollView */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {creators.map((creator: any, index: number) => (
          <CreatorCard
            key={`${creator.id}-${index}`}
            creator={creator}
            platform={platform}
            onPress={onCreatorPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CreatorSection; 