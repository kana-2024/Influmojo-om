import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';

interface BottomNavBarProps {
  navigation: any;
  currentRoute?: string;
  onCartPress?: () => void;
}

const BottomNavBar = ({ navigation, currentRoute = 'home', onCartPress }: BottomNavBarProps) => {
  const userType = useAppSelector(state => state.auth.userType) || 'creator';
  
  // Different nav items for brand vs creator
  const brandNavItems = [
    { name: 'home', icon: 'home-outline', label: 'Home' },
    { name: 'cart', icon: 'cart-outline', label: 'Cart' },
    { name: 'insights', icon: 'analytics-outline', label: 'Insights' },
    { name: 'profile', icon: 'person-outline', label: 'Profile' },
  ];
  
  const creatorNavItems = [
    { name: 'home', icon: 'home-outline', label: 'Home' },
    { name: 'insights', icon: 'analytics-outline', label: 'Insights' },
    { name: 'orders', icon: 'list-outline', label: 'Orders' },
    { name: 'profile', icon: 'person-outline', label: 'Profile' },
  ];
  
  const navItems = userType === 'brand' ? brandNavItems : creatorNavItems;

  const handleNavigation = (routeName: string) => {
    if (routeName === 'home') {
      // Navigate to the appropriate home based on user type
      if (userType === 'brand') {
        navigation.navigate('BrandHome');
      } else {
        // For creators, navigate to their profile as the home
        navigation.navigate('CreatorProfile');
      }
    } else if (routeName === 'profile') {
      // Navigate to the appropriate profile based on user type
      if (userType === 'brand') {
        navigation.navigate('BrandProfile');
      } else {
        // For creators, profile is the same as home
        navigation.navigate('CreatorProfile');
      }
    } else if (routeName === 'cart') {
      // Handle cart navigation for brand users
      if (userType === 'brand' && onCartPress) {
        onCartPress();
      }
    } else {
      // For other routes (insights, orders), navigate normally
      // Note: These screens might not exist yet, so we'll handle gracefully
      try {
        navigation.navigate(routeName);
      } catch (error) {
        console.log(`Navigation to ${routeName} not implemented yet`);
        // Fallback to home
        if (userType === 'brand') {
          navigation.navigate('BrandHome');
        } else {
          navigation.navigate('CreatorProfile');
        }
      }
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