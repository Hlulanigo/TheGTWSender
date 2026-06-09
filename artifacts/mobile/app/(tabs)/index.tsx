import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import TripCard from "@/components/TripCard";
import ParcelCard from "@/components/ParcelCard";

const QUICK_ROUTES = [
  { from: "New York", to: "Los Angeles" },
  { from: "Chicago", to: "Houston" },
  { from: "Seattle", to: "San Francisco" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { trips, parcels, unreadNotifications, conversations } = useApp();
  const { user: authUser } = useAuth();
  const [search, setSearch] = useState("");
  const firstName = (authUser?.name ?? "there").split(" ")[0];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const openTrips = trips
    .filter((t) => t.status === "open" && !t.isOwn)
    .filter(
      (t) =>
        !search ||
        t.fromCity.toLowerCase().includes(search.toLowerCase()) ||
        t.toCity.toLowerCase().includes(search.toLowerCase())
    );

  const activeParcels = parcels.filter(
    (p) => p.status === "in_transit" || p.status === "matched"
  );
  const pendingParcels = parcels.filter((p) => p.status === "pending");
  const totalUnreadMessages = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.hero, { paddingTop: topPad + 10 }]}
      >
        {/* Brand logo row */}
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
            tintColor="#F97316"
          />
        </View>

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>{getGreeting()}</Text>
            <Text style={styles.heroName}>{firstName}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/messages");
              }}
            >
              <Feather name="message-circle" size={21} color="#FFFFFF" />
              {totalUnreadMessages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalUnreadMessages}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/notifications");
              }}
            >
              <Feather name="bell" size={21} color="#FFFFFF" />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/(tabs)/track")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(249,115,22,0.3)", "rgba(249,115,22,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={styles.statValue}>{activeParcels.length}</Text>
              <Text style={styles.statLabel}>In Transit</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/(tabs)/track")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(245,158,11,0.3)", "rgba(245,158,11,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={styles.statValue}>{pendingParcels.length}</Text>
              <Text style={styles.statLabel}>Awaiting Carrier</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/(tabs)/track")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(16,185,129,0.3)", "rgba(16,185,129,0.1)"]}
              style={styles.statGrad}
            >
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                {parcels.filter((p) => p.status === "delivered").length}
              </Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.sendCta}
          activeOpacity={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(tabs)/send");
          }}
        >
          <LinearGradient
            colors={["#F97316", "#EA580C", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendCtaGrad}
          >
            <View style={styles.sendCtaLeft}>
              <View style={styles.sendCtaIconCircle}>
                <Feather name="package" size={22} color="#F97316" />
              </View>
              <View>
                <Text style={styles.sendCtaTitle}>Send a Package</Text>
                <Text style={styles.sendCtaSub}>
                  {openTrips.length} carriers available now
                </Text>
              </View>
            </View>
            <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search + quick routes */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search carriers by city…"
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {!search && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRoutes}
          >
            {QUICK_ROUTES.map((r) => (
              <TouchableOpacity
                key={r.from + r.to}
                style={styles.quickChip}
                onPress={() => setSearch(r.from)}
                activeOpacity={0.8}
              >
                <Feather name="map-pin" size={11} color="#F97316" />
                <Text style={styles.quickChipText}>
                  {r.from} → {r.to}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Active deliveries */}
      {activeParcels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.liveIndicator} />
              <Text style={styles.sectionTitle}>In Transit</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/track")}>
              <Text style={styles.seeAll}>Track all</Text>
            </TouchableOpacity>
          </View>
          {activeParcels.map((p) => (
            <ParcelCard
              key={p.id}
              parcel={p}
              onPress={() =>
                router.push({ pathname: "/parcel/[id]", params: { id: p.id } })
              }
            />
          ))}
        </View>
      )}

      {/* Pending packages */}
      {pendingParcels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Awaiting Carrier</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/track")}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {pendingParcels.map((p) => (
            <ParcelCard
              key={p.id}
              parcel={p}
              onPress={() =>
                router.push({ pathname: "/parcel/[id]", params: { id: p.id } })
              }
            />
          ))}
        </View>
      )}

      {/* Earn by traveling CTA */}
      {!search && (
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/travel");
            }}
          >
            <LinearGradient
              colors={["#1C2D40", "#0F1A2A"]}
              style={styles.earnCard}
            >
              <LinearGradient
                colors={["#3B82F6", "#06B6D4"]}
                style={styles.earnIconCircle}
              >
                <Feather name="navigation" size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.earnCardText}>
                <Text style={styles.earnCardTitle}>Traveling somewhere?</Text>
                <Text style={styles.earnCardSub}>Carry packages along your route and earn</Text>
              </View>
              <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.earnArrow}>
                <Feather name="arrow-right" size={14} color="#fff" />
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Carriers feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search ? `Carriers matching "${search}"` : "Available Carriers"}
          </Text>
          {!search && openTrips.length > 3 && (
            <TouchableOpacity onPress={() => setSearch(" ")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {openTrips.length === 0 ? (
          <View style={styles.emptyCarriers}>
            <Feather name="compass" size={28} color="#EA580C" />
            <Text style={styles.emptyCarriersText}>
              {search ? `No carriers found for "${search.trim()}"` : "No carriers available right now"}
            </Text>
          </View>
        ) : (
          openTrips.slice(0, search ? openTrips.length : 5).map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/trip/[id]", params: { id: trip.id } });
              }}
              onBook={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/trip/[id]", params: { id: trip.id } });
              }}
              onViewCarrier={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/carrier/[id]", params: { id: trip.id } });
              }}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  content: {},
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  brandRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  brandLogo: {
    width: 120,
    height: 44,
  },
  heroTop: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 20,
  },
  heroGreeting: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular" },
  heroName: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 2 },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: 5, right: 5,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#F97316", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#0F0A04", paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, overflow: "hidden" },
  statGrad: {
    padding: 12, alignItems: "center", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: {
    color: "#94A3B8", fontSize: 9, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: 3,
  },
  sendCta: { borderRadius: 20, overflow: "hidden" },
  sendCtaGrad: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18, paddingHorizontal: 20,
  },
  sendCtaLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  sendCtaIconCircle: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  sendCtaTitle: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  sendCtaSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  searchSection: { paddingHorizontal: 20, paddingTop: 18 },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1C1208", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_400Regular" },
  quickRoutes: { gap: 8, paddingTop: 12, paddingBottom: 2 },
  quickChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "rgba(249,115,22,0.2)",
  },
  quickChipText: { color: "#FED7AA", fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  liveIndicator: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981",
  },
  seeAll: { color: "#F97316", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyCarriers: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyCarriersText: {
    color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  earnCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
  },
  earnIconCircle: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  earnCardText: { flex: 1 },
  earnCardTitle: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  earnCardSub: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  earnArrow: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
});
