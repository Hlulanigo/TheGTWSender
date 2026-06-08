import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  gradientColors?: [string, string];
  small?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  style,
  textStyle,
  loading,
  disabled,
  gradientColors = ["#7C3AED", "#3B82F6"],
  small,
}: GradientButtonProps) {
  function handlePress() {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, small && styles.gradientSmall]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.text, small && styles.textSmall, textStyle]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 13,
  },
});
