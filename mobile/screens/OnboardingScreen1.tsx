import React from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

const OnboardingScreen1 = ({ navigation }: any) => {
  useEffect(() => {
  }, []);
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/onboardin-img.webp')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>Connect with Skilled Influencers</Text>
          <Text style={styles.description}>
            Tap into a pool of talented influencers to bring your projects to life. Collaborate seamlessly and achieve outstanding results.
          </Text>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Onboarding2', { mode: 'signup' })}
            >
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Onboarding2', { mode: 'login' })}
            >
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    marginBottom: -32,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    flex: 1,
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
    fontSize: 20,
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#102B38',
    width: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#FC5213',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  signupText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FC5213',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  loginText: {
    color: '#FC5213',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen1; 