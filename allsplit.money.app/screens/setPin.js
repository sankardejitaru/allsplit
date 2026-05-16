import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { SetMyPin } from "../controllers/authController";
import styles from "../styles/pinStyles";

export default function SetPinScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      Alert.alert("Invalid PIN", "Enter 4-digit PIN");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PINs do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: pin,
      };

      const res = await SetMyPin(payload);

      if (res?.success) {
        navigation.replace("PinLogin");
      } else {
        Alert.alert("Error", "Failed to set PIN");
      }
    } catch (error) {
      Alert.alert("Failed to set PIN", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <View style={styles.container}>
    <Image
      source={require("../assets/logo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
      <Text style={styles.title}>Set PIN</Text>
      <Text style={styles.subtitle}>Create a new PIN for your account</Text>

      <TextInput
        style={styles.pinInput}
        keyboardType="number-pad"
        placeholder="Set"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <TextInput
        style={styles.pinInput}
        keyboardType="number-pad"
        placeholder="Confirm"
        secureTextEntry
        maxLength={4} 
        value={confirmPin}
        onChangeText={setConfirmPin}
      />

      <TouchableOpacity
        style={[
          styles.button,
          pin.length !== 4 && { opacity: 0.5 },
        ]}
        disabled={pin.length !== 4 || loading}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Set PIN"}
        </Text>
      </TouchableOpacity>
 
    </View>
  );
}