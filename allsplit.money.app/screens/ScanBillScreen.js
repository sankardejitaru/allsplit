import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  Animated,
  StyleSheet, 
} from "react-native";

export default function ScanBillScreen({ photo }) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={styles.container}>

      {/* Border Wrapper */}
      <View style={styles.borderWrapper}>

        {/* Image + Scan */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: photo }} style={styles.preview} />

          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY }] },
            ]}
          />
        </View>

      </View>

      <Text style={styles.loaderText}>Scanning bill…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  /* OUTER BORDER */
  borderWrapper: {
    width: 270,
    height: 230,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1A9B4B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  /* CLIPPED CONTENT */
  imageWrapper: {
    width: 260,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  scanLine: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#1A9B4B",
    opacity: 0.85,
  },

  loaderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A9B4B",
  },
});