import { Platform } from "react-native";
import Constants from "expo-constants";

/** API host or full base URL (no trailing slash). */
const LOCAL_DEV_IP = "http://192.168.1.10:8000";
const API_PORT = 8000;

function isFullUrl(value) {
  return /^https?:\/\//i.test(value);
}

function resolveDevApiHost() {
  if (Platform.OS === "android") {
    return Constants.isDevice ? LOCAL_DEV_IP : LOCAL_DEV_IP;
  }

  if (Platform.OS === "ios") {
    return Constants.isDevice ? LOCAL_DEV_IP : LOCAL_DEV_IP;
  }

  return LOCAL_DEV_IP;
}

function buildDefaultApiBaseUrl() {
  const host = resolveDevApiHost();

  if (isFullUrl(host)) {
    return host.replace(/\/$/, "");
  }

  return `http://${host}:${API_PORT}`;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? buildDefaultApiBaseUrl();

/** Client-side notification flags — mirror API env when providers are wired. */
export const FEATURE_FLAGS = {
  enableSms: process.env.EXPO_PUBLIC_ENABLE_SMS === "true",
  enableWhatsapp: process.env.EXPO_PUBLIC_ENABLE_WHATSAPP === "true",
  enablePush: process.env.EXPO_PUBLIC_ENABLE_PUSH === "true",
  otpTestMode: process.env.EXPO_PUBLIC_OTP_TEST_MODE !== "false",
};

if (__DEV__) {
  console.log("AllSplit API URL:", API_BASE_URL);
}
