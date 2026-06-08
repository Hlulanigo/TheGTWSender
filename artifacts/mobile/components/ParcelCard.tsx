import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Parcel } from "@/context/AppContext";

interface ParcelCardProps {
  parcel: Parcel;
  onPress?: () => void;
}

const STATUS: Record<
  string,
  { label: string; colors: [string, string]; icon: string }
> = {
  pending: { label: "Pending", colors: ["#F59E0B", "#D97706"], icon: "clock" },
  matched: {
    label: "Matched",
    colors: ["#7C3AED", "#4F46E5"],
    icon: "check-circle",
  },
  in_transit: {
    label: "In Transit",
    colors: ["#3B82F6", "#06B6D4"],
    icon: "truck",
  },
  delivered: {
    label: "Delivered",
    colors: ["#10B981", "#059669"],
    icon: "check-circle",
  },
};

export default function ParcelCard({ parcel, onPress }: ParcelCardProps) {
  const cfg = STATUS[parcel.status] ?? STATUS.pending;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.container}
    >
      <View style={styles.card}>
        <LinearGradient colors={cfg.colors} style={styles.iconBox}>
          <Feather name="package" size={20} color="#fff" />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {parcel.title}
            </Text>
            <View style={styles.badge}>
              <LinearGradient
                colors={cfg.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeGrad}
              >
                <Text style={styles.badgeText}>{cfg.label}</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.routeRow}>
            <Text style={styles.city}>{parcel.fromCity}</Text>
            <Feather name="arrow-right" size={11} color="#4F46E5" />
            <Text style={styles.city}>{parcel.toCity}</Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.metaItem}>
              <Feather name="package" size={10} color="#64748B" />
              <Text style={styles.metaText}>
                {parcel.weight}kg · {parcel.size}
              </Text>
            </View>
            <Text style={styles.reward}>${parcel.reward} reward</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  card: {
    backgroundColor: "#1E1A3A",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  badge: { borderRadius: 8, overflow: "hidden" },
  badgeGrad: { paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  city: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  reward: {
    color: "#10B981",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
