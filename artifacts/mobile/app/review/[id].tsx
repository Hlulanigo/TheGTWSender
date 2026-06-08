import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import GradientButton from "@/components/GradientButton";

const PROMPTS = [
  "Handled with care",
  "Great communication",
  "On time delivery",
  "Would book again",
  "Very professional",
  "Kept me updated",
];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { parcels, trips, addRating } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const parcel = parcels.find((p) => p.id === id);
  const carrier = parcel?.matchedTripId ? trips.find((t) => t.id === parcel.matchedTripId) : null;

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const displayRating = hoveredStar || rating;

  const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  function togglePrompt(p: string) {
    Haptics.selectionAsync();
    setSelectedPrompts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleSubmit() {
    if (rating === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const fullComment = [comment, ...selectedPrompts].filter(Boolean).join(". ");
    addRating(id!, rating, fullComment);
    setSubmitted(true);
  }

  if (!parcel) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: "#94A3B8", fontFamily: "Inter_400Regular" }}>Package not found</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[styles.screen, styles.successScreen, { paddingTop: topPad }]}>
        <LinearGradient colors={["#10B981", "#059669"]} style={styles.successIcon}>
          <Feather name="check" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.successTitle}>Review Submitted!</Text>
        <Text style={styles.successSub}>
          Thank you for rating your delivery experience. Your feedback helps the GTW community.
        </Text>
        <View style={styles.starsSubmitted}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Feather key={i} name="star" size={28} color={i <= rating ? "#F59E0B" : "#374151"} />
          ))}
        </View>
        <GradientButton
          title="Back to My Packages"
          onPress={() => router.push("/(tabs)/track")}
          style={styles.successBtn}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient colors={["#1C0D04", "#0F0A04"]} style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Delivery</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Package summary */}
        <View style={styles.packageCard}>
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.packageIcon}>
            <Feather name="check-circle" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.packageInfo}>
            <Text style={styles.packageTitle}>{parcel.title}</Text>
            <Text style={styles.packageRoute}>{parcel.fromCity} → {parcel.toCity}</Text>
          </View>
          <View style={styles.deliveredBadge}>
            <Text style={styles.deliveredText}>Delivered</Text>
          </View>
        </View>

        {/* Carrier */}
        {carrier && (
          <View style={styles.carrierCard}>
            <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.carrierAvatar}>
              <Text style={styles.carrierInitials}>{carrier.travelerInitials}</Text>
            </LinearGradient>
            <View style={styles.carrierInfo}>
              <Text style={styles.carrierName}>{carrier.travelerName}</Text>
              <View style={styles.carrierRating}>
                <Feather name="star" size={11} color="#F59E0B" />
                <Text style={styles.carrierRatingText}>{carrier.travelerRating} overall rating</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stars */}
        <View style={styles.starsSection}>
          <Text style={styles.starsTitle}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setRating(star);
                }}
                activeOpacity={0.8}
              >
                <Feather
                  name="star"
                  size={48}
                  color={star <= displayRating ? "#F59E0B" : "#374151"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          {displayRating > 0 && (
            <Text style={styles.ratingLabel}>{RATING_LABELS[displayRating]}</Text>
          )}
        </View>

        {/* Quick prompts */}
        {rating > 0 && (
          <View style={styles.promptSection}>
            <Text style={styles.promptTitle}>What stood out? (optional)</Text>
            <View style={styles.promptGrid}>
              {PROMPTS.map((p) => {
                const active = selectedPrompts.includes(p);
                return (
                  <TouchableOpacity key={p} onPress={() => togglePrompt(p)} activeOpacity={0.8}>
                    {active ? (
                      <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.promptChip}>
                        <Feather name="check" size={12} color="#fff" />
                        <Text style={styles.promptTextActive}>{p}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.promptChipInactive}>
                        <Text style={styles.promptText}>{p}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Comment */}
        {rating > 0 && (
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Add a comment (optional)</Text>
            <View style={styles.commentWrap}>
              <TextInput
                style={styles.commentInput}
                placeholder="Share details about your experience..."
                placeholderTextColor="#64748B"
                multiline
                value={comment}
                onChangeText={setComment}
                maxLength={300}
              />
              <Text style={styles.charCount}>{comment.length}/300</Text>
            </View>
          </View>
        )}

        {/* Submit */}
        <GradientButton
          title={rating === 0 ? "Select a Rating" : `Submit ${rating}-Star Review`}
          onPress={handleSubmit}
          gradientColors={rating > 0 ? ["#F97316", "#3B82F6"] : ["#374151", "#374151"]}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  packageCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1208", borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  packageIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  packageInfo: { flex: 1 },
  packageTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  packageRoute: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  deliveredBadge: { backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  deliveredText: { color: "#10B981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  carrierCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1208", borderRadius: 16, padding: 14, marginBottom: 24, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  carrierAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  carrierInitials: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  carrierInfo: { flex: 1 },
  carrierName: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  carrierRating: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  carrierRatingText: { color: "#F59E0B", fontSize: 12, fontFamily: "Inter_500Medium" },
  starsSection: { alignItems: "center", marginBottom: 24 },
  starsTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 16, textAlign: "center" },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  starIcon: {},
  ratingLabel: { color: "#F59E0B", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  promptSection: { marginBottom: 20 },
  promptTitle: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 12 },
  promptGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  promptChip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  promptChipInactive: { backgroundColor: "#1C1208", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  promptText: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_500Medium" },
  promptTextActive: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  commentSection: { marginBottom: 20 },
  commentLabel: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  commentWrap: { backgroundColor: "#1C1208", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", padding: 14 },
  commentInput: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 80, textAlignVertical: "top" },
  charCount: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 8 },
  submitBtn: { marginTop: 8 },
  successScreen: { alignItems: "center", justifyContent: "center", padding: 32 },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
  successSub: { color: "#94A3B8", fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  starsSubmitted: { flexDirection: "row", gap: 8, marginBottom: 32 },
  successBtn: { width: "100%", marginBottom: 12 },
  dismissBtn: { paddingVertical: 12 },
  dismissText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_500Medium" },
});
