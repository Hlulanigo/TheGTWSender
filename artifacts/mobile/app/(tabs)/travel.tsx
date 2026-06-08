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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, ParcelSize } from "@/context/AppContext";
import GradientButton from "@/components/GradientButton";
import TripCard from "@/components/TripCard";

const SIZES: { key: ParcelSize; label: string }[] = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

export default function TravelScreen() {
  const insets = useSafeAreaInsets();
  const { trips, user, addTrip } = useApp();
  const myTrips = trips.filter((t) => t.isOwn);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [maxSize, setMaxSize] = useState<ParcelSize>("medium");
  const [pricePerKg, setPricePerKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handlePost() {
    if (!from || !to || !date || !time || !maxWeight || !pricePerKg) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addTrip({
        from,
        fromCity: from.split(",")[0].trim(),
        to,
        toCity: to.split(",")[0].trim(),
        date,
        departureTime: time,
        maxWeight: parseFloat(maxWeight) || 5,
        maxSize,
        pricePerKg: parseFloat(pricePerKg) || 10,
        maxParcels: 4,
      });
      setLoading(false);
      setShowForm(false);
      setFrom("");
      setTo("");
      setDate("");
      setTime("");
      setMaxWeight("");
      setPricePerKg("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <LinearGradient
        colors={["#0D1A3D", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Earn by Traveling</Text>
        <Text style={styles.headerSub}>
          Carry parcels on your next trip and get paid
        </Text>

        {/* Earnings banner */}
        <View style={styles.earningsBanner}>
          <LinearGradient
            colors={["rgba(59,130,246,0.2)", "rgba(6,182,212,0.15)"]}
            style={styles.earningsGrad}
          >
            <View>
              <Text style={styles.earningsLabel}>Total Earned</Text>
              <Text style={styles.earningsValue}>${user.earnings}</Text>
            </View>
            <View style={styles.earnDivider} />
            <View>
              <Text style={styles.earningsLabel}>Trips Posted</Text>
              <Text style={styles.earningsValue}>{user.tripsPosted + myTrips.length}</Text>
            </View>
            <View style={styles.earnDivider} />
            <View>
              <Text style={styles.earningsLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={styles.earningsValue}>{user.rating}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Post new trip toggle */}
        {!showForm ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowForm(true);
            }}
            activeOpacity={0.85}
            style={styles.postTripBtn}
          >
            <LinearGradient
              colors={["#3B82F6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.postTripGrad}
            >
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

            {/* Route */}
            <View style={styles.routeCard}>
              <View style={styles.routeField}>
                <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
                <TextInput
                  style={styles.routeInput}
                  placeholder="Departing from"
                  placeholderTextColor="#64748B"
                  value={from}
                  onChangeText={setFrom}
                />
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeField}>
                <View style={[styles.routeDot, { backgroundColor: "#06B6D4" }]} />
                <TextInput
                  style={styles.routeInput}
                  placeholder="Arriving at"
                  placeholderTextColor="#64748B"
                  value={to}
                  onChangeText={setTo}
                />
              </View>
            </View>

            {/* Date + Time */}
            <View style={styles.twoCol}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Feather name="calendar" size={14} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Date (e.g. Dec 15)"
                  placeholderTextColor="#64748B"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Feather name="clock" size={14} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Time (e.g. 9:00 AM)"
                  placeholderTextColor="#64748B"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            {/* Max weight + price */}
            <View style={styles.twoCol}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Max Weight (kg)</Text>
                <View style={styles.inputWrap}>
                  <Feather name="layers" size={14} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    placeholderTextColor="#64748B"
                    keyboardType="decimal-pad"
                    value={maxWeight}
                    onChangeText={setMaxWeight}
                  />
                </View>
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Price/kg ($)</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 12"
                    placeholderTextColor="#64748B"
                    keyboardType="decimal-pad"
                    value={pricePerKg}
                    onChangeText={setPricePerKg}
                  />
                </View>
              </View>
            </View>

            {/* Max parcel size */}
            <Text style={styles.label}>Max Parcel Size</Text>
            <View style={styles.sizeRow}>
              {SIZES.map((s) => {
                const active = maxSize === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setMaxSize(s.key);
                    }}
                    activeOpacity={0.8}
                    style={styles.sizeChip}
                  >
                    {active ? (
                      <LinearGradient
                        colors={["#3B82F6", "#06B6D4"]}
                        style={styles.sizeChipGrad}
                      >
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

            <GradientButton
              title="Post Trip"
              onPress={handlePost}
              loading={loading}
              gradientColors={["#3B82F6", "#06B6D4"]}
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* My trips */}
        {myTrips.length > 0 && (
          <View style={styles.myTrips}>
            <Text style={styles.sectionTitle}>My Posted Trips</Text>
            {myTrips.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </View>
        )}

        {myTrips.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Feather name="navigation" size={40} color="#4F46E5" />
            <Text style={styles.emptyTitle}>No trips posted yet</Text>
            <Text style={styles.emptyText}>
              Post your travel route and start earning by carrying parcels
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  content: {},
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  headerSub: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  earningsBanner: { borderRadius: 18, overflow: "hidden" },
  earningsGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
  },
  earningsLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  earningsValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 2,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  earnDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  body: { padding: 20 },
  postTripBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  postTripGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  postTripText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  formCard: {
    backgroundColor: "#1E1A3A",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  routeCard: {
    backgroundColor: "#14122A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  routeField: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  routeDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 12,
  },
  twoCol: { flexDirection: "row", gap: 10, marginBottom: 14 },
  fieldHalf: { flex: 1 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14122A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 6 },
  dollarSign: {
    color: "#94A3B8",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 12,
  },
  label: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  sizeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sizeChip: { flex: 1, borderRadius: 12, overflow: "hidden" },
  sizeChipGrad: { paddingVertical: 10, alignItems: "center" },
  sizeChipInner: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#14122A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sizeChipText: {
    color: "#94A3B8",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sizeChipTextActive: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  myTrips: { marginTop: 4 },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
