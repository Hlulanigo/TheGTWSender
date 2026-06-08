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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";

const MENU: { icon: string; label: string; sub: string }[] = [
  { icon: "bell", label: "Notifications", sub: "Manage delivery alerts" },
  { icon: "credit-card", label: "Payment Methods", sub: "Add or edit payment" },
  { icon: "shield", label: "Verification", sub: "ID verified" },
  { icon: "star", label: "Reviews", sub: "See what others say" },
  { icon: "help-circle", label: "Help & Support", sub: "FAQs and contact" },
  { icon: "settings", label: "Settings", sub: "Account preferences" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, parcels, trips } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const deliveredCount = parcels.filter((p) => p.status === "delivered").length;
  const myTrips = trips.filter((t) => t.isOwn).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile hero */}
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={["#7C3AED", "#3B82F6"]}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
          </LinearGradient>
          <View style={styles.verifiedBadge}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.verifiedGrad}
            >
              <Feather name="check" size={8} color="#fff" />
            </LinearGradient>
          </View>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{user.rating} rating</Text>
          <View style={styles.dot} />
          <Text style={styles.memberText}>Member since {user.memberSince}</Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={["rgba(124,58,237,0.15)", "rgba(124,58,237,0.05)"]}
            style={styles.statBox}
          >
            <Text style={styles.statValue}>{user.parcelsSent}</Text>
            <Text style={styles.statLabel}>Sent</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(59,130,246,0.15)", "rgba(59,130,246,0.05)"]}
            style={styles.statBox}
          >
            <Text style={styles.statValue}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(6,182,212,0.15)", "rgba(6,182,212,0.05)"]}
            style={styles.statBox}
          >
            <Text style={styles.statValue}>{user.tripsPosted + myTrips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </LinearGradient>
          <LinearGradient
            colors={["rgba(16,185,129,0.15)", "rgba(16,185,129,0.05)"]}
            style={styles.statBox}
          >
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              ${user.earnings}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, i === MENU.length - 1 && styles.menuItemLast]}
            activeOpacity={0.7}
            onPress={() => Haptics.selectionAsync()}
          >
            <View style={styles.menuIcon}>
              <LinearGradient
                colors={["rgba(124,58,237,0.2)", "rgba(79,70,229,0.15)"]}
                style={styles.menuIconGrad}
              >
                <Feather name={item.icon as any} size={16} color="#7C3AED" />
              </LinearGradient>
            </View>
            <View style={styles.menuTextBlock}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#64748B" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        activeOpacity={0.8}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <Feather name="log-out" size={16} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  content: {},
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
  },
  avatarSection: {
    position: "relative",
    marginBottom: 14,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#1E1A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#0D0B1E",
  },
  verifiedGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  profileEmail: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#64748B",
  },
  memberText: {
    color: "#64748B",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statsSection: { padding: 20, paddingBottom: 0 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  menuSection: {
    margin: 20,
    backgroundColor: "#1E1A3A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 36, height: 36 },
  menuIconGrad: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextBlock: { flex: 1 },
  menuLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  menuSub: {
    color: "#64748B",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  signOutText: {
    color: "#EF4444",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
