import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bg0, bg1, bg2, primary, primaryLight,
  textPrimary, textSecondary, accent, border,
} from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'discover',
    emoji: '🌍',
    gradient: ['#1a1040', '#0a0820'],
    accentColor: '#7C6FF7',
    title: 'Discover Ebooks\nFrom Anywhere',
    subtitle:
      'Browse thousands of ebooks across every genre — fiction, science, business, and more. New titles added every day.',
  },
  {
    key: 'sell',
    emoji: '💸',
    gradient: ['#1a2810', '#0a1808'],
    accentColor: '#34D399',
    title: 'Sell Your Books\nTo The World',
    subtitle:
      'Upload your PDF or EPUB in seconds. Set your price, reach readers globally, and watch your earnings grow.',
  },
  {
    key: 'own',
    emoji: '📖',
    gradient: ['#1a1018', '#0a0810'],
    accentColor: '#F5A623',
    title: 'Build Your\nPersonal Library',
    subtitle:
      'Every book you buy lives in your library forever. Read anytime, leave reviews, and support your favourite authors.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/auth/login');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          // Parallax: each slide's content moves at 0.3× the scroll speed
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [40, 0, -40],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <View style={[styles.slide, { width }]}>
              {/* Decorative circle behind emoji */}
              <Animated.View
                style={[
                  styles.emojiCircle,
                  {
                    backgroundColor: item.accentColor + '18',
                    borderColor: item.accentColor + '30',
                    opacity,
                    transform: [{ translateY }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.emojiInner,
                    { backgroundColor: item.accentColor + '22' },
                  ]}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.textWrap, { opacity, transform: [{ translateY }] }]}>
                <Text style={[styles.title, { color: item.accentColor }]}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      {/* Bottom controls */}
      <View style={[styles.footer, { borderTopColor: border }]}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [6, 22, 6],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={s.key}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: SLIDES[i].accentColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Skip / Next */}
        <View style={styles.btnRow}>
          {!isLast && (
            <TouchableOpacity onPress={finish} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={next}
            style={[
              styles.nextBtn,
              { backgroundColor: SLIDES[activeIndex].accentColor },
              isLast && styles.nextBtnFull,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
            <Text style={styles.nextArrow}>{isLast ? '  🚀' : '  →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg0,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 180,
  },
  emojiCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  emojiInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
  },
  textWrap: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 52,
    backgroundColor: bg0,
    borderTopWidth: 1,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: border,
  },
  skipText: {
    color: textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextBtnFull: {
    flex: 1,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
