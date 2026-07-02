import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { toastConfig } from "./utils/toastService";
import { LogBox } from "react-native";
import { ThemeProvider, useAppTheme } from "./context/ThemeContext";

LogBox.ignoreAllLogs(true);

function AppNavigation() {
  const { navigationTheme, colors, ready } = useAppTheme();

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.brandBackground }} />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigation />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
