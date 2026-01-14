import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC = () => {
  const move1 = useSharedValue(0);
  const move2 = useSharedValue(0);

  useEffect(() => {
    move1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
    move2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: move1.value * (width * 0.2) },
      { translateY: move1.value * (height * 0.1) },
    ],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: -move2.value * (width * 0.3) },
      { translateY: -move2.value * (height * 0.15) },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        // Note: LinearGradient might not be in reanimated by default, 
        // fallback to colored views if Expo LinearGradient isn't reanimated-ready
        // BUT we'll just use blurred blobs for a modern look
        style={[styles.blob, styles.blob1, style1]}
      />
      <Animated.View
        style={[styles.blob, styles.blob2, style2]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    zIndex: -1,
  },
  blob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    opacity: 0.15,
  },
  blob1: {
    top: -width * 0.2,
    right: -width * 0.2,
    backgroundColor: theme.colors.primary,
  },
  blob2: {
    bottom: -width * 0.1,
    left: -width * 0.2,
    backgroundColor: theme.colors.accent,
  },
});
