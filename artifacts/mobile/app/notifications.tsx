import React from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp, AppNotification } from "@/context/AppContext";

const ICON_MAP: Record<string, { icon: string; colors: [string, string] }> = {
  delivery: { icon: "check-circle", colors: ["#10B981", "#059669"] },
  match: { icon: "package", colors: ["#F97316", "#EA580C"] },
  message: { icon: "message-circle", colors: ["#3B82F6", "#06B6D4"] },
  system: { icon: "bell", colors: ["#F59E0B", "#D97706"] },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const unread = notifications.filter((n) => !n.read).length;

  function handlePress(n: AppNotification) {
    Haptics.selectionAsync();
    markNotificationRead(n.id);
    if (n.type === "delivery" || n.type === "match") {
      if (n.relatedId) {
        router.push({ pathname: "/parcel/[id]", params: { id: n.relatedId } });
      }
    } else if (n.type === "message") {
      if (n.relatedId) {
        router.push({ pathname: "/messages/[id]", params: { id: n.relatedId } });
      }
    }
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 ? (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                markAllNotificationsRead();
              }}
            >
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>
        {unread > 0 && (
          <View style={styles.unreadBanner}>
            <LinearGradient
              colors={["rgba(249,115,22,0.2)", "rgba(234,88,12,0.1)"]}
              style={styles.unreadGrad}
            >
              <View style={styles.unreadDot} />
              <Text style={styles.unreadText}>{unread} unread notification{unread !== 1 ? "s" : ""}</Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 80 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={40} color="#EA580C" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>Activity on your parcels and trips will appear here</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const cfg = ICON_MAP[n.type] ?? ICON_MAP.system;
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => handlePress(n)}
                activeOpacity={0.8}
                style={[styles.notifItem, !n.read && styles.notifItemUnread]}
              >
                <LinearGradient colors={cfg.colors} style={styles.notifIcon}>
                  <Feather name={cfg.icon as any} size={16} color="#fff" />
                </LinearGradient>
                <View style={styles.notifContent}>
                  <View style={styles.notifTopRow}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    {!n.read && <View style={styles.unreadIndicator} />}
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                  <Text style={styles.notifTime}>{n.timestamp}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#64748B" />
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
  headerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  markAll: { color: "#F97316", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  unreadBanner: { borderRadius: 12, overflow: "hidden" },
  unreadGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(249,115,22,0.2)",
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F97316" },
  unreadText: { color: "#F97316", fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { flex: 1 },
  listContent: { padding: 16 },
  notifItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1C1208", borderRadius: 16, padding: 14,
    marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  notifItemUnread: {
    borderColor: "rgba(249,115,22,0.25)",
    backgroundColor: "rgba(249,115,22,0.06)",
  },
  notifIcon: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTopRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 3,
  },
  notifTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  unreadIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F97316" },
  notifBody: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 4 },
  notifTime: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
});
