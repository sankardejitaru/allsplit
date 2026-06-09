import React, { useState } from "react";
import {
  ScrollView,
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
import { pinStyles as styles, theme } from "../styles";
import { Card } from 'react-native-paper';
import { showToast } from '../utils/toastService'; // your reusable toast function
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PinLoginScreen({ navigation }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = [];
  
  const handleChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    // Auto-focus next input if a digit is entered
    if (text && index < 3) {
      const nextInput = inputs[index + 1];
      nextInput?.focus();
    }
  };
  const handleLogin = async () => {    
    
    const dearraypin = pin.join(""); 
    if (dearraypin.length !== 4) {
      return;
    }
     
    try {
      setLoading(true);

      const payload = {
        device_id: await DeviceInfo.getUniqueId(),
        pin: dearraypin,
      };

      const res = await loginWithPin(payload);
      
      //return;
      if (res?.success) {
        await AsyncStorage.setItem('LoginId', res.LoginId);
        navigation.replace("MyOwe");
      } else {
        setPin(["", "", "", ""]);
        showToast('danger', 'WARNING!', 'Invalid PIN');
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
    <Card style={styles.card}>
      
      <Text style={styles.subtitle}>Login with mPIN</Text>

      <View style={styles.pinContainer}>
      {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs[index] = ref)}
                style={styles.pinBox}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onBlur={handleLogin}
              />
            ))}
      </View>
      

      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        style={styles.forgot}
      >
        <Text style={styles.forgotText}>Forgot PIN?</Text>
      </TouchableOpacity>
      
    </Card>
    <Card style={[styles.card,{marginTop: 20,height: 425}]}>
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
  );
}