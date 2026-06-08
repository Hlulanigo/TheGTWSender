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

export default function MessagesTabScreen() {
  const insets = useSafeAreaInsets();
  const { conversations, parcels } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnread > 0 ? (
              <Text style={styles.headerSub}>
                {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
              </Text>
            ) : (
              <Text style={styles.headerSub}>Your conversations with carriers</Text>
            )}
          </View>
          {totalUnread > 0 && (
            <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.unreadBubble}>
              <Text style={styles.unreadBubbleText}>{totalUnread}</Text>
            </LinearGradient>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.emptyIcon}>
              <Feather name="message-circle" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Once a carrier accepts your package, you can chat with them here.
            </Text>
            <TouchableOpacity
              style={styles.sendFirstBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(tabs)/send");
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F97316", "#EA580C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendFirstGrad}
              >
                <Feather name="package" size={16} color="#fff" />
                <Text style={styles.sendFirstText}>Send Your First Package</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {conversations.map((conv) => {
              const parcel = conv.parcelId
                ? parcels.find((p) => p.id === conv.parcelId)
                : null;

              return (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push({ pathname: "/messages/[id]", params: { id: conv.id } });
                  }}
                  activeOpacity={0.85}
                  style={[styles.convItem, conv.unreadCount > 0 && styles.convItemUnread]}
                >
                  <LinearGradient
                    colors={["#F97316", "#EA580C"]}
                    style={styles.convAvatar}
                  >
                    <Text style={styles.convInitials}>{conv.otherInitials}</Text>
                  </LinearGradient>
                  <View style={styles.convContent}>
                    <View style={styles.convTopRow}>
                      <Text style={styles.convName}>{conv.otherName}</Text>
                      <Text style={styles.convTime}>{conv.lastMessageTime}</Text>
                    </View>
                    {parcel && (
                      <View style={styles.parcelTag}>
                        <Feather name="package" size={10} color="#F97316" />
                        <Text style={styles.parcelTagText} numberOfLines={1}>
                          {parcel.title}
                        </Text>
                        <Text style={styles.parcelTagRoute}>
                          {parcel.fromCity} → {parcel.toCity}
                        </Text>
                      </View>
                    )}
                    <View style={styles.convBottomRow}>
                      <Text
                        style={[
                          styles.convPreview,
                          conv.unreadCount > 0 && styles.convPreviewBold,
                        ]}
                        numberOfLines={1}
                      >
                        {conv.lastMessage}
                      </Text>
                      {conv.unreadCount > 0 && (
                        <LinearGradient
                          colors={["#F97316", "#EA580C"]}
                          style={styles.unreadBadge}
                        >
                          <Text style={styles.unreadCount}>{conv.unreadCount}</Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: {
    color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4,
  },
  unreadBubble: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  unreadBubbleText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  list: { flex: 1 },
  listContent: { padding: 16 },
  convItem: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#1C1208", borderRadius: 18, padding: 14,
    marginBottom: 10, gap: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  convItemUnread: {
    borderColor: "rgba(249,115,22,0.3)",
    backgroundColor: "rgba(249,115,22,0.06)",
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
  parcelTag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8,
    marginBottom: 6, alignSelf: "flex-start",
  },
  parcelTagText: {
    color: "#FED7AA", fontSize: 11, fontFamily: "Inter_500Medium", maxWidth: 80,
  },
  parcelTagRoute: { color: "#64748B", fontSize: 11, fontFamily: "Inter_400Regular" },
  convBottomRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  convPreview: {
    color: "#94A3B8", fontSize: 13,
    fontFamily: "Inter_400Regular", flex: 1, marginRight: 8,
  },
  convPreviewBold: { color: "#FFFFFF", fontFamily: "Inter_500Medium" },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  unreadCount: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 14 },
  emptyIcon: {
    width: 68, height: 68, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyText: {
    color: "#64748B", fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 21, paddingHorizontal: 20,
  },
  sendFirstBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  sendFirstGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 14, paddingHorizontal: 24,
  },
  sendFirstText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
