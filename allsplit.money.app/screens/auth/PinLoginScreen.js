import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import Ionicons from "react-native-vector-icons/Ionicons";
import AuthShell from "../../Components/auth/AuthShell";
import { loginWithPin } from "../../services/authService";
import { createPinStyles, createPinLoginScreenStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/toastService";
import {
  authenticateWithBiometric,
  getBiometricPreference,
  isBiometricAvailable,
} from "../../utils/biometricAuth";

export default function PinLoginScreen({ navigation }) {
  const styles = useThemedStyles(createPinStyles);
  const localStyles = useThemedStyles(createPinLoginScreenStyles);
  const { colors } = useAppTheme();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [biometricReady, setBiometricReady] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const inputs = [];

  useEffect(() => {
    Promise.all([isBiometricAvailable(), getBiometricPreference()]).then(
      ([available, enabled]) => {
        setBiometricReady(available);
        setBiometricEnabled(enabled);
      }
    );
  }, []);

  const submitPin = async (pinValue) => {
    if (pinValue.length !== 4 || loading) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: pinValue,
      };

      const res = await loginWithPin(payload);

      if (res?.success) {
        await AsyncStorage.setItem("LoginId", res.LoginId);
        navigation.replace("Dashboard");
        return;
      }

      setPin(["", "", "", ""]);
      showToast("danger", "Invalid PIN", "Please try again");
    } catch (error) {
      showToast("danger", "Login failed", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text, index) => {
    const next = [...pin];
    next[index] = text.replace(/\D/g, "").slice(-1);
    setPin(next);

    if (text && index < 3) {
      inputs[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === 4) {
      submitPin(joined);
    }
  };

  const handleBiometricLogin = async () => {
    const result = await authenticateWithBiometric();
    if (!result.success) {
      if (result.reason !== "cancelled") {
        showToast("info", "Biometric unavailable", "Use your 4-digit PIN instead");
      }
      return;
    }

    await submitPin(result.pin);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter your 4-digit PIN to continue."
      footer={
        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={localStyles.forgotText}>Forgot PIN? Register again</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs[index] = ref;
            }}
            style={styles.pinBox}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      {biometricReady && biometricEnabled ? (
        <TouchableOpacity
          style={localStyles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Ionicons name="finger-print-outline" size={22} color={colors.primary} />
          <Text style={localStyles.biometricButtonText}>Use device unlock</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={() => submitPin(pin.join(""))}
        disabled={loading || pin.join("").length !== 4}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Sign in"}
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
