import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    key: "send",
    icon: "package" as const,
    gradColors: ["#F97316", "#EA580C"] as [string, string],
    bgColors: ["#1C0D04", "#0F0A04"] as [string, string],
    accentColor: "#FED7AA",
    title: "Send Anything,\nAnywhere",
    subtitle: "Ship packages across the country through people already traveling your route. Fast, affordable, and personal.",
    feature1: { icon: "zap" as const, text: "Same-day matching with travelers" },
    feature2: { icon: "shield" as const, text: "Every carrier is verified & rated" },
  },
  {
    key: "track",
    icon: "map-pin" as const,
    gradColors: ["#3B82F6", "#06B6D4"] as [string, string],
    bgColors: ["#1C0D04", "#0F0A04"] as [string, string],
    accentColor: "#93C5FD",
    title: "Track Every\nStep Live",
    subtitle: "Real-time status updates from the moment your package is picked up to the final delivery.",
    feature1: { icon: "bell" as const, text: "Push alerts at every milestone" },
    feature2: { icon: "message-circle" as const, text: "Direct chat with your carrier" },
  },
  {
    key: "trust",
    icon: "star" as const,
    gradColors: ["#10B981", "#059669"] as [string, string],
    bgColors: ["#1C0D04", "#0F0A04"] as [string, string],
    accentColor: "#6EE7B7",
    title: "Trusted\nCommunity",
    subtitle: "Every carrier is identity-verified with real reviews from past senders. Your package is always in safe hands.",
    feature1: { icon: "check-circle" as const, text: "ID & phone verification" },
    feature2: { icon: "award" as const, text: "Rating system for every delivery" },
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentSlide(next);
    } else {
      handleGetStarted();
    }
  }

  async function handleGetStarted() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem("pg_onboarded", "true");
    router.replace("/auth/register");
  }

  function handleSkip() {
    handleGetStarted();
  }

  async function handleSignIn() {
    Haptics.selectionAsync();
    await AsyncStorage.setItem("pg_onboarded", "true");
    router.replace("/auth/login");
  }

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View style={styles.screen}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          style={[styles.skipBtn, { top: topPad + 12 }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.slides}
      >
        {SLIDES.map((s, idx) => (
          <LinearGradient
            key={s.key}
            colors={s.bgColors}
            style={[styles.slide, { width, paddingTop: topPad + 40 }]}
          >
            {/* Logo */}
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.slideLogo}
              resizeMode="contain"
              tintColor="#F97316"
            />

            {/* Icon */}
            <LinearGradient colors={s.gradColors} style={styles.iconRing}>
              <View style={styles.iconInner}>
                <LinearGradient colors={s.gradColors} style={styles.iconCircle}>
                  <Feather name={s.icon} size={44} color="#fff" />
                </LinearGradient>
              </View>
            </LinearGradient>

            {/* Text */}
            <Text style={[styles.slideTitle, { color: "#FFFFFF" }]}>{s.title}</Text>
            <Text style={styles.slideSub}>{s.subtitle}</Text>

            {/* Feature pills */}
            <View style={styles.features}>
              <View style={[styles.featureRow, { borderColor: `${s.accentColor}30` }]}>
                <LinearGradient colors={s.gradColors} style={styles.featureIcon}>
                  <Feather name={s.feature1.icon} size={14} color="#fff" />
                </LinearGradient>
                <Text style={[styles.featureText, { color: s.accentColor }]}>{s.feature1.text}</Text>
              </View>
              <View style={[styles.featureRow, { borderColor: `${s.accentColor}30` }]}>
                <LinearGradient colors={s.gradColors} style={styles.featureIcon}>
                  <Feather name={s.feature2.icon} size={14} color="#fff" />
                </LinearGradient>
                <Text style={[styles.featureText, { color: s.accentColor }]}>{s.feature2.text}</Text>
              </View>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <LinearGradient
        colors={["transparent", "#0F0A04", "#0F0A04"]}
        style={[styles.bottomControls, { paddingBottom: bottomPad + 24 }]}
      >
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                Haptics.selectionAsync();
                scrollRef.current?.scrollTo({ x: i * width, animated: true });
                setCurrentSlide(i);
              }}
            >
              {i === currentSlide ? (
                <LinearGradient
                  colors={slide.gradColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dotActive}
                />
              ) : (
                <View style={styles.dotInactive} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.88} style={styles.nextBtn}>
          <LinearGradient
            colors={slide.gradColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGrad}
          >
            {isLast ? (
              <>
                <Text style={styles.nextText}>Get Started</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            ) : (
              <>
                <Text style={styles.nextText}>Next</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Login shortcut */}
        <TouchableOpacity onPress={handleSignIn} style={styles.loginBtn}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={[styles.loginText, { color: "#F97316", fontFamily: "Inter_600SemiBold" }]}>Sign In</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  skipBtn: { position: "absolute", right: 20, zIndex: 10 },
  skipText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_500Medium" },
  slides: { flex: 1 },
  slide: { alignItems: "center", paddingHorizontal: 32, paddingBottom: 200 },
  slideLogo: { width: 110, height: 38, marginBottom: 28 },
  iconRing: { width: 160, height: 160, borderRadius: 80, padding: 4, alignItems: "center", justifyContent: "center", marginBottom: 36, opacity: 0.9 },
  iconInner: { width: 152, height: 152, borderRadius: 76, backgroundColor: "rgba(13,11,30,0.5)", alignItems: "center", justifyContent: "center" },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  slideTitle: { fontSize: 34, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 42, marginBottom: 16 },
  slideSub: { color: "#94A3B8", fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, marginBottom: 28 },
  features: { gap: 10, width: "100%" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, borderWidth: 1 },
  featureIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  bottomControls: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 40, alignItems: "center", gap: 16 },
  dots: { flexDirection: "row", gap: 8, marginBottom: 4 },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  dotInactive: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  nextBtn: { borderRadius: 20, overflow: "hidden", width: "100%" },
  nextGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 8 },
  nextText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  loginBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  loginText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular" },
});
