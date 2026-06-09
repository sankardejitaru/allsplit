import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import OtpScreen from "./OtpScreen";
import BillScanScreen from "./BillScanScreen";
import BillinitScreen from "./BillinitScreen";
import PinLoginScreen from "./pinLogin";
import SetPinScreen from "./setPin";
import HomeScreen from "./HomeScreen";
import { View, Text } from "react-native";
import ViewMyOweScreen from "./ViewMyOweScreen";
import MyOweScreen from "./MyOweScreen";
import PocScreen from "./pocscreen1";
import BillScannerScreen from "./BillScannerScreen";
import BillDetailsScreen from "./BillDetailsScreen";
import SelectPeopleScreen from "./SelectPeopleScreen";
import SettleBillScreen from "./SettleBillScreen";

const Stack = createNativeStackNavigator();

 

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* <Stack.Screen name="Poc1" component={PocScreen} /> */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} /> 
      
      <Stack.Screen name="Scanner" component={BillScannerScreen} />
      <Stack.Screen name="Details" component={BillDetailsScreen} />
      <Stack.Screen name="People" component={SelectPeopleScreen} />
      <Stack.Screen name="SettleBill" component={SettleBillScreen} />

      {/* <Stack.Screen name="Poc" component={PocScreen} /> */}
      
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="PinLogin" component={PinLoginScreen} />
      
      <Stack.Screen name="BillInit" component={BillinitScreen} />
      <Stack.Screen name="BillScan" component={BillScanScreen} />
      <Stack.Screen name="MyOwe" component={MyOweScreen} />
      <Stack.Screen name="ViewMyOwe" component={ViewMyOweScreen} />

    </Stack.Navigator>
  );
}