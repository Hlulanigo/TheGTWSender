import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import GradientButton from "@/components/GradientButton";

const CARRIER_STATS: Record<string, { deliveries: number; responseTime: string; joinDate: string; bio: string }> = {
  u2: { deliveries: 48, responseTime: "< 30 min", joinDate: "Jan 2024", bio: "Frequent NY–LA traveler. I take great care of every package." },
  u3: { deliveries: 36, responseTime: "< 45 min", joinDate: "Mar 2024", bio: "Chicago to Houston every two weeks for work. Happy to help!" },
  u4: { deliveries: 64, responseTime: "< 15 min", joinDate: "Nov 2023", bio: "Full-time traveler. Specializes in urgent and fragile deliveries." },
  u5: { deliveries: 22, responseTime: "< 1 hr", joinDate: "Jun 2024", bio: "Seattle–SF regular. Careful with all package sizes." },
  u6: { deliveries: 31, responseTime: "< 45 min", joinDate: "Apr 2024", bio: "Boston–Philly weekly commuter. Reliable and punctual." },
};

const BADGE_COLORS: Record<string, [string, string]> = {
  u2: ["#F97316", "#EA580C"],
  u3: ["#3B82F6", "#06B6D4"],
  u4: ["#10B981", "#059669"],
  u5: ["#F59E0B", "#D97706"],
  u6: ["#EC4899", "#BE185D"],
};

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather
          key={i}
          name="star"
          size={13}
          color={i <= Math.round(rating) ? "#F59E0B" : "#374151"}
        />
      ))}
    </View>
  );
}

export default function CarrierProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { trips, getCarrierReviews } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const trip = trips.find((t) => t.id === id);
  if (!trip) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: "#94A3B8", fontFamily: "Inter_400Regular" }}>Carrier not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#F97316", fontFamily: "Inter_600SemiBold", marginTop: 8 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = CARRIER_STATS[trip.travelerId] ?? { deliveries: 10, responseTime: "< 1 hr", joinDate: "2024", bio: "" };
  const reviews = getCarrierReviews(trip.travelerId);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : trip.travelerRating;
  const gradColors = BADGE_COLORS[trip.travelerId] ?? ["#F97316", "#EA580C"];

  const otherTrips = trips.filter((t) => t.travelerId === trip.travelerId && t.status === "open");

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#1C0D04", "#0F0A04"]} style={[styles.hero, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <LinearGradient colors={gradColors} style={styles.avatar}>
              <Text style={styles.avatarText}>{trip.travelerInitials}</Text>
            </LinearGradient>

            <Text style={styles.name}>{trip.travelerName}</Text>

            <View style={styles.ratingRow}>
              <StarRow rating={avgRating} />
              <Text style={styles.ratingNum}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({reviews.length} reviews)</Text>
            </View>

            <View style={styles.badges}>
              <View style={styles.badgeItem}>
                <Feather name="check-circle" size={12} color="#10B981" />
                <Text style={styles.badgeText}>ID Verified</Text>
              </View>
              <View style={styles.badgeDot} />
              <View style={styles.badgeItem}>
                <Feather name="phone" size={12} color="#3B82F6" />
                <Text style={styles.badgeText}>Phone Verified</Text>
              </View>
              <View style={styles.badgeDot} />
              <View style={styles.badgeItem}>
                <Feather name="shield" size={12} color="#F97316" />
                <Text style={styles.badgeText}>Community Member</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            <LinearGradient colors={["rgba(249,115,22,0.2)", "rgba(249,115,22,0.05)"]} style={styles.statBox}>
              <Text style={styles.statValue}>{stats.deliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </LinearGradient>
            <LinearGradient colors={["rgba(245,158,11,0.2)", "rgba(245,158,11,0.05)"]} style={styles.statBox}>
              <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </LinearGradient>
            <LinearGradient colors={["rgba(16,185,129,0.2)", "rgba(16,185,129,0.05)"]} style={styles.statBox}>
              <Text style={[styles.statValue, { fontSize: 13 }]}>{stats.responseTime}</Text>
              <Text style={styles.statLabel}>Response</Text>
            </LinearGradient>
          </View>

          {/* Bio */}
          {stats.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{stats.bio}</Text>
                <Text style={styles.joinDate}>Member since {stats.joinDate}</Text>
              </View>
            </View>
          ) : null}

          {/* Upcoming trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Trips</Text>
            {otherTrips.map((t) => (
              <View key={t.id} style={styles.tripItem}>
                <View style={styles.tripRoute}>
                  <View style={[styles.routeDot, { backgroundColor: "#F97316" }]} />
                  <Text style={styles.tripCity}>{t.fromCity}</Text>
                  <Feather name="arrow-right" size={12} color="#EA580C" />
                  <Text style={styles.tripCity}>{t.toCity}</Text>
                  <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
                </View>
                <View style={styles.tripMeta}>
                  <View style={styles.tripChip}>
                    <Feather name="calendar" size={11} color="#64748B" />
                    <Text style={styles.tripChipText}>{t.date}</Text>
                  </View>
                  <View style={styles.tripChip}>
                    <Feather name="clock" size={11} color="#64748B" />
                    <Text style={styles.tripChipText}>{t.departureTime}</Text>
                  </View>
                  <View style={styles.tripChip}>
                    <Feather name="dollar-sign" size={11} color="#10B981" />
                    <Text style={[styles.tripChipText, { color: "#10B981" }]}>${t.pricePerKg}/kg</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.reviewsAvg}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text style={styles.reviewsAvgText}>{avgRating.toFixed(1)} · {reviews.length} reviews</Text>
                </View>
              </View>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <LinearGradient colors={["#3B82F6", "#F97316"]} style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitials}>{review.reviewerInitials}</Text>
                    </LinearGradient>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{review.reviewerName}</Text>
                      <View style={styles.reviewMeta}>
                        <StarRow rating={review.rating} />
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  <View style={styles.reviewParcel}>
                    <Feather name="package" size={11} color="#64748B" />
                    <Text style={styles.reviewParcelText}>{review.parcelTitle}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: (Platform.OS === "web" ? 20 : insets.bottom) + 12 }]}>
        <GradientButton
          title={`Request ${trip.travelerName.split(" ")[0]}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: "/trip/[id]", params: { id: trip.id } });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  content: {},
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  heroContent: { alignItems: "center" },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarText: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold" },
  name: { color: "#FFFFFF", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  ratingNum: { color: "#F59E0B", fontSize: 15, fontFamily: "Inter_700Bold" },
  ratingCount: { color: "#64748B", fontSize: 13, fontFamily: "Inter_400Regular" },
  badges: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  badgeItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_400Regular" },
  badgeDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#374151" },
  body: { padding: 20 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  statValue: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  statLabel: { color: "#94A3B8", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  bioCard: { backgroundColor: "#1C1208", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  bioText: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 8 },
  joinDate: { color: "#64748B", fontSize: 12, fontFamily: "Inter_400Regular" },
  tripItem: { backgroundColor: "#1C1208", borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  tripRoute: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  tripCity: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tripMeta: { flexDirection: "row", gap: 12 },
  tripChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  tripChipText: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  reviewsAvg: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewsAvgText: { color: "#F59E0B", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewCard: { backgroundColor: "#1C1208", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewInitials: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  reviewInfo: { flex: 1 },
  reviewName: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  reviewMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewDate: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewText: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 8 },
  reviewParcel: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewParcelText: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  bottomCta: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#0F0A04", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
});
