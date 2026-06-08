import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import ParcelCard from "@/components/ParcelCard";
import GradientButton from "@/components/GradientButton";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { trips, parcels, requestDelivery } = useApp();
  const [booking, setBooking] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!trip) {
    return (
      <View style={[styles.screen, styles.notFound]}>
        <Text style={styles.notFoundText}>Trip not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const spotsLeft = trip.maxParcels - trip.acceptedCount;
  const pendingParcels = parcels.filter((p) => p.status === "pending");

  function handleBookParcel(parcelId: string) {
    setBooking(parcelId);
    setTimeout(() => {
      requestDelivery(parcelId, trip.id);
      setBooking(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Delivery Requested!",
        `${trip.travelerName} has been notified. They'll confirm your package shortly.`,
        [{ text: "Track It", onPress: () => router.push("/(tabs)/track") }]
      );
    }, 1000);
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
        <LinearGradient
          colors={["#1C0D04", "#0F0A04"]}
          style={[styles.header, { paddingTop: topPad + 8 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Traveler info */}
          <View style={styles.travelerSection}>
            <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{trip.travelerInitials}</Text>
            </LinearGradient>
            <Text style={styles.travelerName}>{trip.travelerName}</Text>
            <View style={styles.ratingRow}>
              <Feather name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{trip.travelerRating} rating</Text>
              <View style={styles.dot} />
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeCard}>
            <View style={styles.routeEndpoint}>
              <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
              <View>
                <Text style={styles.routeCity}>{trip.fromCity}</Text>
                <Text style={styles.routeFull}>{trip.from}</Text>
              </View>
            </View>
            <View style={styles.routeMiddle}>
              <View style={styles.routeLine} />
              <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.arrowCircle}>
                <Feather name="chevrons-right" size={14} color="#fff" />
              </LinearGradient>
              <View style={styles.routeLine} />
            </View>
            <View style={styles.routeEndpoint}>
              <View style={[styles.routeDot, { backgroundColor: "#06B6D4" }]} />
              <View>
                <Text style={styles.routeCity}>{trip.toCity}</Text>
                <Text style={styles.routeFull}>{trip.to}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Trip meta */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <LinearGradient colors={["rgba(59,130,246,0.2)", "rgba(59,130,246,0.05)"]} style={styles.metaIcon}>
                <Feather name="calendar" size={16} color="#3B82F6" />
              </LinearGradient>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{trip.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <LinearGradient colors={["rgba(249,115,22,0.2)", "rgba(249,115,22,0.05)"]} style={styles.metaIcon}>
                <Feather name="clock" size={16} color="#F97316" />
              </LinearGradient>
              <Text style={styles.metaLabel}>Departure</Text>
              <Text style={styles.metaValue}>{trip.departureTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <LinearGradient colors={["rgba(16,185,129,0.2)", "rgba(16,185,129,0.05)"]} style={styles.metaIcon}>
                <Feather name="package" size={16} color="#10B981" />
              </LinearGradient>
              <Text style={styles.metaLabel}>Capacity</Text>
              <Text style={styles.metaValue}>{trip.maxWeight}kg</Text>
            </View>
            <View style={styles.metaItem}>
              <LinearGradient colors={["rgba(245,158,11,0.2)", "rgba(245,158,11,0.05)"]} style={styles.metaIcon}>
                <Feather name="dollar-sign" size={16} color="#F59E0B" />
              </LinearGradient>
              <Text style={styles.metaLabel}>Rate</Text>
              <Text style={styles.metaValue}>${trip.pricePerKg}/kg</Text>
            </View>
          </View>

          {/* Spots available */}
          <View style={styles.spotsCard}>
            <LinearGradient
              colors={
                spotsLeft > 0
                  ? ["rgba(16,185,129,0.15)", "rgba(16,185,129,0.05)"]
                  : ["rgba(239,68,68,0.15)", "rgba(239,68,68,0.05)"]
              }
              style={styles.spotsGrad}
            >
              <Feather
                name={spotsLeft > 0 ? "check-circle" : "x-circle"}
                size={18}
                color={spotsLeft > 0 ? "#10B981" : "#EF4444"}
              />
              <Text style={[styles.spotsText, { color: spotsLeft > 0 ? "#10B981" : "#EF4444" }]}>
                {spotsLeft > 0
                  ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available · ${trip.maxSize} max parcel size`
                  : "This trip is fully booked"}
              </Text>
            </LinearGradient>
          </View>

          {/* Pending parcels to book */}
          {pendingParcels.length > 0 && spotsLeft > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send a Package on This Trip</Text>
              <Text style={styles.sectionSub}>
                Select one of your pending packages to send with {trip.travelerName.split(" ")[0]}
              </Text>
              {pendingParcels.map((p) => (
                <View key={p.id} style={styles.parcelWithBtn}>
                  <ParcelCard parcel={p} />
                  <GradientButton
                    title={booking === p.id ? "Requesting..." : "Book This Trip"}
                    loading={booking === p.id}
                    onPress={() => handleBookParcel(p.id)}
                    style={styles.bookBtn}
                    small
                  />
                </View>
              ))}
            </View>
          ) : pendingParcels.length === 0 ? (
            <View style={styles.section}>
              <View style={styles.emptyState}>
                <Feather name="package" size={36} color="#EA580C" />
                <Text style={styles.emptyTitle}>No pending packages</Text>
                <Text style={styles.emptyText}>Post a package request to book this trip</Text>
                <GradientButton
                  title="Send a Package"
                  onPress={() => router.push("/(tabs)/send")}
                  style={{ marginTop: 16 }}
                />
              </View>
            </View>
          ) : null}
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
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  travelerSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold" },
  travelerName: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { color: "#F59E0B", fontSize: 13, fontFamily: "Inter_500Medium" },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#64748B" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { color: "#10B981", fontSize: 12, fontFamily: "Inter_500Medium" },
  routeCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  routeEndpoint: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeCity: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  routeFull: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  routeMiddle: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
  routeLine: { width: 16, height: 1, backgroundColor: "rgba(59,130,246,0.3)" },
  arrowCircle: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  body: { padding: 20 },
  metaGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  metaItem: {
    flex: 1, backgroundColor: "#1C1208",
    borderRadius: 16, padding: 12, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  metaIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  metaLabel: { color: "#64748B", fontSize: 10, fontFamily: "Inter_400Regular" },
  metaValue: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  spotsCard: { borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  spotsGrad: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  spotsText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sectionSub: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 19 },
  parcelWithBtn: { marginBottom: 4 },
  bookBtn: { marginTop: -4, marginBottom: 14 },
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyTitle: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
