import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const MENU_SECTIONS = [
  {
    title: "Deliveries",
    items: [
      { icon: "package", label: "My Packages", sub: "View all sent packages", route: "/(tabs)/track" },
      { icon: "message-circle", label: "Messages", sub: "Conversations with carriers", route: "/(tabs)/messages" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "credit-card", label: "Payment Methods", sub: "Add or edit cards & wallets" },
      { icon: "map-pin", label: "Saved Addresses", sub: "Quick pickup & dropoff" },
      { icon: "bell", label: "Notifications", sub: "Delivery and status alerts" },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      { icon: "shield", label: "ID Verified", sub: "Account verified", info: "Verified" },
      { icon: "star", label: "My Reviews", sub: "See what carriers say about you" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle", label: "Help & FAQ", sub: "Common questions and guides" },
      { icon: "settings", label: "Settings", sub: "Privacy, security, and more" },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { parcels } = useApp();
  const { user: authUser, signOut } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const displayName = authUser?.name ?? "GTW User";
  const displayEmail = authUser?.email ?? "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalSent = parcels.length;
  const delivered = parcels.filter((p) => p.status === "delivered").length;
  const totalRewards = parcels.reduce((s, p) => s + p.reward, 0);

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
        colors={["#1C0D04", "#0F0A04"]}
        style={[styles.hero, { paddingTop: topPad + 10 }]}
      >
        {/* Brand logo */}
        <View style={styles.brandRow}>
          <Image source={require("@/assets/logo.png")} style={styles.brandLogo} resizeMode="contain" tintColor="#F97316" />
        </View>

        {/* Notifications shortcut */}
        <View style={styles.heroTopRow}>
          <View />
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => { Haptics.selectionAsync(); router.push("/notifications"); }}
          >
            <Feather name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <LinearGradient colors={["#F97316", "#3B82F6"]} style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </LinearGradient>
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.verifiedBadge}>
            <Feather name="check" size={8} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{displayEmail}</Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={13} color="#F59E0B" />
          <Text style={styles.ratingText}>GTW Member</Text>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => { Haptics.selectionAsync(); router.push("/profile/edit"); }}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={13} color="#F97316" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <LinearGradient colors={["rgba(249,115,22,0.18)", "rgba(249,115,22,0.05)"]} style={styles.statBox}>
            <Feather name="package" size={18} color="#F97316" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{totalSent}</Text>
            <Text style={styles.statLabel}>Packages Sent</Text>
          </LinearGradient>
          <LinearGradient colors={["rgba(16,185,129,0.18)", "rgba(16,185,129,0.05)"]} style={styles.statBox}>
            <Feather name="check-circle" size={18} color="#10B981" style={{ marginBottom: 6 }} />
            <Text style={[styles.statValue, { color: "#10B981" }]}>{delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </LinearGradient>
          <LinearGradient colors={["rgba(59,130,246,0.18)", "rgba(59,130,246,0.05)"]} style={styles.statBox}>
            <Feather name="dollar-sign" size={18} color="#3B82F6" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>${totalRewards}</Text>
            <Text style={styles.statLabel}>Paid to Carriers</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Send package CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(tabs)/send"); }}
          style={styles.ctaBtn}
          activeOpacity={0.88}
        >
          <LinearGradient colors={["#F97316", "#EA580C", "#3B82F6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
            <Feather name="package" size={18} color="#fff" />
            <Text style={styles.ctaText}>Send a Package</Text>
            <Feather name="arrow-right" size={16} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  i === section.items.length - 1 && styles.menuItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  if ((item as any).route) router.push((item as any).route);
                }}
              >
                <LinearGradient
                  colors={["rgba(249,115,22,0.2)", "rgba(234,88,12,0.1)"]}
                  style={styles.menuIcon}
                >
                  <Feather name={item.icon as any} size={16} color="#F97316" />
                </LinearGradient>
                <View style={styles.menuTextBlock}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                {(item as any).info ? (
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>{(item as any).info}</Text>
                  </View>
                ) : (
                  <Feather name="chevron-right" size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        activeOpacity={0.8}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/auth/login");
        }}
      >
        <Feather name="log-out" size={16} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F0A04" },
  content: {},
  hero: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center" },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: "100%", marginBottom: 16 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  brandRow: { alignItems: "center", marginBottom: 12 },
  brandLogo: { width: 110, height: 38 },
  avatarSection: { position: "relative", marginBottom: 14 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, padding: 3, alignItems: "center", justifyContent: "center" },
  avatarInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#1C1208", alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  verifiedBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11, overflow: "hidden",
    borderWidth: 2, borderColor: "#0F0A04",
    alignItems: "center", justifyContent: "center",
  },
  profileName: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  profileEmail: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { color: "#F59E0B", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  editProfileBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 12, paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: "rgba(249,115,22,0.12)", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(249,115,22,0.25)",
  },
  editProfileText: { color: "#F97316", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#64748B" },
  memberText: { color: "#64748B", fontSize: 13, fontFamily: "Inter_400Regular" },
  statsSection: { padding: 20, paddingBottom: 0 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { color: "#94A3B8", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3, textAlign: "center" },
  ctaSection: { paddingHorizontal: 20, paddingTop: 16 },
  ctaBtn: { borderRadius: 18, overflow: "hidden" },
  ctaGrad: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20 },
  ctaText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1, marginLeft: 12 },
  menuSection: { paddingHorizontal: 20, paddingTop: 20 },
  menuSectionTitle: { color: "#64748B", fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  menuCard: { backgroundColor: "#1C1208", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    padding: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuTextBlock: { flex: 1 },
  menuLabel: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_500Medium" },
  menuSub: { color: "#64748B", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  infoBadge: { backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  infoBadgeText: { color: "#10B981", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    margin: 20, paddingVertical: 14,
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 16,
    gap: 8, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
  },
  signOutText: { color: "#EF4444", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
