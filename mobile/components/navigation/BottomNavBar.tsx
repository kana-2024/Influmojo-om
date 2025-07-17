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
    { name: 'insights', icon: 'analytics-outline', label: 'Insights' },
    { name: 'orders', icon: 'list-outline', label: 'Orders' },
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
            color={currentRoute === item.name ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: currentRoute === item.name ? '#007AFF' : '#8E8E93' }
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
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
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
    fontSize: 10,
    marginTop: 2,
    fontWeight: '400',
  },
});

export default BottomNavBar; 