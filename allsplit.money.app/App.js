import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./screens/AppNavigator";
import Toast from "react-native-toast-message"; // default import
import { toastConfig } from './utils/toastService';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(true);

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
      <Toast config={toastConfig} /> {/* Mounted once at root */}
    </NavigationContainer>
  );
}