import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/homeStyles";
import DeviceInfo from "react-native-device-info";

import { SafeAreaView } from "react-native-safe-area-context";
import { checkdevice } from "../controllers/authController";

export default function HomeScreen() { 
  const navigation = useNavigation();

   useEffect(() => {
  const checkDeviceStatus = async () => {
    const device_id = await  DeviceInfo.getUniqueId();

    const payload  = {
      device_id: device_id,
    }; 

    /* ========= call check device function from authController ========= */
    const data = await checkdevice(payload);
    console.log("AllSplit API Log:", data);
    // example navigation logic
    if (data?.registered) {
        if (data?.has_pin) {
        navigation.replace("PinLogin");
      } else {
        navigation.replace("SetPin");
      }    
    } else {
      navigation.replace("Login");
    }
  };

  checkDeviceStatus();
}, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#green" }}>
    <ImageBackground
      source={require("../assets/splash-bg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
       
      {/* Overlay for readability */}
      <View style={styles.overlay}>
       
        <Text style={styles.tagline}>
          Split bills. Settle easy.
        </Text>

        
      </View>
    </ImageBackground>
    </SafeAreaView>
  );
}