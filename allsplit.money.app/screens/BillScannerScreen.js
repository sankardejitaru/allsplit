import React,{ useEffect, useRef }  from "react";
import { View, Text, StyleSheet,Image,Animated, TouchableOpacity } from "react-native";

export default function BillScannerScreen({ photo,navigation }) {
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
        inputRange: [0, 4],
        outputRange: [0, 1000],
      });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill scanner</Text>

       <View style={styles.scannerBox}>
  {/* Bill Image (background) */}
  {photo && (
    <Image
      source={{ uri: photo }}
      style={styles.preview}
    />
  )}

  {/* Animated Scan Line (ON TOP of image) */}
  <Animated.View
    style={[
      styles.scanLine,
      { transform: [{ translateY }] },
    ]}
  />

  {/* Corner Borders (TOP layer) */}
  <View style={styles.cornerTL} />
  <View style={styles.cornerTR} />
  <View style={styles.cornerBL} />
  <View style={styles.cornerBR} />
</View>

      
    </View>
  );
}

const boxSize = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
  },
 
  scanText: {
    marginTop: 12,
    color: "#888",
  },
  
  cornerTL: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#1A9B4B",
  },
  cornerTR: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#1A9B4B",
  },
  cornerBL: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#1A9B4B",
  },
  cornerBR: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#1A9B4B",
  },

  manualBtn: {
    marginTop: 40,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
  },
  manualText: {
    textAlign: "center",
    color: "#1A9B4B",
    fontWeight: "500",
  },
  scannerBox: {
  height: boxSize,
  width: boxSize,
  backgroundColor: "#fff",
  borderRadius: 16,
  alignSelf: "center",
  overflow: "hidden", // 🔥 clips scan line
},

preview: {
  marginTop: 12, // adjust as needed to center the bill
  marginLeft: 12,
  width: "90%",
  height: "90%",
  resizeMode: "cover",
},

scanLine: {
  position: "absolute",
  top: 0,
  width: "90%",
  height: 3,
  backgroundColor: "#1A9B4B",
  alignSelf: "center",
  opacity: 0.9,
  zIndex: 2,
},
});