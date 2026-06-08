import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp, ParcelSize } from "@/context/AppContext";
import GradientButton from "@/components/GradientButton";

const SIZES: { key: ParcelSize; label: string; desc: string }[] = [
  { key: "small", label: "Small", desc: "< 1kg" },
  { key: "medium", label: "Medium", desc: "1–5kg" },
  { key: "large", label: "Large", desc: "5–15kg" },
];

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const { addParcel } = useApp();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState<ParcelSize>("small");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSubmit() {
    if (!from || !to || !title || !weight || !reward) {
      Alert.alert("Missing info", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addParcel({
        title,
        from,
        fromCity: from.split(",")[0].trim(),
        to,
        toCity: to.split(",")[0].trim(),
        weight: parseFloat(weight) || 0.5,
        size,
        description,
        reward: parseFloat(reward) || 0,
        matchedTripId: undefined,
      });
      setLoading(false);
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  }

  if (submitted) {
    return (
      <View
        style={[
          styles.screen,
          styles.successScreen,
          { paddingTop: topPad + 20 },
        ]}
      >
        <LinearGradient
          colors={["#7C3AED", "#3B82F6"]}
          style={styles.successIcon}
        >
          <Feather name="check" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.successTitle}>Package Posted!</Text>
        <Text style={styles.successSub}>
          Your delivery request is live. Travelers matching your route will be
          notified.
        </Text>
        <GradientButton
          title="View My Deliveries"
          onPress={() => {
            setSubmitted(false);
            setFrom("");
            setTo("");
            setTitle("");
            setWeight("");
            setDescription("");
            setReward("");
            router.push("/(tabs)/track");
          }}
          style={styles.successBtn}
        />
        <TouchableOpacity
          onPress={() => setSubmitted(false)}
          style={styles.anotherBtn}
        >
          <Text style={styles.anotherText}>Post Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 120 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Send a Package</Text>
        <Text style={styles.headerSub}>
          Post your delivery and connect with travelers
        </Text>
      </LinearGradient>

      <View style={styles.form}>
        {/* Route */}
        <View style={styles.routeCard}>
          <LinearGradient
            colors={["#1E1A3A", "#1A1733"]}
            style={styles.routeGrad}
          >
            <View style={styles.routeField}>
              <View style={[styles.routeDot, { backgroundColor: "#7C3AED" }]} />
              <TextInput
                style={styles.routeInput}
                placeholder="From (e.g. New York, NY)"
                placeholderTextColor="#64748B"
                value={from}
                onChangeText={setFrom}
              />
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeField}>
              <View style={[styles.routeDot, { backgroundColor: "#3B82F6" }]} />
              <TextInput
                style={styles.routeInput}
                placeholder="To (e.g. Los Angeles, CA)"
                placeholderTextColor="#64748B"
                value={to}
                onChangeText={setTo}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Package name */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Package Title</Text>
          <View style={styles.inputWrap}>
            <Feather name="tag" size={16} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Birthday Gift, Electronics"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Size selector */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Package Size</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((s) => {
              const active = size === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSize(s.key);
                  }}
                  activeOpacity={0.8}
                >
                  {active ? (
                    <LinearGradient
                      colors={["#7C3AED", "#4F46E5"]}
                      style={styles.sizeBtnGrad}
                    >
                      <Text style={styles.sizeLabelActive}>{s.label}</Text>
                      <Text style={styles.sizeDescActive}>{s.desc}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.sizeBtnInner}>
                      <Text style={styles.sizeLabel}>{s.label}</Text>
                      <Text style={styles.sizeDesc}>{s.desc}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Weight */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Exact Weight (kg)</Text>
          <View style={styles.inputWrap}>
            <Feather name="layers" size={16} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 1.5"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Description (optional)</Text>
          <View style={[styles.inputWrap, styles.textAreaWrap]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Contents, special instructions..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Reward */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Delivery Reward (USD)</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={reward}
              onChangeText={setReward}
            />
          </View>
          <Text style={styles.hint}>
            Higher rewards attract more travelers
          </Text>
        </View>

        <GradientButton
          title="Post Delivery Request"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  content: {},
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  headerSub: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  form: { padding: 20 },
  routeCard: { borderRadius: 20, overflow: "hidden", marginBottom: 20 },
  routeGrad: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  routeField: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  routeDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 14,
  },
  fieldBlock: { marginBottom: 18 },
  label: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1A3A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  dollarSign: {
    color: "#94A3B8",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 14,
  },
  textAreaWrap: { alignItems: "flex-start", paddingTop: 14 },
  textArea: { paddingVertical: 0, minHeight: 70, textAlignVertical: "top" },
  sizeRow: { flexDirection: "row", gap: 10 },
  sizeBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sizeBtnActive: { borderColor: "transparent" },
  sizeBtnGrad: {
    padding: 14,
    alignItems: "center",
  },
  sizeBtnInner: {
    padding: 14,
    alignItems: "center",
    backgroundColor: "#1E1A3A",
  },
  sizeLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sizeLabelActive: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sizeDesc: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  sizeDescActive: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  hint: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  submitBtn: { marginTop: 8 },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  successSub: {
    color: "#94A3B8",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  successBtn: { width: "100%", marginBottom: 12 },
  anotherBtn: { paddingVertical: 12 },
  anotherText: {
    color: "#7C3AED",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
