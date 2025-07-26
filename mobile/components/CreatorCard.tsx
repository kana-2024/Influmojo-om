import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';

interface CreatorCardProps {
  creator: any;
  platform: string;
  onPress: (creator: any, platform: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, platform, onPress }) => {
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Age not specified';
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return 'Age not specified';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const formatFollowerCount = (followerCount: string) => {
    if (!followerCount) return 'New';
    return `${(parseInt(followerCount) / 1000).toFixed(1)}K`;
  };

  return (
    <TouchableOpacity 
      style={{ 
        backgroundColor: '#fff', 
        width: 192, 
        borderRadius: 12, 
        marginRight: 16, 
        paddingHorizontal: 12, 
        paddingTop: 96, 
        paddingBottom: 16 
      }}
      onPress={() => onPress(creator, platform)}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ 
          backgroundColor: '#F1F2F4', 
          width: 24, 
          height: 6, 
          borderRadius: 3 
        }} />
        <Entypo name="dots-three-vertical" size={12} color="#000" />
      </View>
      
      <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#000', marginBottom: 4, textTransform: 'uppercase' }}>
        {creator.name}
      </Text>
      
      <Text style={{ fontSize: 4, color: '#000', fontWeight: 'bold', marginBottom: 4 }}>
        {creator.bio || 'A talented creator...'}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 4, color: '#A4A4A4' }}>
          {creator.gender || 'Not specified'} • {calculateAge(creator.date_of_birth)}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 4, color: '#A4A4A4' }}>
          Response Time: {creator.average_response_time}
        </Text>
        <View style={{ 
          backgroundColor: '#F1F2F4', 
          paddingHorizontal: 8, 
          paddingVertical: 1, 
          borderRadius: 12 
        }}>
          <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#000' }}>
            {formatFollowerCount(creator.social_accounts?.[0]?.follower_count)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CreatorCard; 