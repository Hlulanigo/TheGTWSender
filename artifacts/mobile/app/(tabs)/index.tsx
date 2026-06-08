import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
  const { trips, parcels, user, unreadNotifications } = useApp();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const openTrips = trips
    .filter((t) => t.status === "open")
    .filter((t) =>
      !search ||
      t.fromCity.toLowerCase().includes(search.toLowerCase()) ||
      t.toCity.toLowerCase().includes(search.toLowerCase())
    );

  const activeParcels = parcels.filter(
    (p) => p.status === "in_transit" || p.status === "pending"
  );

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
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/messages/index");
              }}
            >
              <Feather name="message-circle" size={21} color="#FFFFFF" />
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
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
            <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.actionGrad}>
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
            <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.actionGrad}>
              <Feather name="navigation" size={20} color="#fff" />
              <Text style={styles.actionText}>I'm Traveling</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city (e.g. New York)"
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
      </View>

      {/* Available Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search ? `Trips matching "${search}"` : "Available Trips"}
          </Text>
          {!search && (
            <TouchableOpacity onPress={() => setSearch(" ")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {openTrips.length === 0 ? (
          <View style={styles.emptySearch}>
            <Feather name="map-pin" size={28} color="#4F46E5" />
            <Text style={styles.emptySearchText}>
              No trips found for "{search}"
            </Text>
          </View>
        ) : (
          openTrips.map((trip) => (
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
            />
          ))
        )}
      </View>

      {/* Active Deliveries */}
      {activeParcels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  content: {},
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
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
  notifBadge: {
    position: "absolute", top: 6, right: 6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#7C3AED",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#0D0B1E",
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, overflow: "hidden" },
  statGrad: {
    padding: 12, alignItems: "center", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: {
    color: "#94A3B8", fontSize: 10, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: 2,
  },
  quickActions: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, borderRadius: 16, overflow: "hidden" },
  actionGrad: { paddingVertical: 16, alignItems: "center", gap: 8 },
  actionText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  searchSection: { paddingHorizontal: 20, paddingTop: 18 },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1E1A3A", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1, color: "#FFFFFF",
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  seeAll: { color: "#7C3AED", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptySearch: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptySearchText: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular" },
});
