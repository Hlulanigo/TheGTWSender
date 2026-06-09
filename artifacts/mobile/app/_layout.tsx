import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function UserSync() {
  const { user: authUser } = useAuth();
  const { updateUser } = useApp();
  useEffect(() => {
    if (authUser?.name || authUser?.email) {
      updateUser({
        ...(authUser.name ? { name: authUser.name } : {}),
        ...(authUser.email ? { email: authUser.email } : {}),
      });
    }
  }, [authUser?.name, authUser?.email]);
  return null;
}

function RootLayoutNav() {
  const { user, loading, pendingVerification } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    async function redirect() {
      const inAuthGroup = (segments[0] as string | undefined) === "auth";
      const inOnboarding = (segments[0] as string | undefined) === "onboarding";

      if (!user) {
        const onboarded = await AsyncStorage.getItem("pg_onboarded");
        if (!onboarded) {
          router.replace("/onboarding");
        } else if (!inAuthGroup) {
          router.replace("/auth/login");
        }
      } else if (pendingVerification) {
        if (!inAuthGroup || segments[1] !== "verify-email") {
          router.replace("/auth/verify-email");
        }
      } else if (inAuthGroup || inOnboarding) {
        router.replace("/(tabs)");
      }
    }

    redirect();
  }, [user, loading, pendingVerification, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/verify-email" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="parcel/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="trip/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="carrier/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="review/[id]" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="messages/index" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="messages/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <UserSync />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AppProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
