import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- layout constants (make these match your styles) ---
const SIDE_MARGIN = 20; // must match left/right in styles (tabBarContainer)
const TAB_BAR_HORIZONTAL_PADDING = 8; // must match paddingHorizontal in tabBar style
const TAB_COUNT = 4;
const TAB_BAR_HEIGHT = 70;

const TAB_BAR_WIDTH = width - SIDE_MARGIN * 2;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const BLOB_WIDTH = TAB_WIDTH - 16;
const BLOB_HEIGHT = 54;

function CustomTabBar({ state, descriptors, navigation }) {
  const animatedIndex = useRef(new Animated.Value(state.index)).current;
  const [isDragging, setIsDragging] = useState(false);

  // spring to current index when not dragging
  useEffect(() => {
    if (!isDragging) {
      Animated.spring(animatedIndex, {
        toValue: state.index,
        useNativeDriver: true,
        tension: 45,
        friction: 9,
      }).start();
    }
  }, [state.index, isDragging, animatedIndex]);

  // pan responder: do not capture simple taps — only start on horizontal move
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 6 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: (_, gestureState) => {
        const startPx = state.index * TAB_WIDTH;
        const newPx = startPx + gestureState.dx;
        const clampedPx = Math.max(0, Math.min((TAB_COUNT - 1) * TAB_WIDTH, newPx));
        // set value in "index units" so interpolation maps it to pixel X
        animatedIndex.setValue(clampedPx / TAB_WIDTH);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalPx = state.index * TAB_WIDTH + gestureState.dx;
        const targetIndex = Math.round(finalPx / TAB_WIDTH);
        const clampedIndex = Math.max(0, Math.min(TAB_COUNT - 1, targetIndex));
        setIsDragging(false);
        if (clampedIndex !== state.index) {
          navigation.navigate(state.routes[clampedIndex].name);
        } else {
          Animated.spring(animatedIndex, {
            toValue: state.index,
            useNativeDriver: true,
            tension: 45,
            friction: 9,
          }).start();
        }
      },
    })
  ).current;

  // build input/output ranges dynamically so it works for any tab count
  const inputRange = Array.from({ length: TAB_COUNT }, (_, i) => i);
  const outputRange = inputRange.map(
    (i) =>
      TAB_BAR_HORIZONTAL_PADDING + // left inner padding of tabBar
      i * TAB_WIDTH + // position of tab
      (TAB_WIDTH - BLOB_WIDTH) / 2 // center the blob inside the tab
  );

  const translateX = animatedIndex.interpolate({
    inputRange,
    outputRange,
  });

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        {/* attach panHandlers to tabBar so drag works from anywhere on the bar */}
        <View style={styles.tabBar} {...panResponder.panHandlers}>
          {/* Animated blob (glass) */}
          <Animated.View
            style={[
              styles.blob,
              {
                width: BLOB_WIDTH,
                height: BLOB_HEIGHT,
                transform: [{ translateX }],
                top: (TAB_BAR_HEIGHT - BLOB_HEIGHT) / 2,
              },
            ]}
          >
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.75)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </BlurView>
          </Animated.View>

          {/* Tab buttons */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] || {};
            const isFocused = state.index === index;

            const onPress = () => {
              if (!isFocused) navigation.navigate(route.name);
            };

            // options.tabBarIcon is a function that returns an element
            const iconElement = options?.tabBarIcon
              ? options.tabBarIcon({
                  color: isFocused ? '#000' : '#888',
                  size: 24,
                })
              : null;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.85}
              >
                {iconElement}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    backgroundColor: 'rgba(249,249,249,0.5)',
    alignItems: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: BLOB_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.9)',
    elevation: 6,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // icons sit above blob visually
  },
});

