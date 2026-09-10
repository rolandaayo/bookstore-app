import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { bg0, primary, primaryLight, textPrimary, textSecondary } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function AppSplash({ onFinish }: Props) {
  // Animation values
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Ring expands in
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.15,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. Logo pops in with spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 3. App name slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 5. Hold
      Animated.delay(700),
      // 6. Whole screen fades out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Decorative background glow rings */}
      <Animated.View
        style={[
          styles.glowRing,
          styles.glowOuter,
          { transform: [{ scale: ringScale }], opacity: ringOpacity },
        ]}
      />
      <Animated.View
        style={[
          styles.glowRing,
          styles.glowInner,
          { transform: [{ scale: ringScale }], opacity: Animated.multiply(ringOpacity, 2) },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      >
        <Text style={styles.logoEmoji}>📚</Text>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
        <Text style={styles.appName}>BookStore</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity }}>
        <Text style={styles.tagline}>Read. Sell. Discover.</Text>
      </Animated.View>

      {/* Bottom version stamp */}
      <Animated.View style={[styles.bottomStamp, { opacity: taglineOpacity }]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: bg0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: primary,
  },
  glowOuter: {
    width: 340,
    height: 340,
  },
  glowInner: {
    width: 220,
    height: 220,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // subtle border glow
    shadowColor: primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  logoEmoji: {
    fontSize: 54,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomStamp: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: primary,
    opacity: 0.6,
  },
});
