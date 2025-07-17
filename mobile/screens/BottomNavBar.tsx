import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home-outline' as const, activeIcon: 'home' as const },
  { key: 'Insights', label: 'Insights', icon: 'bar-chart-outline' as const, activeIcon: 'bar-chart' as const },
  { key: 'Orders', label: 'Orders', icon: 'receipt-outline' as const, activeIcon: 'receipt' as const },
  { key: 'Profile', label: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const },
];

const ACTIVE_COLOR = '#1A1D1F';
const INACTIVE_COLOR = '#6B7280';

const BottomNavBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={[styles.container, { paddingBottom: (insets.bottom || 0) + 10 }]}> 
      {TABS.map(tab => {
        const isActive = route.name === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => {
              if (!isActive) navigation.navigate(tab.key as never);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 64,
    borderTopWidth: 0.5,
    borderColor: '#E5E7EB',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    flexDirection: 'column',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: ACTIVE_COLOR,
  },
  label: {
    fontSize: 12,
    color: INACTIVE_COLOR,
    marginTop: 2,
    fontWeight: '500',
  },
  activeLabel: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
});

export default BottomNavBar; 