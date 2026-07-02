import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import PinLoginScreen from "../screens/auth/PinLoginScreen";
import SetPinScreen from "../screens/auth/SetPinScreen";
import HomeScreen from "../screens/home/HomeScreen";
import BillScanScreen from "../screens/bills/BillScanScreen";
import BillScannerScreen from "../screens/bills/BillScannerScreen";
import BillDetailsScreen from "../screens/bills/BillDetailsScreen";
import SelectPeopleScreen from "../screens/bills/SelectPeopleScreen";
import SettleBillScreen from "../screens/bills/SettleBillScreen";
import CreatedSplitsScreen from "../screens/splits/CreatedSplitsScreen";
import ManageSettlementScreen from "../screens/splits/ManageSettlementScreen";
import MyOweScreen from "../screens/splits/MyOweScreen";
import ViewMyOweScreen from "../screens/splits/ViewMyOweScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />

      <Stack.Screen name="Scanner" component={BillScannerScreen} />
      <Stack.Screen name="Details" component={BillDetailsScreen} />
      <Stack.Screen name="People" component={SelectPeopleScreen} />
      <Stack.Screen name="SettleBill" component={SettleBillScreen} />

      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="PinLogin" component={PinLoginScreen} />

      <Stack.Screen name="BillScan" component={BillScanScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MyOwe" component={MyOweScreen} />
      <Stack.Screen name="CreatedSplits" component={CreatedSplitsScreen} />
      <Stack.Screen name="ManageSettlement" component={ManageSettlementScreen} />
      <Stack.Screen name="ViewMyOwe" component={ViewMyOweScreen} />
    </Stack.Navigator>
  );
}
