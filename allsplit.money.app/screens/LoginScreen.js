import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { authStyles as styles, theme } from "../styles";
import { sendOtp } from "../controllers/authController";
import { showToast } from '../utils/toastService'; // your reusable toast function
import { Card } from 'react-native-paper';


export default function LoginScreen({ navigation }) {
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      showToast("danger", "Error", "Enter valid mobile number");
      return;
    }
    
    
    const mobileWithCountryCode = String(countryCode).replace(/\+/g, "") + mobile;
    
    const res = await sendOtp(mobileWithCountryCode);
    if (res.success) {
      showToast("info", "Success", "OTP sent successfully");
      navigation.navigate("Otp", {  mobile: mobileWithCountryCode });
    } else {
      console.log("AllSplit Error:", res);
      alert(res.message || "Failed to send OTP");
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
      
      <Text style={styles.title}>Register</Text>
      <View style={styles.inputContainer}>
      <TextInput
        style={styles.countryCode}
        placeholder="+XX"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        maxLength={4}
        value={countryCode}
        onChangeText={setCountryCode}
      />
    <TextInput
      style={styles.input}
      placeholder="Enter your mobile number"
      placeholderTextColor={theme.colors.textMuted}
      keyboardType="numeric"
      maxLength={12}
      value={mobile}
      onChangeText={setMobile}
    />
    </View>

    <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
      <Text style={styles.buttonText}>Send OTP</Text>
    </TouchableOpacity>
    </Card>
    <Card style={[styles.card,{marginTop: 20,height: 350}]}>
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