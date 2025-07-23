import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavBarProps {
  navigation: any;
  currentRoute?: string;
  userType?: 'creator' | 'brand';
}

const BottomNavBar = ({ navigation, currentRoute = 'home', userType = 'creator' }: BottomNavBarProps) => {
  const navItems = [
    { name: 'home', icon: 'home-outline', label: 'Home' },
    { name: 'insights', icon: 'document-text-outline', label: 'Insights' },
    { name: 'orders', icon: 'locate-outline', label: 'Orders' },
    { name: 'profile', icon: 'person-outline', label: 'Profile' },
  ];

  const handleNavigation = (routeName: string) => {
    if (routeName === 'profile') {
      // Navigate to the appropriate profile based on user type
      if (userType === 'brand') {
        navigation.navigate('Home', { activeTab: 'profile' });
      } else {
        navigation.navigate('CreatorProfile');
      }
    } else if (routeName === 'home') {
      // Navigate to appropriate home based on user type
      if (userType === 'brand') {
        navigation.navigate('Home', { activeTab: 'home' });
      } else {
        // For creators, home button should be disabled or show a message
        // For now, we'll navigate to CreatorProfile as their main screen
        navigation.navigate('CreatorProfile');
      }
    } else {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handleNavigation(item.name)}
        >
          {currentRoute === item.name && (
            <View style={styles.activeIndicator} />
          )}
          <Ionicons
            name={item.icon as any}
            size={24}
            color={currentRoute === item.name ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { 
                color: currentRoute === item.name ? '#007AFF' : '#8E8E93',
                fontWeight: currentRoute === item.name ? '600' : '400'
              }
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
    backgroundColor: '#F2F2F7',
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 20, // Extra padding for safe area
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '400',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
});

export default BottomNavBar; 