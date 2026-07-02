import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import AuthShell from "../../Components/auth/AuthShell";
import { createAuthStyles, createOtpScreenStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { sendOtp, verifyOtp } from "../../services/authService";
import { showToast } from "../../utils/toastService";
import { setUserMobile } from "../../utils/userIdentity";
import { FEATURE_FLAGS } from "../../constants/config";

const RESEND_SECONDS = 30;

export default function OtpScreen({ route, navigation }) {
  const styles = useThemedStyles(createAuthStyles);
  const localStyles = useThemedStyles(createOtpScreenStyles);
  const { colors } = useAppTheme();
  const {
    mobile,
    displayMobile,
    channel = "sms",
    devOtpHint,
    testMode,
  } = route?.params || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (mobile) {
      setUserMobile(mobile);
    }
  }, [mobile]);

  useEffect(() => {
    if (resendIn <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendIn]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast("danger", "Invalid OTP", "Enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const device_Id = await DeviceInfo.getUniqueId();
      const res = await verifyOtp({ mobile, otp, device_Id });

      if (!res.success) {
        showToast("danger", "Verification failed", res.message || "Invalid OTP");
        return;
      }

      await setUserMobile(mobile);
      showToast("info", "Verified", "Mobile number confirmed");

      if (res.has_pin) {
        navigation.replace("PinLogin");
        return;
      }

      navigation.replace("SetPin", { fromRegistration: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) {
      return;
    }

    const res = await sendOtp(mobile, channel);
    if (res.success) {
      setResendIn(RESEND_SECONDS);
      showToast("info", "OTP resent", "A new code has been sent");
    } else {
      showToast("danger", "Could not resend", res.message || "Try again");
    }
  };

  return (
    <AuthShell
      title="Verify OTP"
      subtitle={`Enter the 6-digit code sent to ${displayMobile || mobile} via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}.`}
    >
      <TextInput
        style={styles.otpinput}
        placeholder="• • • • • •"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
      />

      {(testMode || FEATURE_FLAGS.otpTestMode) && devOtpHint ? (
        <View style={localStyles.devHint}>
          <Text style={localStyles.devHintText}>
            Dev mode: use OTP {devOtpHint}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={localStyles.resendBtn}
        onPress={handleResend}
        disabled={resendIn > 0}
      >
        <Text style={[localStyles.resendText, resendIn > 0 && { opacity: 0.5 }]}>
          {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
