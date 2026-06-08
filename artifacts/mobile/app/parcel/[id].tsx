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
import StatusTimeline from "@/components/StatusTimeline";
import GradientButton from "@/components/GradientButton";

const SIZE_LABELS: Record<string, string> = {
  small: "Small (< 1kg)",
  medium: "Medium (1–5kg)",
  large: "Large (5–15kg)",
};

const STATUS_COLORS: Record<string, [string, string]> = {
  pending: ["#F59E0B", "#D97706"],
  matched: ["#F97316", "#EA580C"],
  in_transit: ["#3B82F6", "#06B6D4"],
  delivered: ["#10B981", "#059669"],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Carrier",
  matched: "Carrier Matched",
  in_transit: "In Transit",
  delivered: "Delivered",
};

const STATUS_ETA: Record<string, string> = {
  pending: "Waiting for a carrier to accept",
  matched: "Carrier confirmed — pickup soon",
  in_transit: "Est. delivery today",
  delivered: "Successfully delivered",
};

function ProgressBar({ steps }: { steps: { completed: boolean }[] }) {
  const done = steps.filter((s) => s.completed).length;
  const pct = Math.round((done / steps.length) * 100);
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <LinearGradient
          colors={["#F97316", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[pb.fill, { width: `${pct}%` as any }]}
        />
      </View>
      <Text style={pb.label}>{pct}% complete</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  wrap: { marginBottom: 0 },
  track: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 6 },
  fill: { height: 6, borderRadius: 3 },
  label: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
});

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { parcels, trips, conversations, ratedDeliveries } = useApp();

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

  const matchedTrip = parcel.matchedTripId ? trips.find((t) => t.id === parcel.matchedTripId) : null;
  const conversation = conversations.find((c) => c.parcelId === parcel.id);
  const gradColors = STATUS_COLORS[parcel.status] ?? STATUS_COLORS.pending;
  const alreadyRated = ratedDeliveries.includes(parcel.id);

  function handleMessageCarrier() {
    Haptics.selectionAsync();
    if (conversation) {
      router.push({ pathname: "/messages/[id]", params: { id: conversation.id } });
    } else {
      router.push("/(tabs)/messages");
    }
  }

  function handleViewCarrier() {
    if (matchedTrip) {
      Haptics.selectionAsync();
      router.push({ pathname: "/carrier/[id]", params: { id: matchedTrip.id } });
    }
  }

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
        <LinearGradient colors={["#1C0D04", "#0F0A04"]} style={[styles.header, { paddingTop: topPad + 8 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {matchedTrip && (
              <TouchableOpacity style={styles.headerActionBtn} onPress={handleMessageCarrier}>
                <Feather name="message-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerContent}>
            <LinearGradient colors={gradColors} style={styles.packageIcon}>
              <Feather name="package" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.packageTitle}>{parcel.title}</Text>

            <View style={styles.statusRow}>
              <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.badgeGrad}>
                <Text style={styles.badgeText}>{STATUS_LABELS[parcel.status]}</Text>
              </LinearGradient>
            </View>

            <View style={styles.etaRow}>
              {parcel.status === "in_transit" && (
                <View style={styles.livePulse} />
              )}
              <Text style={styles.etaText}>{STATUS_ETA[parcel.status]}</Text>
            </View>
          </View>

          {/* Progress bar in header */}
          <View style={styles.progressWrap}>
            <ProgressBar steps={parcel.trackingSteps} />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Route */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Route</Text>
            <View style={styles.routeRow}>
              <View style={styles.routeEndpoint}>
                <View style={[styles.routeDot, { backgroundColor: "#F97316" }]} />
                <View>
                  <Text style={styles.routeCity}>{parcel.fromCity}</Text>
                  <Text style={styles.routeFull}>{parcel.from}</Text>
                </View>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <LinearGradient colors={["#F97316", "#3B82F6"]} style={styles.arrowCircle}>
                  <Feather name="chevrons-right" size={12} color="#fff" />
                </LinearGradient>
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
                <Feather name="layers" size={14} color="#F97316" />
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{parcel.weight}kg</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="box" size={14} color="#3B82F6" />
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{parcel.size.charAt(0).toUpperCase() + parcel.size.slice(1)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="dollar-sign" size={14} color="#10B981" />
                <Text style={styles.detailLabel}>Reward</Text>
                <Text style={[styles.detailValue, { color: "#10B981" }]}>${parcel.reward}</Text>
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
              <Text style={styles.cardLabel}>Your Carrier</Text>
              <TouchableOpacity onPress={handleViewCarrier} activeOpacity={0.85} style={styles.carrierRow}>
                <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.carrierAvatar}>
                  <Text style={styles.carrierInitials}>{matchedTrip.travelerInitials}</Text>
                </LinearGradient>
                <View style={styles.carrierInfo}>
                  <Text style={styles.carrierName}>{matchedTrip.travelerName}</Text>
                  <View style={styles.carrierMeta}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={styles.carrierRatingText}>{matchedTrip.travelerRating}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.carrierRouteText}>{matchedTrip.fromCity} → {matchedTrip.toCity}</Text>
                  </View>
                </View>
                <View style={styles.carrierActions}>
                  <TouchableOpacity onPress={handleMessageCarrier} style={styles.actionCircle} activeOpacity={0.8}>
                    <LinearGradient colors={["rgba(249,115,22,0.25)", "rgba(249,115,22,0.15)"]} style={styles.actionCircleGrad}>
                      <Feather name="message-circle" size={17} color="#F97316" />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleViewCarrier} style={styles.actionCircle} activeOpacity={0.8}>
                    <LinearGradient colors={["rgba(59,130,246,0.25)", "rgba(59,130,246,0.15)"]} style={styles.actionCircleGrad}>
                      <Feather name="user" size={17} color="#3B82F6" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Tracking timeline */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tracking Timeline</Text>
            <StatusTimeline steps={parcel.trackingSteps} />
          </View>

          {/* Rate carrier CTA for delivered packages */}
          {parcel.status === "delivered" && matchedTrip && !alreadyRated && (
            <View style={styles.rateCard}>
              <LinearGradient colors={["rgba(245,158,11,0.15)", "rgba(245,158,11,0.05)"]} style={styles.rateGrad}>
                <View style={styles.rateLeft}>
                  <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.rateIcon}>
                    <Feather name="star" size={18} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.rateTitle}>Rate Your Delivery</Text>
                    <Text style={styles.rateSub}>How was {matchedTrip.travelerName.split(" ")[0]}?</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({ pathname: "/review/[id]", params: { id: parcel.id } });
                  }}
                  style={styles.rateBtn}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.rateBtnGrad}>
                    <Text style={styles.rateBtnText}>Rate Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {parcel.status === "delivered" && alreadyRated && (
            <View style={styles.ratedBadge}>
              <Feather name="check-circle" size={16} color="#10B981" />
              <Text style={styles.ratedText}>You reviewed this delivery</Text>
            </View>
          )}

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
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  notFound: { alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { color: "#94A3B8", fontSize: 16, fontFamily: "Inter_400Regular" },
  backLink: { color: "#F97316", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  content: {},
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerContent: { alignItems: "center", marginBottom: 20 },
  packageIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  packageTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 10, textAlign: "center" },
  statusRow: { borderRadius: 12, overflow: "hidden", marginBottom: 10 },
  badgeGrad: { paddingVertical: 6, paddingHorizontal: 18 },
  badgeText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  etaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#3B82F6" },
  etaText: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular" },
  progressWrap: { marginTop: 4 },
  body: { padding: 20 },
  card: { backgroundColor: "#1C1208", borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  cardLabel: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  routeRow: { flexDirection: "row", alignItems: "center" },
  routeEndpoint: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeCity: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  routeFull: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  routeArrow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6 },
  routeLine: { width: 14, height: 1, backgroundColor: "rgba(249,115,22,0.3)" },
  arrowCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detailItem: { width: "45%", backgroundColor: "#150C04", borderRadius: 12, padding: 12, gap: 4 },
  detailLabel: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  detailValue: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  description: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  descriptionLabel: { color: "#64748B", fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 },
  descriptionText: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  carrierRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  carrierAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  carrierInitials: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  carrierInfo: { flex: 1 },
  carrierName: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  carrierMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  carrierRatingText: { color: "#F59E0B", fontSize: 12, fontFamily: "Inter_500Medium" },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#64748B" },
  carrierRouteText: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_400Regular" },
  carrierActions: { flexDirection: "row", gap: 8 },
  actionCircle: { borderRadius: 14, overflow: "hidden" },
  actionCircleGrad: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rateCard: { borderRadius: 18, overflow: "hidden", marginBottom: 14 },
  rateGrad: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
  rateLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rateIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rateTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rateSub: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rateBtn: { borderRadius: 12, overflow: "hidden" },
  rateBtnGrad: { paddingVertical: 10, paddingHorizontal: 16 },
  rateBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  ratedBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, paddingVertical: 12, backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(16,185,129,0.15)" },
  ratedText: { color: "#10B981", fontSize: 13, fontFamily: "Inter_500Medium" },
  cancelBtn: { marginTop: 8 },
});
