import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,Image  } from "react-native";
import styles from "../styles/authStyles";
import { sendOtp } from "../controllers/authController";

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState("");

  const handleSendOtp = async () => {
    if (mobile.length !== 12) {
      alert("Enter valid 12 digit mobile number");
      return;
    }

    const res = await sendOtp(mobile);
    if (res.success) {
      navigation.navigate("Otp", { mobile });
    } else {
      console.log("AllSplit Error:", res);
      alert(res.message || "Failed to send OTP");
    }
  };

  return (
  <View style={styles.container}>
    <Image
      source={require("../assets/logo.png")}
      style={styles.logo}
      resizeMode="contain"
    />

    <TextInput
      style={styles.input}
      placeholder="Enter your mobile number"
      keyboardType="numeric"
      maxLength={12}
      value={mobile}
      onChangeText={setMobile}
    />

    <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
      <Text style={styles.buttonText}>Send OTP</Text>
    </TouchableOpacity>
  </View>
);
}