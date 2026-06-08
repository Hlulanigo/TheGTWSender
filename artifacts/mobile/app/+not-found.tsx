import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.screen, { paddingTop: topPad }]}>
        <LinearGradient
          colors={["#1A0D3D", "#0D0B1E"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <LinearGradient
            colors={["#7C3AED", "#4F46E5"]}
            style={styles.iconCircle}
          >
            <Feather name="compass" size={40} color="#fff" />
          </LinearGradient>

          <Text style={styles.code}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.sub}>
            This screen doesn't exist in ParcelGo.
          </Text>

          <Link href="/" style={styles.link}>
            <LinearGradient
              colors={["#7C3AED", "#4F46E5", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.linkGrad}
            >
              <Feather name="home" size={16} color="#fff" />
              <Text style={styles.linkText}>Go to Home</Text>
            </LinearGradient>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0D0B1E",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  code: {
    color: "rgba(124,58,237,0.35)",
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    lineHeight: 72,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  sub: {
    color: "#64748B",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  link: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  linkGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
