import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  ActivityIndicator,
  Dimensions,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBillScannerStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FRAME_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const FRAME_HEIGHT = FRAME_WIDTH * 1.35;

const SCAN_STEPS = [
  "Analyzing bill layout",
  "Reading line items",
  "Detecting prices",
  "Preparing your split",
];

function CornerBracket({ cornerStyle, style }) {
  return <View style={[cornerStyle, style]} />;
}

export default function BillScannerScreen({ photo, embedded = false }) {
  const styles = useThemedStyles(createBillScannerStyles);
  const { colors } = useAppTheme();
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    scanLoop.start();
    pulseLoop.start();

    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, [scanAnim, pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % SCAN_STEPS.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, FRAME_HEIGHT - 20],
  });

  const cornerOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const hasPhoto = photo && photo !== "NA";

  const content = (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
        </View>
        <Text style={styles.title}>Processing your bill</Text>
        <Text style={styles.subtitle}>
          Extracting items and amounts automatically
        </Text>
      </View>

      <View style={styles.frameOuter}>
        <View style={styles.frameShadow} />
        <View style={[styles.scannerFrame, { width: FRAME_WIDTH, height: FRAME_HEIGHT }]}>
          {hasPhoto ? (
            <Image source={{ uri: photo }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="receipt-outline" size={48} color={colors.border} />
            </View>
          )}

          <View style={styles.overlayTop} />
          <View style={styles.overlayBottom} />

          <Animated.View
            style={[styles.scanBeam, { opacity: glowOpacity }]}
          />

          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY }] },
            ]}
          />

          <Animated.View style={[styles.corners, { opacity: cornerOpacity }]}>
            <CornerBracket cornerStyle={styles.corner} style={styles.cornerTL} />
            <CornerBracket cornerStyle={styles.corner} style={styles.cornerTR} />
            <CornerBracket cornerStyle={styles.corner} style={styles.cornerBL} />
            <CornerBracket cornerStyle={styles.corner} style={styles.cornerBR} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>{SCAN_STEPS[stepIndex]}…</Text>
        </View>

        <View style={styles.stepDots}>
          {SCAN_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === stepIndex && styles.stepDotActive,
                index < stepIndex && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        <Text style={styles.hintText}>This usually takes a few seconds</Text>
      </View>
    </Animated.View>
  );

  if (embedded) {
    return content;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {content}
    </SafeAreaView>
  );
}
