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
import { loginWithPin } from "../controllers/authController";
import styles from "../styles/pinStyles";

export default function PinLoginScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      Alert.alert("Invalid PIN", "Enter 4-digit PIN");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: pin,
      };

      const res = await loginWithPin(payload);

      if (res?.success) {
        navigation.replace("MyOwe");
      } else {
        Alert.alert("Error", "Invalid PIN");
      }
    } catch (error) {
      Alert.alert("Login failed", "Please try again");
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
      <Text style={styles.title}>Enter PIN</Text>
      <Text style={styles.subtitle}>Unlock your account</Text>

      <TextInput
        style={styles.pinInput}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
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
          {loading ? "Verifying..." : "Unlock"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        style={styles.forgot}
      >
        <Text style={styles.forgotText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </View>
  );
}