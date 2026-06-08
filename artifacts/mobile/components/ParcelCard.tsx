import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Parcel } from "@/context/AppContext";

interface ParcelCardProps {
  parcel: Parcel;
  onPress?: () => void;
}

const STATUS: Record<string, { label: string; colors: [string, string]; icon: string; progress: number }> = {
  pending:    { label: "Pending",    colors: ["#F59E0B", "#D97706"], icon: "clock",        progress: 0.20 },
  matched:    { label: "Matched",    colors: ["#F97316", "#EA580C"], icon: "check-circle", progress: 0.45 },
  in_transit: { label: "In Transit", colors: ["#3B82F6", "#06B6D4"], icon: "navigation",   progress: 0.72 },
  delivered:  { label: "Delivered",  colors: ["#10B981", "#059669"], icon: "check-circle", progress: 1.0  },
};

export default function ParcelCard({ parcel, onPress }: ParcelCardProps) {
  const cfg = STATUS[parcel.status] ?? STATUS.pending;
  const isLive = parcel.status === "in_transit";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Color accent top bar */}
        <LinearGradient
          colors={cfg.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />

        <View style={styles.inner}>
          <LinearGradient colors={cfg.colors} style={styles.iconBox}>
            <Feather name="package" size={20} color="#fff" />
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>{parcel.title}</Text>
              <View style={styles.badge}>
                <LinearGradient colors={cfg.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.badgeGrad}>
                  {isLive && <View style={styles.liveDot} />}
                  <Text style={styles.badgeText}>{cfg.label}</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <Text style={styles.city}>{parcel.fromCity}</Text>
              <View style={styles.routeLine} />
              <Feather name="chevrons-right" size={11} color="#EA580C" />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.city}>{parcel.toCity}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={cfg.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${cfg.progress * 100}%` as any }]}
              />
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.metaItem}>
                <Feather name="package" size={10} color="#64748B" />
                <Text style={styles.metaText}>{parcel.weight}kg · {parcel.size}</Text>
              </View>
              <Text style={styles.reward}>${parcel.reward} reward</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  card: { backgroundColor: "#1C1208", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  accentBar: { height: 3 },
  inner: { flexDirection: "row", alignItems: "center", padding: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  content: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  title: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  badge: { borderRadius: 8, overflow: "hidden" },
  badgeGrad: { flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 8, gap: 5 },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(255,255,255,0.8)" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 7 },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F97316" },
  routeLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  city: { color: "#94A3B8", fontSize: 11, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 7 },
  progressFill: { height: 3, borderRadius: 1.5 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  reward: { color: "#10B981", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
