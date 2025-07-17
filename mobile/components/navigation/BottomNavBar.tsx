import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavBarProps {
  navigation: any;
  currentRoute?: string;
}

const BottomNavBar = ({ navigation, currentRoute = 'home' }: BottomNavBarProps) => {
  const navItems = [
    { name: 'home', icon: 'home-outline', label: 'Home' },
    { name: 'discover', icon: 'search-outline', label: 'Discover' },
    { name: 'create', icon: 'add-circle-outline', label: 'Create' },
    { name: 'messages', icon: 'chatbubble-outline', label: 'Messages' },
    { name: 'profile', icon: 'person-outline', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => navigation.navigate(item.name)}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={currentRoute === item.name ? '#FF6B2C' : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: currentRoute === item.name ? '#FF6B2C' : '#6B7280' }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 20, // Extra padding for safe area
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavBar; 