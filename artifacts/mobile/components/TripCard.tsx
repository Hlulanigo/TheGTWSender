import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Trip } from "@/context/AppContext";

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
  onBook?: () => void;
}

export default function TripCard({ trip, onPress, onBook }: TripCardProps) {
  const spotsLeft = trip.maxParcels - trip.acceptedCount;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.container}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={["#7C3AED", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />

        <View style={styles.header}>
          <LinearGradient
            colors={["#7C3AED", "#4F46E5"]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{trip.travelerInitials}</Text>
          </LinearGradient>
          <View style={styles.headerInfo}>
            <Text style={styles.travelerName}>{trip.travelerName}</Text>
            <View style={styles.ratingRow}>
              <Feather name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>{trip.travelerRating}</Text>
            </View>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.priceValue}>${trip.pricePerKg}</Text>
            <Text style={styles.priceUnit}>/kg</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routeEndpoint}>
            <View style={[styles.dot, { backgroundColor: "#7C3AED" }]} />
            <Text style={styles.cityLabel}>{trip.fromCity}</Text>
          </View>
          <View style={styles.routeMiddle}>
            <View style={styles.routeDash} />
            <Feather name="chevrons-right" size={14} color="#4F46E5" />
            <View style={styles.routeDash} />
          </View>
          <View style={styles.routeEndpoint}>
            <Text style={styles.cityLabel}>{trip.toCity}</Text>
            <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Feather name="calendar" size={11} color="#64748B" />
              <Text style={styles.metaText}>{trip.date}</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="clock" size={11} color="#64748B" />
              <Text style={styles.metaText}>{trip.departureTime}</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="package" size={11} color="#64748B" />
              <Text style={styles.metaText}>{trip.maxWeight}kg max</Text>
            </View>
          </View>
          {onBook && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBook();
              }}
              style={styles.bookBtn}
            >
              <LinearGradient
                colors={["#7C3AED", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookGradient}
              >
                <Text style={styles.bookText}>
                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: {
    backgroundColor: "#1E1A3A",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  accentLine: { height: 3 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  headerInfo: { flex: 1 },
  travelerName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  priceUnit: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  routeEndpoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cityLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  routeMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  routeDash: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(124,58,237,0.3)",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  bookBtn: {
    borderRadius: 10,
    overflow: "hidden",
  },
  bookGradient: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  bookText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
