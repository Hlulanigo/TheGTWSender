import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, ParcelSize } from "@/context/AppContext";
import GradientButton from "@/components/GradientButton";
import TripCard from "@/components/TripCard";

type TabKey = "my_trips" | "carry_parcels";

const SIZES: { key: ParcelSize; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

export default function TravelScreen() {
  const insets = useSafeAreaInsets();
  const { trips, parcels, user, addTrip, acceptParcel, getMatchesForTrip } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>("my_trips");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [maxSize, setMaxSize] = useState<ParcelSize>("medium");
  const [pricePerKg, setPricePerKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const myTrips = trips.filter((t) => t.isOwn);
  const pendingParcels = parcels.filter((p) => {
    const isPending = p.status === "pending";
    const matchesSearch = !searchQuery ||
      p.fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.toCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return isPending && matchesSearch;
  });

  function handlePost() {
    if (!from || !to || !date || !time || !maxWeight || !pricePerKg) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addTrip({
        from, fromCity: from.split(",")[0].trim(),
        to, toCity: to.split(",")[0].trim(),
        date, departureTime: time,
        maxWeight: parseFloat(maxWeight) || 5,
        maxSize, pricePerKg: parseFloat(pricePerKg) || 10,
        maxParcels: 4,
      });
      setLoading(false);
      setShowForm(false);
      setFrom(""); setTo(""); setDate(""); setTime(""); setMaxWeight(""); setPricePerKg("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  }

  function handleAcceptParcel(parcelId: string) {
    if (myTrips.length === 0) {
      Alert.alert("No trips posted", "Post a trip first, then accept parcels to carry.", [
        { text: "Post a Trip", onPress: () => { setActiveTab("my_trips"); setShowForm(true); } },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    setAccepting(parcelId);
    const tripId = myTrips[0].id;
    setTimeout(() => {
      acceptParcel(parcelId, tripId);
      setAccepting(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Parcel Accepted!", "You've agreed to carry this package. The sender has been notified.", [
        { text: "Track It", onPress: () => router.push("/(tabs)/track") },
      ]);
    }, 800);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <LinearGradient
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Earn by Traveling</Text>

        {/* Earnings banner */}
        <View style={styles.earningsBanner}>
          <LinearGradient
            colors={["rgba(59,130,246,0.2)", "rgba(6,182,212,0.15)"]}
            style={styles.earningsGrad}
          >
            <View style={styles.earnStat}>
              <Text style={styles.earnLabel}>Earned</Text>
              <Text style={styles.earnValue}>${user.earnings}</Text>
            </View>
            <View style={styles.earnDivider} />
            <View style={styles.earnStat}>
              <Text style={styles.earnLabel}>Trips</Text>
              <Text style={styles.earnValue}>{user.tripsPosted + myTrips.length}</Text>
            </View>
            <View style={styles.earnDivider} />
            <View style={styles.earnStat}>
              <Text style={styles.earnLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={styles.earnValue}>{user.rating}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {(["my_trips", "carry_parcels"] as TabKey[]).map((tab) => {
            const active = activeTab === tab;
            const label = tab === "my_trips" ? "My Trips" : "Carry Parcels";
            const count = tab === "my_trips" ? myTrips.length : pendingParcels.length;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabBtn}
                onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
                activeOpacity={0.8}
              >
                {active ? (
                  <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.tabGrad}>
                    <Text style={styles.tabTextActive}>{label}</Text>
                    {count > 0 && (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{count}</Text>
                      </View>
                    )}
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInactive}>
                    <Text style={styles.tabText}>{label}</Text>
                    {count > 0 && (
                      <View style={styles.tabBadgeInactive}>
                        <Text style={styles.tabBadgeTextInactive}>{count}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "my_trips" ? (
          <>
            {/* Post new trip toggle */}
            {!showForm ? (
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowForm(true); }}
                activeOpacity={0.85}
                style={styles.postTripBtn}
              >
                <LinearGradient colors={["#3B82F6", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postTripGrad}>
                  <Feather name="plus-circle" size={20} color="#fff" />
                  <Text style={styles.postTripText}>Post a New Trip</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Trip Details</Text>
                  <TouchableOpacity onPress={() => setShowForm(false)}>
                    <Feather name="x" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.routeCard}>
                  <View style={styles.routeField}>
                    <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
                    <TextInput style={styles.routeInput} placeholder="Departing from" placeholderTextColor="#64748B" value={from} onChangeText={setFrom} />
                  </View>
                  <View style={styles.routeDivider} />
                  <View style={styles.routeField}>
                    <View style={[styles.routeDot, { backgroundColor: "#06B6D4" }]} />
                    <TextInput style={styles.routeInput} placeholder="Arriving at" placeholderTextColor="#64748B" value={to} onChangeText={setTo} />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <Feather name="calendar" size={14} color="#64748B" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Date" placeholderTextColor="#64748B" value={date} onChangeText={setDate} />
                  </View>
                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <Feather name="clock" size={14} color="#64748B" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Time" placeholderTextColor="#64748B" value={time} onChangeText={setTime} />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Max Weight (kg)</Text>
                    <View style={styles.inputWrap}>
                      <TextInput style={styles.input} placeholder="e.g. 5" placeholderTextColor="#64748B" keyboardType="decimal-pad" value={maxWeight} onChangeText={setMaxWeight} />
                    </View>
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Price/kg ($)</Text>
                    <View style={styles.inputWrap}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput style={styles.input} placeholder="e.g. 12" placeholderTextColor="#64748B" keyboardType="decimal-pad" value={pricePerKg} onChangeText={setPricePerKg} />
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>Max Parcel Size</Text>
                <View style={styles.sizeRow}>
                  {SIZES.map((s) => {
                    const active = maxSize === s.key;
                    return (
                      <TouchableOpacity key={s.key} onPress={() => { Haptics.selectionAsync(); setMaxSize(s.key); }} activeOpacity={0.8} style={styles.sizeChip}>
                        {active ? (
                          <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.sizeChipGrad}>
                            <Text style={styles.sizeChipTextActive}>{s.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.sizeChipInner}>
                            <Text style={styles.sizeChipText}>{s.label}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <GradientButton title="Post Trip" onPress={handlePost} loading={loading} gradientColors={["#3B82F6", "#06B6D4"]} style={{ marginTop: 8 }} />
              </View>
            )}

            {myTrips.length > 0 ? (
              <View style={styles.tripsSection}>
                <Text style={styles.sectionTitle}>My Posted Trips</Text>
                {myTrips.map((t) => {
                  const matches = getMatchesForTrip(t);
                  return (
                    <View key={t.id} style={styles.tripMatchContainer}>
                      <TripCard trip={t} />
                      {matches.length > 0 && (
                        <View style={styles.matchesPreview}>
                          <LinearGradient colors={["rgba(16,185,129,0.15)", "rgba(16,185,129,0.05)"]} style={styles.matchesGrad}>
                            <View style={styles.matchesHeader}>
                              <Feather name="zap" size={14} color="#10B981" />
                              <Text style={styles.matchesTitle}>{matches.length} Smart Match{matches.length !== 1 ? "es" : ""}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchesScroll}>
                              {matches.map((p) => (
                                <TouchableOpacity
                                  key={p.id}
                                  style={styles.matchChip}
                                  onPress={() => handleAcceptParcel(p.id)}
                                  activeOpacity={0.8}
                                >
                                  <Text style={styles.matchChipText}>{p.title}</Text>
                                  <Text style={styles.matchChipReward}>${p.reward}</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </LinearGradient>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : !showForm ? (
              <View style={styles.emptyState}>
                <Feather name="navigation" size={40} color="#EA580C" />
                <Text style={styles.emptyTitle}>No trips posted yet</Text>
                <Text style={styles.emptyText}>Post your travel route and start earning</Text>
              </View>
            ) : null}
          </>
        ) : (
          /* Carry Parcels tab */
          <>
            <View style={styles.carryHeader}>
              <Text style={styles.carryTitle}>Parcels Waiting for a Carrier</Text>
              <Text style={styles.carrySub}>
                Accept a parcel to carry on your trip and earn the reward
              </Text>
            </View>

            <View style={styles.searchBar}>
              <Feather name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by city or package name..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather name="x-circle" size={16} color="#64748B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {pendingParcels.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={40} color="#EA580C" />
                <Text style={styles.emptyTitle}>No parcels available</Text>
                <Text style={styles.emptyText}>New delivery requests will appear here</Text>
              </View>
            ) : (
              pendingParcels.map((p) => (
                <View key={p.id} style={styles.parcelWithAction}>
                  <View style={styles.parcelRow}>
                    <View style={styles.parcelInfoBlock}>
                      <View style={styles.parcelTopRow}>
                        <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.parcelIcon}>
                          <Feather name="package" size={16} color="#fff" />
                        </LinearGradient>
                        <View style={styles.parcelTexts}>
                          <Text style={styles.parcelTitle}>{p.title}</Text>
                          <View style={styles.parcelRoute}>
                            <Text style={styles.parcelCity}>{p.fromCity}</Text>
                            <Feather name="arrow-right" size={11} color="#EA580C" />
                            <Text style={styles.parcelCity}>{p.toCity}</Text>
                          </View>
                        </View>
                        <View style={styles.rewardBadge}>
                          <LinearGradient colors={["rgba(16,185,129,0.2)", "rgba(16,185,129,0.1)"]} style={styles.rewardGrad}>
                            <Text style={styles.rewardText}>${p.reward}</Text>
                          </LinearGradient>
                        </View>
                      </View>
                      <View style={styles.parcelMeta}>
                        <View style={styles.parcelMetaItem}>
                          <Feather name="layers" size={11} color="#64748B" />
                          <Text style={styles.parcelMetaText}>{p.weight}kg</Text>
                        </View>
                        <View style={styles.parcelMetaItem}>
                          <Feather name="box" size={11} color="#64748B" />
                          <Text style={styles.parcelMetaText}>{p.size}</Text>
                        </View>
                        <View style={styles.parcelMetaItem}>
                          <Feather name="clock" size={11} color="#64748B" />
                          <Text style={styles.parcelMetaText}>{p.createdAt}</Text>
                        </View>
                        {p.description ? (
                          <View style={styles.parcelMetaItem}>
                            <Feather name="info" size={11} color="#64748B" />
                            <Text style={styles.parcelMetaText} numberOfLines={1}>{p.description}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                  <GradientButton
                    title={accepting === p.id ? "Accepting..." : "Accept to Carry"}
                    loading={accepting === p.id}
                    onPress={() => handleAcceptParcel(p.id)}
                    gradientColors={["#10B981", "#059669"]}
                    small
                    style={styles.acceptBtn}
                  />
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 16 },
  earningsBanner: { borderRadius: 18, overflow: "hidden", marginBottom: 16 },
  earningsGrad: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-around", padding: 16, borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
  },
  earnStat: { alignItems: "center" },
  earnLabel: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_400Regular" },
  earnValue: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  earnDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)" },
  tabRow: { flexDirection: "row", gap: 10, paddingBottom: 16 },
  tabBtn: { borderRadius: 14, overflow: "hidden" },
  tabGrad: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, gap: 6 },
  tabInactive: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 16, gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14,
  },
  tabText: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBadge: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tabBadgeInactive: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeTextInactive: { color: "#64748B", fontSize: 11, fontFamily: "Inter_500Medium" },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  postTripBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  postTripGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  postTripText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  formCard: {
    backgroundColor: "#1C1208", borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 20,
  },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  formTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  routeCard: { backgroundColor: "#150C04", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 14 },
  routeField: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeInput: { flex: 1, color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_400Regular" },
  routeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 12 },
  twoCol: { flexDirection: "row", gap: 10, marginBottom: 14 },
  fieldHalf: { flex: 1 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#150C04", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12, marginBottom: 14,
  },
  inputIcon: { marginRight: 6 },
  dollarSign: { color: "#94A3B8", fontSize: 15, fontFamily: "Inter_600SemiBold", marginRight: 4 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 12 },
  label: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.7 },
  sizeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sizeChip: { flex: 1, borderRadius: 12, overflow: "hidden" },
  sizeChipGrad: { paddingVertical: 10, alignItems: "center" },
  sizeChipInner: { paddingVertical: 10, alignItems: "center", backgroundColor: "#150C04", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  sizeChipText: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium" },
  sizeChipTextActive: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tripsSection: {},
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  carryHeader: { marginBottom: 16 },
  carryTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  carrySub: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1208",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  parcelWithAction: {
    backgroundColor: "#1C1208", borderRadius: 18, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  tripMatchContainer: { marginBottom: 16 },
  matchesPreview: { marginTop: -10, marginHorizontal: 10, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: "hidden", borderWidth: 1, borderTopWidth: 0, borderColor: "rgba(16,185,129,0.2)" },
  matchesGrad: { padding: 12, paddingTop: 18 },
  matchesHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  matchesTitle: { color: "#10B981", fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  matchesScroll: { flexDirection: "row" },
  matchChip: { backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", flexDirection: "row", alignItems: "center", gap: 8 },
  matchChipText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_500Medium" },
  matchChipReward: { color: "#10B981", fontSize: 13, fontFamily: "Inter_700Bold" },
  parcelRow: { marginBottom: 12 },
  parcelInfoBlock: {},
  parcelTopRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  parcelIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  parcelTexts: { flex: 1 },
  parcelTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  parcelRoute: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  parcelCity: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular" },
  rewardBadge: { borderRadius: 10, overflow: "hidden" },
  rewardGrad: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  rewardText: { color: "#10B981", fontSize: 14, fontFamily: "Inter_700Bold" },
  parcelMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  parcelMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  parcelMetaText: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  acceptBtn: {},
});
