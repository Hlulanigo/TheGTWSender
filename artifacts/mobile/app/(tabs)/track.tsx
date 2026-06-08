import React, { useState } from "react";
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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp, ParcelStatus } from "@/context/AppContext";

const TABS: { key: ParcelStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "matched", label: "Matched" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_CONFIG: Record<string, { label: string; colors: [string, string]; icon: string }> = {
  pending: { label: "Pending", colors: ["#F59E0B", "#D97706"], icon: "clock" },
  matched: { label: "Matched", colors: ["#F97316", "#EA580C"], icon: "check-circle" },
  in_transit: { label: "In Transit", colors: ["#3B82F6", "#06B6D4"], icon: "navigation" },
  delivered: { label: "Delivered", colors: ["#10B981", "#059669"], icon: "check-circle" },
};

function ProgressBar({ status }: { status: ParcelStatus }) {
  const steps: ParcelStatus[] = ["pending", "matched", "in_transit", "delivered"];
  const idx = steps.indexOf(status);
  const pct = ((idx + 1) / steps.length) * 100;
  return (
    <View style={pb.track}>
      <LinearGradient
        colors={["#F97316", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[pb.fill, { width: `${pct}%` as any }]}
      />
    </View>
  );
}

const pb = StyleSheet.create({
  track: {
    height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden", marginBottom: 10,
  },
  fill: { height: 4, borderRadius: 2 },
});

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { parcels, trips } = useApp();
  const [activeTab, setActiveTab] = useState<ParcelStatus | "all">("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered =
    activeTab === "all" ? parcels : parcels.filter((p) => p.status === activeTab);

  const inTransitCount = parcels.filter((p) => p.status === "in_transit").length;
  const pendingCount = parcels.filter((p) => p.status === "pending").length;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>My Packages</Text>

        {/* Live banner */}
        {inTransitCount > 0 && (
          <View style={styles.liveBanner}>
            <LinearGradient
              colors={["rgba(59,130,246,0.2)", "rgba(6,182,212,0.1)"]}
              style={styles.liveGrad}
            >
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>
                {inTransitCount} package{inTransitCount !== 1 ? "s" : ""} currently in transit
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const count =
              tab.key === "all"
                ? parcels.length
                : parcels.filter((p) => p.status === tab.key).length;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.key); }}
                style={styles.tabBtn}
                activeOpacity={0.8}
              >
                {active ? (
                  <LinearGradient
                    colors={["#F97316", "#EA580C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGrad}
                  >
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabCount}>{count}</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInactive}>
                    <Text style={styles.tabText}>{tab.label}</Text>
                    {count > 0 && (
                      <View style={styles.tabBadgeInactive}>
                        <Text style={styles.tabCountInactive}>{count}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color="#EA580C" />
            <Text style={styles.emptyTitle}>No packages here</Text>
            <Text style={styles.emptyText}>
              Packages in this category will appear here
            </Text>
            {activeTab === "pending" || activeTab === "all" ? (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => router.push("/(tabs)/send")}
              >
                <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.sendBtnGrad}>
                  <Text style={styles.sendBtnText}>Send a Package</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
            const carrier = p.matchedTripId
              ? trips.find((t) => t.id === p.matchedTripId)
              : null;
            const completedSteps = p.trackingSteps.filter((s) => s.completed).length;
            const progressPct = Math.round((completedSteps / p.trackingSteps.length) * 100);

            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push({ pathname: "/parcel/[id]", params: { id: p.id } });
                }}
                activeOpacity={0.88}
                style={styles.parcelCard}
              >
                {/* Accent line */}
                <LinearGradient colors={cfg.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentLine} />

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <LinearGradient colors={cfg.colors} style={styles.parcelIcon}>
                      <Feather name={cfg.icon as any} size={18} color="#fff" />
                    </LinearGradient>
                    <View style={styles.cardInfo}>
                      <Text style={styles.parcelTitle}>{p.title}</Text>
                      <View style={styles.routeRow}>
                        <Text style={styles.routeCity}>{p.fromCity}</Text>
                        <Feather name="arrow-right" size={11} color="#EA580C" />
                        <Text style={styles.routeCity}>{p.toCity}</Text>
                      </View>
                    </View>
                    <View style={styles.statusBadge}>
                      <LinearGradient colors={cfg.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.badgeGrad}>
                        <Text style={styles.badgeText}>{cfg.label}</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <ProgressBar status={p.status} />

                  <View style={styles.cardBottom}>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="package" size={11} color="#64748B" />
                        <Text style={styles.metaText}>{p.weight}kg · {p.size}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="dollar-sign" size={11} color="#64748B" />
                        <Text style={styles.metaText}>${p.reward}</Text>
                      </View>
                      {carrier && (
                        <View style={styles.metaItem}>
                          <Feather name="user" size={11} color="#64748B" />
                          <Text style={styles.metaText}>{carrier.travelerName.split(" ")[0]}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.progressLabel}>
                      <Text style={styles.progressText}>{progressPct}%</Text>
                      <Feather name="chevron-right" size={14} color="#64748B" />
                    </View>
                  </View>

                  {/* In transit live indicator */}
                  {p.status === "in_transit" && (
                    <View style={styles.liveRow}>
                      <View style={styles.liveChip}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveChipText}>Live · On the way</Text>
                      </View>
                      {carrier && (
                        <TouchableOpacity
                          onPress={() => router.push({ pathname: "/messages/[id]", params: { id: "c1" } })}
                          style={styles.chatBtn}
                        >
                          <Feather name="message-circle" size={14} color="#F97316" />
                          <Text style={styles.chatBtnText}>Chat</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 12 },
  liveBanner: { borderRadius: 12, overflow: "hidden", marginBottom: 14 },
  liveGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
  },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B82F6" },
  liveText: { color: "#3B82F6", fontSize: 13, fontFamily: "Inter_500Medium" },
  tabsContainer: { gap: 8, paddingBottom: 2 },
  tabBtn: { borderRadius: 12, overflow: "hidden" },
  tabGrad: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 14, gap: 6 },
  tabInactive: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 14, gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12,
  },
  tabText: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBadge: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabCount: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tabBadgeInactive: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabCountInactive: { color: "#64748B", fontSize: 11, fontFamily: "Inter_500Medium" },
  list: { flex: 1 },
  listContent: { padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  sendBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  sendBtnGrad: { paddingVertical: 12, paddingHorizontal: 24 },
  sendBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  parcelCard: {
    backgroundColor: "#1C1208", borderRadius: 20, overflow: "hidden",
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  accentLine: { height: 3 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  parcelIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  parcelTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  routeCity: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { borderRadius: 8, overflow: "hidden" },
  badgeGrad: { paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaRow: { flexDirection: "row", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  progressLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressText: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  liveRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#10B981" },
  liveChipText: { color: "#10B981", fontSize: 12, fontFamily: "Inter_500Medium" },
  chatBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(249,115,22,0.15)",
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10,
  },
  chatBtnText: { color: "#F97316", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
