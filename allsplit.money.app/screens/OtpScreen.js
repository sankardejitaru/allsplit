import React, { useState } from "react";
import { View, Text,Image, TextInput, TouchableOpacity,ScrollView,SafeAreaView } from "react-native";
import { authStyles as styles, theme } from "../styles";
import { verifyOtp } from "../controllers/authController";
import { Card } from 'react-native-paper';
import { showToast } from '../utils/toastService';

import DeviceInfo from "react-native-device-info";

export default function OtpScreen({ route, navigation }) {
  const { mobile } = route?.params || '';
  const [otp, setOtp] = useState("");
   

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast("danger", "Error", "Enter valid OTP");
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
      showToast("info", "Success", "OTP verified successfully");
      navigation.replace("SetPin");
    } else {
      showToast("danger", "Error", "Invalid OTP");
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
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to + {mobile}</Text>

      <TextInput
        style={styles.otpinput}
        placeholder="Enter OTP"
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
      </Card>
      <Card style={[styles.card,{marginTop: 20,height: 325}]}>
                <View>
                  
              <ScrollView>
                <Text style={styles.scrolltext}>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                  when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                  It has survived not only five centuries, but also the leap into electronic typesetting, 
                  remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets 
                  containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker 
                  including versions of Lorem Ipsum.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                  when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                  It has survived not only five centuries, but also the leap into electronic typesetting, 
                  remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets 
                  containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker 
                  including versions of Lorem Ipsum.
                </Text>
              </ScrollView>
                </View>
              </Card>
    </View>
    </SafeAreaView>
  );
}