import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import AuthShell from "../../Components/auth/AuthShell";
import { loginWithPin, SetMyPin } from "../../services/authService";
import { ensureSelfSavedContact } from "../../services/contactService";
import { createPinStyles, createSetPinScreenStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/toastService";
import { getUserMobile } from "../../utils/userIdentity";
import {
  isBiometricAvailable,
  setBiometricPreference,
  storePinForBiometric,
} from "../../utils/biometricAuth";

export default function SetPinScreen({ navigation, route }) {
  const styles = useThemedStyles(createPinStyles);
  const localStyles = useThemedStyles(createSetPinScreenStyles);
  const { colors } = useAppTheme();
  const fromRegistration = route?.params?.fromRegistration;
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const [biometricReady, setBiometricReady] = useState(false);
  const inputs = [];
  const confirmInputs = [];

  useEffect(() => {
    isBiometricAvailable().then(setBiometricReady);
  }, []);

  const handleChange = (text, index, setter, current, fieldInputs, maxIndex) => {
    const next = [...current];
    next[index] = text.replace(/\D/g, "").slice(-1);
    setter(next);

    if (text && index < maxIndex) {
      fieldInputs[index + 1]?.focus();
    }
  };

  const pinComplete = pin.join("").length === 4 && confirmPin.join("").length === 4;

  const handleSetPin = async () => {
    const pinValue = pin.join("");
    const confirmValue = confirmPin.join("");

    if (pinValue.length !== 4) {
      showToast("danger", "Invalid PIN", "Enter a 4-digit PIN");
      return;
    }

    if (pinValue !== confirmValue) {
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      showToast("danger", "PIN mismatch", "Both PIN entries must match");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: pinValue,
      };

      const res = await SetMyPin(payload);
      if (!res?.success) {
        showToast("danger", "Could not save PIN", res.message || "Try again");
        return;
      }

      if (useBiometric && biometricReady) {
        await storePinForBiometric(pinValue);
        await setBiometricPreference(true);
      } else {
        await setBiometricPreference(false);
      }

      const loginRes = await loginWithPin(payload);
      if (loginRes?.LoginId) {
        await AsyncStorage.setItem("LoginId", loginRes.LoginId);
      }

      if (fromRegistration) {
        const mobile = await getUserMobile();
        await ensureSelfSavedContact(mobile);
      }

      showToast("info", "PIN saved", "Your account is secured");
      navigation.replace("Dashboard");
    } catch (error) {
      showToast("danger", "Could not save PIN", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Secure your account"
      subtitle="Create a 4-digit PIN for quick login on this device."
    >
      <Text style={localStyles.sectionLabel}>Enter PIN</Text>
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={`pin-${index}`}
            ref={(ref) => {
              inputs[index] = ref;
            }}
            style={styles.pinBox}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={1}
            value={digit}
            onChangeText={(text) =>
              handleChange(text, index, setPin, pin, inputs, 3)
            }
          />
        ))}
      </View>

      <Text style={localStyles.sectionLabel}>Confirm PIN</Text>
      <View style={styles.pinContainer}>
        {confirmPin.map((digit, index) => (
          <TextInput
            key={`confirm-${index}`}
            ref={(ref) => {
              confirmInputs[index] = ref;
            }}
            style={styles.pinBox}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={1}
            value={digit}
            onChangeText={(text) =>
              handleChange(text, index, setConfirmPin, confirmPin, confirmInputs, 3)
            }
          />
        ))}
      </View>

      {biometricReady ? (
        <View style={localStyles.biometricRow}>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.biometricTitle}>Use device unlock</Text>
            <Text style={localStyles.biometricHint}>
              Sign in faster with fingerprint or face ID
            </Text>
          </View>
          <Switch
            value={useBiometric}
            onValueChange={setUseBiometric}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={useBiometric ? colors.primary : colors.backgroundAlt}
          />
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, (!pinComplete || loading) && { opacity: 0.5 }]}
        disabled={!pinComplete || loading}
        onPress={handleSetPin}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save PIN"}
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
