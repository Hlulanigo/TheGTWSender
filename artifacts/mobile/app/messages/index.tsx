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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets();
  const { conversations } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>
        {totalUnread > 0 && (
          <Text style={styles.unreadSub}>
            {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
          </Text>
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
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={40} color="#4F46E5" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Messages with your carriers and senders will appear here
            </Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/messages/[id]", params: { id: conv.id } });
              }}
              activeOpacity={0.85}
              style={styles.convItem}
            >
              <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.convAvatar}>
                <Text style={styles.convInitials}>{conv.otherInitials}</Text>
              </LinearGradient>
              <View style={styles.convContent}>
                <View style={styles.convTopRow}>
                  <Text style={styles.convName}>{conv.otherName}</Text>
                  <Text style={styles.convTime}>{conv.lastMessageTime}</Text>
                </View>
                <View style={styles.convBottomRow}>
                  <Text style={styles.convPreview} numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <LinearGradient
                      colors={["#7C3AED", "#4F46E5"]}
                      style={styles.unreadBadge}
                    >
                      <Text style={styles.unreadCount}>{conv.unreadCount}</Text>
                    </LinearGradient>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  unreadSub: { color: "#7C3AED", fontSize: 13, fontFamily: "Inter_500Medium", paddingTop: 4 },
  list: { flex: 1 },
  listContent: { padding: 16 },
  convItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1E1A3A", borderRadius: 16, padding: 14,
    marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  convAvatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
  },
  convInitials: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  convContent: { flex: 1 },
  convTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  convName: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  convTime: { color: "#64748B", fontSize: 12, fontFamily: "Inter_400Regular" },
  convBottomRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  convPreview: {
    color: "#94A3B8", fontSize: 13,
    fontFamily: "Inter_400Regular", flex: 1, marginRight: 8,
  },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  unreadCount: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
});
