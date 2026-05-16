import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import styles from "../styles/authStyles";
import { verifyOtp } from "../controllers/authController";

import DeviceInfo from "react-native-device-info";

export default function OtpScreen({ route, navigation }) {
  const { mobile } = route.params;
  const [otp, setOtp] = useState("");
   

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert("Enter 6 digit OTP");
      return;
    }
    const device_Id = await DeviceInfo.getUniqueId();

    const payload  = {
      mobile,
      otp,
      device_Id: device_Id,
    }; 
    const res = await verifyOtp(payload);
    if (res.success) {
      navigation.replace("MyOwe");
    } else {
      alert(res.message || "Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to +91 {mobile}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}