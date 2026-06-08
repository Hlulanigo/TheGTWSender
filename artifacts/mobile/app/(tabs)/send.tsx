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
import TripCard from "@/components/TripCard";

type Step = 1 | 2 | 3 | 4;

const SIZES: { key: ParcelSize; label: string; desc: string; icon: string }[] = [
  { key: "small", label: "Small", desc: "Envelope / < 1kg", icon: "mail" },
  { key: "medium", label: "Medium", desc: "Shoebox / 1–5kg", icon: "package" },
  { key: "large", label: "Large", desc: "Luggage / 5–15kg", icon: "box" },
];

const HANDLING: { key: string; label: string; icon: string }[] = [
  { key: "fragile", label: "Fragile", icon: "alert-triangle" },
  { key: "upright", label: "Keep Upright", icon: "arrow-up" },
  { key: "cool", label: "Keep Cool", icon: "thermometer" },
  { key: "urgent", label: "Urgent", icon: "zap" },
];

const STEP_TITLES = ["Route", "Package", "Budget", "Pick a Carrier"];
const STEP_SUBS = [
  "Where does it need to go?",
  "Tell us about your package",
  "Set your delivery reward",
  "Choose your carrier",
];

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const { addParcel, requestDelivery, trips } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Step state
  const [step, setStep] = useState<Step>(1);

  // Step 1 – Route
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [neededBy, setNeededBy] = useState("");

  // Step 2 – Package
  const [title, setTitle] = useState("");
  const [size, setSize] = useState<ParcelSize>("small");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [handling, setHandling] = useState<string[]>([]);

  // Step 3 – Budget
  const [reward, setReward] = useState("25");

  // Step 4 – result
  const [submittedParcelId, setSubmittedParcelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingTripId, setBookingTripId] = useState<string | null>(null);

  const matchingTrips = trips.filter(
    (t) =>
      t.status === "open" &&
      !t.isOwn &&
      (!from || t.fromCity.toLowerCase().includes(from.split(",")[0].toLowerCase())) &&
      (!to || t.toCity.toLowerCase().includes(to.split(",")[0].toLowerCase()))
  );

  // Fall back to all open trips if no route match
  const carriersToShow =
    matchingTrips.length > 0
      ? matchingTrips
      : trips.filter((t) => t.status === "open" && !t.isOwn);

  function toggleHandling(key: string) {
    Haptics.selectionAsync();
    setHandling((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function validateStep1() {
    if (!from.trim() || !to.trim()) {
      Alert.alert("Required", "Please enter both pickup and drop-off locations.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (!title.trim() || !weight.trim()) {
      Alert.alert("Required", "Please enter a package name and weight.");
      return false;
    }
    return true;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3) {
      // Create the parcel and move to carrier selection
      setLoading(true);
      const desc = [description, ...handling.map((h) => HANDLING.find((x) => x.key === h)?.label ?? "")]
        .filter(Boolean)
        .join(", ");
      setTimeout(() => {
        addParcel({
          title: title.trim(),
          from: from.trim(),
          fromCity: from.split(",")[0].trim(),
          to: to.trim(),
          toCity: to.split(",")[0].trim(),
          weight: parseFloat(weight) || 0.5,
          size,
          description: desc,
          reward: parseFloat(reward) || 25,
          matchedTripId: undefined,
        });
        setLoading(false);
        setStep(4);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 700);
      return;
    }
    Haptics.selectionAsync();
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function handleBookCarrier(tripId: string) {
    setBookingTripId(tripId);
    setTimeout(() => {
      setBookingTripId(null);
      setSubmittedParcelId(tripId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  }

  function handleReset() {
    setStep(1);
    setFrom(""); setTo(""); setNeededBy("");
    setTitle(""); setSize("small"); setWeight(""); setDescription(""); setHandling([]);
    setReward("25");
    setSubmittedParcelId(null);
  }

  // Success state after booking a carrier
  if (submittedParcelId) {
    return (
      <View style={[styles.screen, styles.successScreen, { paddingTop: topPad + 20 }]}>
        <LinearGradient colors={["#7C3AED", "#3B82F6"]} style={styles.successIcon}>
          <Feather name="check" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.successTitle}>Carrier Requested!</Text>
        <Text style={styles.successSub}>
          Your package request has been sent. The carrier will confirm pickup details shortly.
        </Text>
        <GradientButton
          title="Track My Package"
          onPress={() => { handleReset(); router.push("/(tabs)/track"); }}
          style={styles.successBtn}
        />
        <TouchableOpacity onPress={() => { handleReset(); router.push("/(tabs)/messages"); }} style={styles.msgBtn}>
          <Feather name="message-circle" size={16} color="#7C3AED" />
          <Text style={styles.msgBtnText}>Message Carrier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReset} style={styles.anotherBtn}>
          <Text style={styles.anotherText}>Send Another Package</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header with step indicator */}
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          {step > 1 ? (
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setStep((s) => (s > 1 ? ((s - 1) as Step) : s)); }}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <Text style={styles.stepLabel}>Step {step} of {step < 4 ? 3 : 4}</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        {/* Step dots */}
        <View style={styles.stepDots}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.dotWrapper}>
              {s < step || (step === 4) ? (
                <LinearGradient colors={["#7C3AED", "#3B82F6"]} style={styles.dotFilled}>
                  <Feather name="check" size={10} color="#fff" />
                </LinearGradient>
              ) : s === step ? (
                <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.dotActive} />
              ) : (
                <View style={styles.dotInactive} />
              )}
              {s < 3 && (
                <View style={[styles.dotLine, (s < step || step === 4) && styles.dotLineActive]} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.stepTitle}>{STEP_TITLES[step - 1]}</Text>
        <Text style={styles.stepSub}>{STEP_SUBS[step - 1]}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── STEP 1: Route ── */}
        {step === 1 && (
          <View>
            <View style={styles.routeCard}>
              <View style={styles.routeField}>
                <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.routeIconBox}>
                  <Feather name="map-pin" size={14} color="#fff" />
                </LinearGradient>
                <TextInput
                  style={styles.routeInput}
                  placeholder="Pickup location (e.g. New York, NY)"
                  placeholderTextColor="#64748B"
                  value={from}
                  onChangeText={setFrom}
                />
              </View>
              <View style={styles.routeSwapLine}>
                <View style={styles.routeSwapDash} />
                <TouchableOpacity style={styles.swapBtn} onPress={() => { const t = from; setFrom(to); setTo(t); }}>
                  <Feather name="repeat" size={14} color="#64748B" />
                </TouchableOpacity>
                <View style={styles.routeSwapDash} />
              </View>
              <View style={styles.routeField}>
                <LinearGradient colors={["#3B82F6", "#06B6D4"]} style={styles.routeIconBox}>
                  <Feather name="navigation" size={14} color="#fff" />
                </LinearGradient>
                <TextInput
                  style={styles.routeInput}
                  placeholder="Drop-off location (e.g. Los Angeles, CA)"
                  placeholderTextColor="#64748B"
                  value={to}
                  onChangeText={setTo}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Needed by (optional)</Text>
              <View style={styles.inputWrap}>
                <Feather name="calendar" size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dec 15, 2024"
                  placeholderTextColor="#64748B"
                  value={neededBy}
                  onChangeText={setNeededBy}
                />
              </View>
            </View>

            {/* Carriers preview for this route */}
            {(from || to) && (
              <View style={styles.previewBanner}>
                <LinearGradient
                  colors={["rgba(124,58,237,0.15)", "rgba(124,58,237,0.05)"]}
                  style={styles.previewGrad}
                >
                  <Feather name="users" size={16} color="#7C3AED" />
                  <Text style={styles.previewText}>
                    <Text style={styles.previewCount}>{carriersToShow.length} carrier{carriersToShow.length !== 1 ? "s" : ""}</Text>
                    {" "}available on this route
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        )}

        {/* ── STEP 2: Package ── */}
        {step === 2 && (
          <View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Package Name</Text>
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

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Size</Text>
              <View style={styles.sizeGrid}>
                {SIZES.map((s) => {
                  const active = size === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      onPress={() => { Haptics.selectionAsync(); setSize(s.key); }}
                      activeOpacity={0.8}
                      style={[styles.sizeCard, active && styles.sizeCardActive]}
                    >
                      {active ? (
                        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.sizeCardGrad}>
                          <Feather name={s.icon as any} size={20} color="#fff" />
                          <Text style={styles.sizeLabelActive}>{s.label}</Text>
                          <Text style={styles.sizeDescActive}>{s.desc}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.sizeCardInner}>
                          <Feather name={s.icon as any} size={20} color="#64748B" />
                          <Text style={styles.sizeLabel}>{s.label}</Text>
                          <Text style={styles.sizeDesc}>{s.desc}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Weight (kg)</Text>
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

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Special Handling</Text>
              <View style={styles.handlingRow}>
                {HANDLING.map((h) => {
                  const active = handling.includes(h.key);
                  return (
                    <TouchableOpacity
                      key={h.key}
                      onPress={() => toggleHandling(h.key)}
                      activeOpacity={0.8}
                      style={styles.handlingChip}
                    >
                      {active ? (
                        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.handlingGrad}>
                          <Feather name={h.icon as any} size={13} color="#fff" />
                          <Text style={styles.handlingTextActive}>{h.label}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.handlingInactive}>
                          <Feather name={h.icon as any} size={13} color="#64748B" />
                          <Text style={styles.handlingText}>{h.label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Description (optional)</Text>
              <View style={[styles.inputWrap, { alignItems: "flex-start", paddingTop: 12 }]}>
                <TextInput
                  style={[styles.input, { minHeight: 60, textAlignVertical: "top", paddingVertical: 0 }]}
                  placeholder="Contents, special notes for the carrier…"
                  placeholderTextColor="#64748B"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 3: Budget ── */}
        {step === 3 && (
          <View>
            <View style={styles.rewardCard}>
              <LinearGradient colors={["rgba(16,185,129,0.15)", "rgba(16,185,129,0.05)"]} style={styles.rewardGrad}>
                <Text style={styles.rewardLabel}>Delivery Reward</Text>
                <View style={styles.rewardInputRow}>
                  <Text style={styles.rewardDollar}>$</Text>
                  <TextInput
                    style={styles.rewardInput}
                    value={reward}
                    onChangeText={setReward}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <Text style={styles.rewardHint}>This is what you pay the carrier</Text>
              </LinearGradient>
            </View>

            {/* Suggested amounts */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Suggested amounts</Text>
              <View style={styles.suggestRow}>
                {["15", "25", "35", "50"].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => { Haptics.selectionAsync(); setReward(amt); }}
                    style={[styles.suggestChip, reward === amt && styles.suggestChipActive]}
                  >
                    <Text style={[styles.suggestText, reward === amt && styles.suggestTextActive]}>
                      ${amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Delivery Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Route</Text>
                <Text style={styles.summaryValue}>{from.split(",")[0]} → {to.split(",")[0]}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Package</Text>
                <Text style={styles.summaryValue}>{title || "Untitled"} · {weight || "?"}kg · {size}</Text>
              </View>
              {handling.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Handling</Text>
                  <Text style={styles.summaryValue}>{handling.map((h) => HANDLING.find((x) => x.key === h)?.label).join(", ")}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Reward</Text>
                <Text style={styles.summaryTotalValue}>${reward}</Text>
              </View>
            </View>

            <View style={styles.tipBanner}>
              <Feather name="info" size={14} color="#F59E0B" />
              <Text style={styles.tipText}>
                Higher rewards attract more carriers and faster pickup
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 4: Pick a carrier ── */}
        {step === 4 && (
          <View>
            {carriersToShow.length === 0 ? (
              <View style={styles.noCarriers}>
                <Feather name="compass" size={36} color="#4F46E5" />
                <Text style={styles.noCarriersTitle}>No carriers available yet</Text>
                <Text style={styles.noCarriersText}>
                  Your package request is posted. Carriers will be notified and can accept it.
                </Text>
                <GradientButton
                  title="Track My Package"
                  onPress={() => { handleReset(); router.push("/(tabs)/track"); }}
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              <>
                <View style={styles.carriersHeader}>
                  <Text style={styles.carriersCount}>
                    {carriersToShow.length} carrier{carriersToShow.length !== 1 ? "s" : ""} available
                  </Text>
                  <Text style={styles.carriersSubtext}>Select one to send a request</Text>
                </View>
                {carriersToShow.map((trip) => (
                  <View key={trip.id} style={styles.carrierWithBtn}>
                    <TripCard trip={trip} />
                    <GradientButton
                      title={bookingTripId === trip.id ? "Requesting…" : "Request This Carrier"}
                      loading={bookingTripId === trip.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setSubmittedParcelId(trip.id);
                      }}
                      small
                      style={styles.requestBtn}
                    />
                  </View>
                ))}
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.orLine} />
                </View>
                <TouchableOpacity
                  style={styles.postAllBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSubmittedParcelId("broadcast");
                  }}
                >
                  <Text style={styles.postAllText}>Broadcast to All Carriers</Text>
                  <Text style={styles.postAllSub}>Let any carrier accept your package</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Next / Post button */}
        {step < 4 && (
          <GradientButton
            title={step === 3 ? "Find Carriers →" : "Next →"}
            onPress={goNext}
            loading={loading}
            style={styles.nextBtn}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  backBtnPlaceholder: { width: 36 },
  stepLabel: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium" },
  stepDots: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  dotWrapper: { flexDirection: "row", alignItems: "center" },
  dotFilled: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dotActive: { width: 24, height: 24, borderRadius: 12 },
  dotInactive: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 2, borderColor: "rgba(255,255,255,0.15)" },
  dotLine: { width: 32, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 4 },
  dotLineActive: { backgroundColor: "#7C3AED" },
  stepTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 4 },
  stepSub: { color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  routeCard: {
    backgroundColor: "#1E1A3A", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 20, overflow: "hidden",
  },
  routeField: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  routeIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  routeInput: { flex: 1, color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_400Regular" },
  routeSwapLine: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, gap: 8,
  },
  routeSwapDash: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  swapBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  fieldBlock: { marginBottom: 20 },
  label: {
    color: "#94A3B8", fontSize: 11, fontFamily: "Inter_500Medium",
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1E1A3A", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1, color: "#FFFFFF",
    fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 14,
  },
  previewBanner: { borderRadius: 14, overflow: "hidden" },
  previewGrad: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.2)",
  },
  previewText: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular" },
  previewCount: { color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  sizeGrid: { flexDirection: "row", gap: 10 },
  sizeCard: { flex: 1, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  sizeCardActive: { borderColor: "transparent" },
  sizeCardGrad: { padding: 14, alignItems: "center", gap: 4 },
  sizeCardInner: { padding: 14, alignItems: "center", gap: 4, backgroundColor: "#1E1A3A" },
  sizeLabel: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sizeLabelActive: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sizeDesc: { color: "#64748B", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  sizeDescActive: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  handlingRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  handlingChip: { borderRadius: 20, overflow: "hidden" },
  handlingGrad: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  handlingInactive: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "#1E1A3A", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  handlingText: { color: "#64748B", fontSize: 12, fontFamily: "Inter_500Medium" },
  handlingTextActive: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  rewardCard: { borderRadius: 20, overflow: "hidden", marginBottom: 20 },
  rewardGrad: {
    padding: 24, borderRadius: 20, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(16,185,129,0.2)",
  },
  rewardLabel: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 12 },
  rewardInputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rewardDollar: { color: "#10B981", fontSize: 36, fontFamily: "Inter_600SemiBold" },
  rewardInput: {
    color: "#10B981", fontSize: 56, fontFamily: "Inter_700Bold",
    minWidth: 80, textAlign: "center",
  },
  rewardHint: { color: "#64748B", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
  suggestRow: { flexDirection: "row", gap: 10 },
  suggestChip: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: "#1E1A3A", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  suggestChipActive: { borderColor: "#7C3AED", backgroundColor: "rgba(124,58,237,0.15)" },
  suggestText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  suggestTextActive: { color: "#A78BFA" },
  summaryCard: {
    backgroundColor: "#1E1A3A", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 14,
  },
  summaryTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: "#64748B", fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_500Medium", maxWidth: "60%", textAlign: "right" },
  summaryTotal: {
    marginTop: 8, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", marginBottom: 0,
  },
  summaryTotalLabel: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  summaryTotalValue: { color: "#10B981", fontSize: 18, fontFamily: "Inter_700Bold" },
  tipBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
  },
  tipText: { color: "#F59E0B", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  carriersHeader: { marginBottom: 16 },
  carriersCount: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  carriersSubtext: { color: "#94A3B8", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  carrierWithBtn: { marginBottom: 4 },
  requestBtn: { marginTop: -4, marginBottom: 14 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  orText: { color: "#64748B", fontSize: 13, fontFamily: "Inter_400Regular" },
  postAllBtn: {
    backgroundColor: "#1E1A3A", borderRadius: 16, padding: 16,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  postAllText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  postAllSub: { color: "#64748B", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  noCarriers: { alignItems: "center", paddingVertical: 40, gap: 12 },
  noCarriersTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  noCarriersText: {
    color: "#94A3B8", fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 20, paddingHorizontal: 20,
  },
  nextBtn: { marginTop: 8 },
  successScreen: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 32,
  },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  successTitle: {
    color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold",
    marginBottom: 12, textAlign: "center",
  },
  successSub: {
    color: "#94A3B8", fontSize: 15, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 22, marginBottom: 32,
  },
  successBtn: { width: "100%", marginBottom: 12 },
  msgBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 12, marginBottom: 8,
  },
  msgBtnText: { color: "#7C3AED", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  anotherBtn: { paddingVertical: 12 },
  anotherText: { color: "#64748B", fontSize: 14, fontFamily: "Inter_500Medium" },
});
