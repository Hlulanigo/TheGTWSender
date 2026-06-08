import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage } = useApp();
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const conv = conversations.find((c) => c.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  if (!conv) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.notFoundText}>Conversation not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(conv!.id, text.trim());
    setText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={["#1A0D3D", "#0D0B1E"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.headerAvatar}>
              <Text style={styles.headerInitials}>{conv.otherInitials}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerName}>{conv.otherName}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Active now</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Feather name="phone" size={18} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {/* Package context banner */}
        {conv.parcelId && (
          <View style={styles.contextBanner}>
            <LinearGradient
              colors={["rgba(124,58,237,0.15)", "rgba(79,70,229,0.1)"]}
              style={styles.contextGrad}
            >
              <Feather name="package" size={14} color="#7C3AED" />
              <Text style={styles.contextText}>Delivery conversation</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/parcel/[id]", params: { id: conv.parcelId! } })
                }
              >
                <Text style={styles.contextLink}>View package</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {conv.messages.map((msg, i) => {
          const isMe = msg.senderId === "me";
          const prevMsg = conv.messages[i - 1];
          const showTime = !prevMsg || prevMsg.senderId !== msg.senderId;

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}
            >
              {!isMe && showTime && (
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>{conv.otherInitials}</Text>
                </LinearGradient>
              )}
              {!isMe && !showTime && <View style={styles.msgAvatarSpacer} />}
              <View style={styles.msgBubbleWrapper}>
                {isMe ? (
                  <LinearGradient
                    colors={["#7C3AED", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.bubble, styles.bubbleMe]}
                  >
                    <Text style={styles.bubbleTextMe}>{msg.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.bubbleOther]}>
                    <Text style={styles.bubbleTextOther}>{msg.text}</Text>
                  </View>
                )}
                <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: bottomPad + 12 }]}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#64748B"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            style={styles.sendWrapper}
          >
            <LinearGradient
              colors={text.trim() ? ["#7C3AED", "#3B82F6"] : ["#2A2A4A", "#2A2A4A"]}
              style={styles.sendBtn}
            >
              <Feather
                name="send"
                size={16}
                color={text.trim() ? "#fff" : "#64748B"}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D0B1E" },
  notFoundText: { color: "#94A3B8", fontSize: 16, fontFamily: "Inter_400Regular" },
  backLink: { color: "#7C3AED", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  headerInitials: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  headerName: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  onlineText: { color: "#10B981", fontSize: 11, fontFamily: "Inter_400Regular" },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(124,58,237,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16 },
  contextBanner: { marginBottom: 16, borderRadius: 12, overflow: "hidden" },
  contextGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.2)",
  },
  contextText: { color: "#94A3B8", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  contextLink: { color: "#7C3AED", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  msgRow: { flexDirection: "row", marginBottom: 6, alignItems: "flex-end", gap: 8 },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  msgAvatarText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  msgAvatarSpacer: { width: 28 },
  msgBubbleWrapper: { maxWidth: "75%" },
  bubble: { borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: "#1E1A3A",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  bubbleTextMe: { color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTextOther: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  msgTime: { color: "#64748B", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3 },
  msgTimeMe: { textAlign: "right" },
  inputBar: {
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: "#0D0B1E",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  inputWrap: {
    flexDirection: "row", alignItems: "flex-end",
    backgroundColor: "#1E1A3A", borderRadius: 24,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8,
  },
  input: {
    flex: 1, color: "#FFFFFF",
    fontSize: 15, fontFamily: "Inter_400Regular",
    paddingVertical: 8, maxHeight: 100,
  },
  sendWrapper: { borderRadius: 20, overflow: "hidden" },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
});
