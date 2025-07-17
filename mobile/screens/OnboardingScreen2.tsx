import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

interface OnboardingScreen2Props {
  navigation: any;
  route: { params?: { mode?: 'signup' | 'login' } };
}

const OnboardingScreen2 = ({ navigation, route }: OnboardingScreen2Props) => {
  useEffect(() => {
  }, []);

  const [selected, setSelected] = useState<'brand' | 'creator' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mode = route?.params?.mode || 'signup';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      
      <SafeAreaView style={styles.cardSafeArea}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/Influencers.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>Let's get you started</Text>
          <Text style={styles.description}>
            Start your journey as a brand or creator. Collaborate effortlessly and unlock meaningful opportunities together.
          </Text>
          <View style={styles.radioRow}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setSelected('brand')}>
              <View style={[styles.radioCircle, selected === 'brand' && styles.radioCircleSelected]}>
                {selected === 'brand' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>I'm a Brand</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioOption} onPress={() => setSelected('creator')}>
              <View style={[styles.radioCircle, selected === 'creator' && styles.radioCircleSelected]}>
                {selected === 'creator' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>I'm a Creator</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, !selected && { opacity: 0.5 }]}
            disabled={!selected}
            onPress={() => {
              if (selected === 'creator') navigation.navigate('Onboarding3');
              // else if (selected === 'brand') navigation.navigate('BrandOnboarding'); // To be implemented later
            }}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => {
              if (mode === 'signup') {
                navigation.navigate('Login');
              } else {
                navigation.navigate('Onboarding1');
              }
            }}
          >
            {mode === 'signup' ? (
              <Text style={styles.loginText}>Already have an account ? <Text style={styles.loginLink}>Login here</Text></Text>
            ) : (
              <Text style={styles.loginText}>Don't have an account? <Text style={styles.loginLink}>Signup here</Text></Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
    alignItems: 'flex-end',
  },
  image: {
    width: '150%',
    height: '100%',
  },
  cardSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    borderColor: '#FF6B2C',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B2C',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#FC5213',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginRow: {
    marginTop: 4,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default OnboardingScreen2; 