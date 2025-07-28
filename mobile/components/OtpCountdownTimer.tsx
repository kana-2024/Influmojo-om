import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OtpCountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  style?: any;
}

const OtpCountdownTimer: React.FC<OtpCountdownTimerProps> = ({ 
  initialSeconds, 
  onComplete, 
  style 
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  if (seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        Resend code in {minutes}:{remainingSeconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default OtpCountdownTimer; 
