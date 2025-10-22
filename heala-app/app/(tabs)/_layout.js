import { Tabs } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Removed: useEffect, useRef, and Animated imports

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 10, bottom: insets.bottom + 10 },
        ],
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require('@/assets/images/Home.png')}
              focused={focused}
              style={styles.icon}
            />
          ),
        }}
      />
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require('@/assets/images/Person.png')}
              focused={focused}
              style={styles.iconSmall}
            />
          ),
        }}
      />
      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require('@/assets/images/History.png')}
              focused={focused}
              style={styles.icon}
            />
          ),
        }}
      />
      {/* Upload Tab */}
      <Tabs.Screen
        name="upload"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require('@/assets/images/Plus.png')}
              focused={focused}
              style={styles.iconLarge}
            />
          ),
        }}
      />

      {/* Chatbot Tab */}
      <Tabs.Screen
        name="chatbot"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={require('@/assets/images/heala-app-use.png')}
              focused={focused}
              style={styles.iconLarge}
            />
          ),
        }}
      />

    </Tabs>
  );
}

function TabIcon({ source, focused, style }) {
  // Removed: scaleAnim and pulseAnim Animated.Value references
  // Removed: useEffect hook for animations

  return (
    <View style={styles.iconContainer}>
      {/* Liquid oval background - Now a static View */}
      <View
        style={[
          styles.liquidOval,
          // Apply background opacity and scale statically based on 'focused' state
          {
            opacity: focused ? 1 : 0,
            transform: [{ scale: focused ? 1 : 0 }],
          },
        ]}
      />
      {/* Icon */}
      <Image
        source={source}
        style={[style, { tintColor: focused ? "#1E90FF" : "#999" }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffffde",
    position: "absolute",
    left: 10,
    right: 10,
    height: 70,
    borderRadius: 30,
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 0.5,
    borderColor: "rgba(200,200,200,0.2)",
    marginHorizontal: 30,
    paddingTop: 15,
    paddingHorizontal: 5
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 40,
  },
  liquidOval: {
    position: "absolute",
    width: 80,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(165, 180, 196, 0.15)",
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    width: 60,
    height: 30,
    marginHorizontal: 10,
    paddingHorizontal: 10
  },
  iconSmall: {
    width: 50,
    height: 26,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  iconLarge: {
    width: 65,
    height: 35,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
});



