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
import { useApp } from "@/context/AppContext";
import StatusTimeline from "@/components/StatusTimeline";
import GradientButton from "@/components/GradientButton";

const SIZE_LABELS: Record<string, string> = {
  small: "Small (< 1kg)",
  medium: "Medium (1–5kg)",
  large: "Large (5–15kg)",
};

const STATUS_COLORS: Record<string, [string, string]> = {
  pending: ["#F59E0B", "#D97706"],
  matched: ["#7C3AED", "#4F46E5"],
  in_transit: ["#3B82F6", "#06B6D4"],
  delivered: ["#10B981", "#059669"],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  matched: "Matched",
  in_transit: "In Transit",
  delivered: "Delivered",
};

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { parcels, trips } = useApp();

  const parcel = parcels.find((p) => p.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!parcel) {
    return (
      <View style={[styles.screen, styles.notFound]}>
        <Feather name="inbox" size={40} color="#64748B" />
        <Text style={styles.notFoundText}>Package not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const matchedTrip = parcel.matchedTripId
    ? trips.find((t) => t.id === parcel.matchedTripId)
    : null;

  const gradColors = STATUS_COLORS[parcel.status] ?? STATUS_COLORS.pending;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#1A0D3D", "#0D0B1E"]}
          style={[styles.header, { paddingTop: topPad + 8 }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <LinearGradient colors={gradColors} style={styles.packageIcon}>
              <Feather name="package" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.packageTitle}>{parcel.title}</Text>
            <View style={styles.statusBadge}>
              <LinearGradient
                colors={gradColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeGrad}
              >
                <Text style={styles.badgeText}>
                  {STATUS_LABELS[parcel.status]}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Route card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Route</Text>
            <View style={styles.routeRow}>
              <View style={styles.routeEndpoint}>
                <View style={[styles.routeDot, { backgroundColor: "#7C3AED" }]} />
                <View>
                  <Text style={styles.routeCity}>{parcel.fromCity}</Text>
                  <Text style={styles.routeFull}>{parcel.from}</Text>
                </View>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <Feather name="chevrons-right" size={16} color="#4F46E5" />
                <View style={styles.routeLine} />
              </View>
              <View style={styles.routeEndpoint}>
                <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
                <View>
                  <Text style={styles.routeCity}>{parcel.toCity}</Text>
                  <Text style={styles.routeFull}>{parcel.to}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Package Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Feather name="layers" size={14} color="#7C3AED" />
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{parcel.weight}kg</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="box" size={14} color="#3B82F6" />
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>
                  {parcel.size.charAt(0).toUpperCase() + parcel.size.slice(1)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="dollar-sign" size={14} color="#10B981" />
                <Text style={styles.detailLabel}>Reward</Text>
                <Text style={[styles.detailValue, { color: "#10B981" }]}>
                  ${parcel.reward}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="clock" size={14} color="#F59E0B" />
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>{parcel.createdAt}</Text>
              </View>
            </View>
            {parcel.description ? (
              <View style={styles.description}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{parcel.description}</Text>
              </View>
            ) : null}
          </View>

          {/* Carrier info */}
          {matchedTrip && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Carrier</Text>
              <View style={styles.carrierRow}>
                <LinearGradient
                  colors={["#7C3AED", "#4F46E5"]}
                  style={styles.carrierAvatar}
                >
                  <Text style={styles.carrierInitials}>
                    {matchedTrip.travelerInitials}
                  </Text>
                </LinearGradient>
                <View style={styles.carrierInfo}>
                  <Text style={styles.carrierName}>
                    {matchedTrip.travelerName}
                  </Text>
                  <View style={styles.carrierRating}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={styles.carrierRatingText}>
                      {matchedTrip.travelerRating}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.msgBtn}>
                  <LinearGradient
                    colors={["rgba(124,58,237,0.2)", "rgba(79,70,229,0.15)"]}
                    style={styles.msgBtnGrad}
                  >
                    <Feather name="message-circle" size={18} color="#7C3AED" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tracking timeline */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tracking</Text>
            <StatusTimeline steps={parcel.trackingSteps} />
          </View>

          {parcel.status === "pending" && (
            <GradientButton
              title="Cancel Request"
              onPress={() => router.back()}
              gradientColors={["#EF4444", "#DC2626"]}
              style={styles.cancelBtn}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  notFound: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    color: "#94A3B8",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  backLink: {
    color: "#7C3AED",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  content: {},
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerContent: { alignItems: "center" },
  packageIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  packageTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statusBadge: { borderRadius: 12, overflow: "hidden" },
  badgeGrad: { paddingVertical: 6, paddingHorizontal: 18 },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  body: { padding: 20 },
  card: {
    backgroundColor: "#1E1A3A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeEndpoint: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeCity: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  routeFull: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  routeArrow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  routeLine: { width: 16, height: 1, backgroundColor: "rgba(124,58,237,0.3)" },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailItem: {
    width: "45%",
    backgroundColor: "#14122A",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  detailLabel: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  descriptionLabel: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  descriptionText: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  carrierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carrierAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  carrierInitials: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  carrierInfo: { flex: 1 },
  carrierName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  carrierRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  carrierRatingText: {
    color: "#F59E0B",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  msgBtn: { borderRadius: 14, overflow: "hidden" },
  msgBtnGrad: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: { marginTop: 8 },
});
