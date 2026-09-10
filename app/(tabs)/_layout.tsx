import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { HapticTab } from "@/components/HapticTab";
import {
  bg0,
  bg1,
  primary,
  tabActive,
  tabInactive,
  border,
  textPrimary,
} from "@/constants/Colors";

// ─── Custom tab bar icon ───────────────────────────────────────────────────────
function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconEmoji, focused && styles.iconEmojiActive]}>
        {emoji}
      </Text>
    </View>
  );
}

// ─── Blurred iOS tab bar background ───────────────────────────────────────────
function DarkTabBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
    );
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: bg1 }]} />;
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: DarkTabBackground,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
          marginBottom: Platform.OS === "ios" ? 0 : 6,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: border,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 8,
          ...(Platform.OS === "ios" ? { position: "absolute" } : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Sell",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📤" label="Sell" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" label="Library" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: primary + "22", // 13% opacity tint behind active icon
  },
  iconEmoji: {
    fontSize: 20,
    opacity: 0.45,
  },
  iconEmojiActive: {
    opacity: 1,
    fontSize: 22,
  },
});
