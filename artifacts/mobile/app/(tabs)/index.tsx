import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import TripCard from "@/components/TripCard";
import ParcelCard from "@/components/ParcelCard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { trips, parcels, user } = useApp();
  const openTrips = trips.filter((t) => t.status === "open");
  const activeParcels = parcels.filter(
    (p) => p.status === "in_transit" || p.status === "pending"
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header */}
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>Good morning,</Text>
            <Text style={styles.heroName}>{user.name.split(" ")[0]}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Feather name="bell" size={22} color="#FFFFFF" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(124,58,237,0.25)", "rgba(124,58,237,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={styles.statValue}>{openTrips.length}</Text>
              <Text style={styles.statLabel}>Trips Available</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(59,130,246,0.25)", "rgba(59,130,246,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={styles.statValue}>{activeParcels.length}</Text>
              <Text style={styles.statLabel}>Active Deliveries</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(16,185,129,0.25)", "rgba(16,185,129,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={styles.statValue}>${user.earnings}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/send");
            }}
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              style={styles.actionGrad}
            >
              <Feather name="package" size={20} color="#fff" />
              <Text style={styles.actionText}>Send Package</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/travel");
            }}
          >
            <LinearGradient
              colors={["#3B82F6", "#06B6D4"]}
              style={styles.actionGrad}
            >
              <Feather name="navigation" size={20} color="#fff" />
              <Text style={styles.actionText}>I'm Traveling</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Available Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Trips</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {openTrips.slice(0, 4).map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onBook={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }}
          />
        ))}
      </View>

      {/* Active Deliveries */}
      {activeParcels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Active Deliveries</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/track")}>
              <Text style={styles.seeAll}>Track all</Text>
            </TouchableOpacity>
          </View>
          {activeParcels.map((p) => (
            <ParcelCard
              key={p.id}
              parcel={p}
              onPress={() =>
                router.push({
                  pathname: "/parcel/[id]",
                  params: { id: p.id },
                })
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  content: {},
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heroGreeting: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
    borderWidth: 1.5,
    borderColor: "#0D0B1E",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: { flex: 1, borderRadius: 14, overflow: "hidden" },
  statGrad: {
    padding: 12,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 2,
  },
  quickActions: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, borderRadius: 16, overflow: "hidden" },
  actionGrad: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    color: "#7C3AED",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
