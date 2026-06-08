import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { TrackingStep } from "@/context/AppContext";

export default function StatusTimeline({
  steps,
}: {
  steps: TrackingStep[];
}) {
  return (
    <View>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const isActive =
          step.completed && (isLast || !steps[i + 1]?.completed);

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.leftCol}>
              {step.completed ? (
                <LinearGradient
                  colors={
                    isActive
                      ? ["#F97316", "#3B82F6"]
                      : ["#10B981", "#059669"]
                  }
                  style={styles.dotFilled}
                >
                  <Feather name="check" size={10} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.dotEmpty} />
              )}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    step.completed && styles.lineActive,
                  ]}
                />
              )}
            </View>

            <View style={[styles.content, !isLast && { paddingBottom: 20 }]}>
              <Text
                style={[
                  styles.stepTitle,
                  !step.completed && styles.stepTitleMuted,
                ]}
              >
                {step.title}
              </Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
              <Text style={styles.stepTime}>{step.timestamp}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  leftCol: { width: 28, alignItems: "center" },
  dotFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 2,
    minHeight: 20,
  },
  lineActive: { backgroundColor: "rgba(249,115,22,0.35)" },
  content: { flex: 1, paddingLeft: 12 },
  stepTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  stepTitleMuted: { color: "#64748B" },
  stepDesc: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  stepTime: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
