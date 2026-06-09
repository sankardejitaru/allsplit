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
import { pinStyles as styles, theme } from "../styles";
import { showToast } from "../utils/toastService";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetPinScreen({ navigation }) {
  
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = [];
  const confirminputs = [];

  const handleChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    
    // Auto-focus next input if a digit is entered
    if (text && index < 4) {
      const nextInput = inputs[index + 1];
      nextInput?.focus();
    }
  };

  const handleConfirmChange = (text, index) => {
    const confirmnewPin = [...confirmPin];
    confirmnewPin[index] = text;
    setConfirmPin(confirmnewPin);
    
    // Auto-focus next input if a digit is entered
    
    if (text && index < 3) {
      const nextInput = confirminputs[index + 1];
      nextInput?.focus();
    }
  };
  const handleLogin = async () => {
    const dearraypin = pin.join("");
    const dearrayconfirmpin = confirmPin.join(""); 
    if (dearraypin.length !== 4) {
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      showToast("danger", "Error", "Invalid PIN");
      return;
    }

    if (dearraypin !== dearrayconfirmpin) {      
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      showToast("danger", "Error", "PINs do not match");
      return;
    }
    
    
    try {
      setLoading(true);

      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: dearraypin,
      };

      const res = await SetMyPin(payload);

      if (res?.success) {
        showToast("info", "Success", "PIN set successfully");
        navigation.replace("PinLogin");
      } else {
        showToast("danger", "Error", "Failed to set PIN");
      }
    } catch (error) {
      showToast("danger", "Error", "Failed to set PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <View>
    <Image
      source={require("../assets/logo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
    <Card style={styles.card}>
      <Text style={styles.title}>Set PIN</Text>
      <Text style={styles.subtitle}>Create a new PIN for your account</Text>
      
      <View style={styles.pinContainer}>
      {pin.map((digit, index) => (
      <TextInput
        key={index}
        ref={(ref) => (inputs[index] = ref)}
        style={styles.pinBox}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={1}
        value={pin[index]}
        onChangeText={(text) => handleChange(text, index)}
      />
    ))}
    </View>
    <View style={styles.pinContainer}>
{confirmPin.map((digit, index) => (
      <TextInput
        key={index}
        ref={(ref) => (confirminputs[index] = ref)}
        style={styles.pinBox}        
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={1} 
        value={confirmPin[index]}
        onChangeText={(text) => handleConfirmChange(text, index)}
      />
    ))}
    </View>

      <TouchableOpacity
        style={[
          styles.button,
          pin.length !== 4 && { opacity: 0.5 },
        ]}
        disabled={pin.length !== 4 || loading}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          {loading ? "Set PIN" : "Set PIN"}
        </Text>
      </TouchableOpacity>
 </Card>
    </View>
    </SafeAreaView>
  );
}