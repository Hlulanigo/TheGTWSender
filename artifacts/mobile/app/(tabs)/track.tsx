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
import ParcelCard from "@/components/ParcelCard";

const TABS: { key: ParcelStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { parcels } = useApp();
  const [activeTab, setActiveTab] = useState<ParcelStatus | "all">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered =
    activeTab === "all"
      ? parcels
      : parcels.filter((p) => p.status === activeTab);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <LinearGradient
        colors={["#1A1133", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Track Deliveries</Text>
        <Text style={styles.headerSub}>{parcels.length} total packages</Text>

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
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab.key);
                }}
                style={styles.tabBtn}
                activeOpacity={0.8}
              >
                {active ? (
                  <LinearGradient
                    colors={["#7C3AED", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabGrad}
                  >
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                    <View style={styles.tabCountBadge}>
                      <Text style={styles.tabCount}>{count}</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInactive}>
                    <Text style={styles.tabText}>{tab.label}</Text>
                    {count > 0 && (
                      <View style={styles.tabCountBadgeInactive}>
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

      {/* List */}
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
            <Feather name="inbox" size={40} color="#4F46E5" />
            <Text style={styles.emptyTitle}>No packages here</Text>
            <Text style={styles.emptyText}>
              Packages in this category will appear here
            </Text>
          </View>
        ) : (
          filtered.map((p) => (
            <ParcelCard
              key={p.id}
              parcel={p}
              onPress={() => {
                router.push({
                  pathname: "/parcel/[id]",
                  params: { id: p.id },
                });
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  headerSub: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  tabsContainer: { gap: 8, paddingBottom: 2 },
  tabBtn: { borderRadius: 12, overflow: "hidden" },
  tabGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  tabInactive: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
  },
  tabText: {
    color: "#94A3B8",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  tabTextActive: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  tabCountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCount: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  tabCountBadgeInactive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCountInactive: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  list: { flex: 1 },
  listContent: { padding: 20 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
  },
});
