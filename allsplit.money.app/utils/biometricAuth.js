import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_PREF_KEY = "UseBiometricLogin";
const SECURE_PIN_KEY = "BiometricPinVault";

function getLocalAuthModule() {
  try {
    return require("expo-local-authentication");
  } catch {
    return null;
  }
}

function getSecureStoreModule() {
  try {
    return require("expo-secure-store");
  } catch {
    return null;
  }
}

export async function isBiometricAvailable() {
  const LocalAuthentication = getLocalAuthModule();
  if (!LocalAuthentication) {
    return false;
  }

  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return hasHardware && isEnrolled;
}

export async function getBiometricPreference() {
  const value = await AsyncStorage.getItem(BIOMETRIC_PREF_KEY);
  return value === "true";
}

export async function setBiometricPreference(enabled) {
  await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, enabled ? "true" : "false");
  if (!enabled) {
    await clearStoredPin();
  }
}

export async function storePinForBiometric(pin) {
  const SecureStore = getSecureStoreModule();
  if (SecureStore?.setItemAsync) {
    await SecureStore.setItemAsync(SECURE_PIN_KEY, pin);
    return;
  }
  await AsyncStorage.setItem(SECURE_PIN_KEY, pin);
}

export async function clearStoredPin() {
  const SecureStore = getSecureStoreModule();
  if (SecureStore?.deleteItemAsync) {
    await SecureStore.deleteItemAsync(SECURE_PIN_KEY);
  }
  await AsyncStorage.removeItem(SECURE_PIN_KEY);
}

async function readStoredPin() {
  const SecureStore = getSecureStoreModule();
  if (SecureStore?.getItemAsync) {
    return SecureStore.getItemAsync(SECURE_PIN_KEY);
  }
  return AsyncStorage.getItem(SECURE_PIN_KEY);
}

export async function authenticateWithBiometric() {
  const LocalAuthentication = getLocalAuthModule();
  if (!LocalAuthentication) {
    return { success: false, reason: "unavailable" };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock AllSplit",
    cancelLabel: "Use PIN",
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return { success: false, reason: result.error || "cancelled" };
  }

  const pin = await readStoredPin();
  if (!pin) {
    return { success: false, reason: "no_pin_stored" };
  }

  return { success: true, pin };
}
