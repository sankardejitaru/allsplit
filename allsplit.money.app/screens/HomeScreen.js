import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { homeStyles as styles } from "../styles";
import DeviceInfo from "react-native-device-info";

import { SafeAreaView } from "react-native-safe-area-context";
import { checkdevice } from "../controllers/authController";
import {launchImageLibrary} from 'react-native-image-picker';

export default function HomeScreen() { 
  const navigation = useNavigation();

  const requestPermissions = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const contactPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts Permission",
          message: "This app needs access to your contacts to split bills.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );

      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs camera access to scan bills.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );

      const grantedContacts = contactPermission === PermissionsAndroid.RESULTS.GRANTED;
      const grantedCamera = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;

      if (!grantedContacts || !grantedCamera) {
        Alert.alert(
          "Permissions Required",
          "Contacts and camera permissions are required to continue. Please grant the permissions in settings.",
          [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.log("Permission error:", err);
      return false;
    }
  };

   useEffect(() => {
  const checkDeviceStatus = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      return;
    }

    const device_id = await  DeviceInfo.getUniqueId();

    const payload  = {
      device_id: device_id,
    }; 

    /* ========= call check device function from authController ========= */
    const data = await checkdevice(payload); 
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