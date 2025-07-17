import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import * as NavigationBar from 'expo-navigation-bar';

// Animated Confetti Dot (pop in, fixed position)
const ConfettiDot = ({ x, y, color, size, delay }: { x: number; y: number; color: string; size: number; delay: number }) => {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      delay,
      friction: 4,
      tension: 80,
    }).start();
  }, [scale, delay]);
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

// Animated Button
const AnimatedButton = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 120,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Double Circle Checkmark with Confetti
const ConfettiCheckmark = () => {
  // Confetti positions (angle, distance, color)
  const confetti = [
    { angle: 0, distance: 60, color: '#FF6B2C', size: 10, delay: 0 },
    { angle: 30, distance: 60, color: '#FFD600', size: 8, delay: 60 },
    { angle: 60, distance: 60, color: '#2DD36F', size: 9, delay: 120 },
    { angle: 90, distance: 60, color: '#1E90FF', size: 7, delay: 180 },
    { angle: 120, distance: 60, color: '#FF3B30', size: 8, delay: 240 },
    { angle: 150, distance: 60, color: '#FF6B2C', size: 7, delay: 300 },
    { angle: 180, distance: 60, color: '#FFD600', size: 10, delay: 360 },
    { angle: 210, distance: 60, color: '#2DD36F', size: 8, delay: 420 },
    { angle: 240, distance: 60, color: '#1E90FF', size: 9, delay: 480 },
    { angle: 270, distance: 60, color: '#FF3B30', size: 7, delay: 540 },
    { angle: 300, distance: 60, color: '#FFD600', size: 8, delay: 600 },
    { angle: 330, distance: 60, color: '#2DD36F', size: 7, delay: 660 },
  ];
  // Animation for checkmark
  const scale = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 120,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [scale]);
  // Center of the container
  const centerX = 60;
  const centerY = 60;
  return (
    <View style={styles.confettiContainer}>
      {/* Confetti dots pop in around the checkmark */}
      {confetti.map((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * dot.distance - dot.size / 2;
        const y = centerY + Math.sin(rad) * dot.distance - dot.size / 2;
        return (
          <ConfettiDot
            key={i}
            x={x}
            y={y}
            color={dot.color}
            size={dot.size}
            delay={dot.delay}
          />
        );
      })}
      {/* Double circle checkmark with animated inner circle */}
      <View style={styles.outerCircle}>
        <Animated.View style={[styles.innerCircle, { transform: [{ scale }] }]}> 
          <Ionicons name="checkmark" size={36} color="#fff" style={{ fontWeight: 'bold' }} />
        </Animated.View>
      </View>
    </View>
  );
};

const ProfileCompleteScreen = ({ navigation }: any) => {
  useEffect(() => {
  }, []);

  const user = useAppSelector(state => state.auth.user);

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ConfettiCheckmark />
        <Text style={styles.title}>Your basic profile has been completed!</Text>
        <Text style={styles.subtitle}>
          You're now ready to explore your creator space. Start growing your presence and get discovered by the right brands.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleViewProfile}>
          <Text style={styles.buttonText}>View Profile</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  confettiContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD1B3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B2C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B2C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default ProfileCompleteScreen; 