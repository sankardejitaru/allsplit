import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthShell from "../../Components/auth/AuthShell";
import { createAuthStyles, createLoginScreenStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { sendOtp } from "../../services/authService";
import { showToast } from "../../utils/toastService";
import { setUserMobile } from "../../utils/userIdentity";
import {
  buildFullMobile,
  digitsOnly,
  formatMobileDisplay,
} from "../../utils/phoneUtils";

const COUNTRY_CODE = "+91";

export default function LoginScreen({ navigation }) {
  const styles = useThemedStyles(createAuthStyles);
  const localStyles = useThemedStyles(createLoginScreenStyles);
  const { colors } = useAppTheme();
  const [mobile, setMobile] = useState("");
  const [channel, setChannel] = useState("sms");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const localDigits = digitsOnly(mobile);
    if (localDigits.length !== 10) {
      showToast("danger", "Invalid number", "Enter a valid 10-digit mobile number");
      return;
    }

    const fullMobile = buildFullMobile(COUNTRY_CODE, localDigits);

    try {
      setLoading(true);
      const res = await sendOtp(fullMobile, channel);

      if (!res.success) {
        showToast("danger", "Could not send OTP", res.message || "Try again");
        return;
      }

      await setUserMobile(fullMobile);
      showToast(
        "info",
        "OTP sent",
        channel === "whatsapp"
          ? "Check WhatsApp for your code"
          : "Check SMS for your code"
      );

      navigation.navigate("Otp", {
        mobile: fullMobile,
        displayMobile: formatMobileDisplay(fullMobile),
        channel,
        devOtpHint: res.dev_otp_hint,
        testMode: res.test_mode,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register with your mobile number. We will send a one-time code to verify you."
      footer={
        <Text style={localStyles.footerText}>
          Already registered on this device? Close and reopen the app to use PIN login.
        </Text>
      }
    >
      <Text style={localStyles.label}>Mobile number</Text>
      <View style={localStyles.phoneRow}>
        <View style={localStyles.prefixBox}>
          <Text style={localStyles.prefixText}>{COUNTRY_CODE}</Text>
        </View>
        <TextInput
          style={localStyles.phoneInput}
          placeholder="10-digit mobile number"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={(value) => setMobile(digitsOnly(value))}
        />
      </View>

      <Text style={localStyles.label}>Send OTP via</Text>
      <View style={localStyles.channelRow}>
        {["sms", "whatsapp"].map((option) => {
          const active = channel === option;
          return (
            <TouchableOpacity
              key={option}
              style={[localStyles.channelBtn, active && localStyles.channelBtnActive]}
              onPress={() => setChannel(option)}
            >
              <Text
                style={[
                  localStyles.channelText,
                  active && localStyles.channelTextActive,
                ]}
              >
                {option === "sms" ? "SMS" : "WhatsApp"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSendOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
