import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "../context/AuthContext";
import AppSplash from "../components/AppSplash";
import { bg0 } from "../constants/Colors";

// Keep the native splash visible until we're ready
SplashScreen.preventAutoHideAsync();

// ─── Custom dark theme that matches our palette ────────────────────────────────
const BookStoreDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: bg0,
    card: "#0F1423",
    border: "#252E45",
    primary: "#7C6FF7",
    notification: "#7C6FF7",
    text: "#F0F2FF",
  },
};

// ─── Inner navigator — handles routing after splash ───────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  // Check if user has seen onboarding
  useEffect(() => {
    AsyncStorage.getItem("onboarding_done").then((val) => {
      setOnboardingSeen(val === "true");
    });
  }, []);

  // Once splash animation AND auth init are both done, decide where to go
  useEffect(() => {
    if (!splashDone || loading || onboardingSeen === null) return;

    if (!onboardingSeen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace("/onboarding" as any);
    } else if (!user) {
      router.replace("/auth/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [splashDone, loading, user, onboardingSeen]);

  const handleSplashFinish = () => {
    SplashScreen.hideAsync();
    setSplashDone(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg0 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg0 },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* In-app animated splash — rendered on top until done */}
      {showSplash && (
        <AppSplash
          onFinish={() => {
            setShowSplash(false);
            handleSplashFinish();
          }}
        />
      )}
    </View>
  );
}

// ─── Root — providers live here ───────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Don't render anything until fonts are ready
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={BookStoreDarkTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
