import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost } from "./apiClient";

const ACCESS_TOKEN_KEY = "AccessToken";

export const storeAccessToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const getAccessToken = async () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

export const sendOtp = async (mobile, channel = "sms") => {
  try {
    const res = await apiPost("/send-otp", { mobile, channel });
    return res;
  } catch (err) {
    return { message: err, success: false };
  }
};

export const verifyOtp = async (jsonData) => {
  const res = await apiPost("/verify-otp", jsonData);
  if (res.success === false && !res.message) {
    return { message: "Failed to verify OTP - Invalid OTP", success: false };
  }
  if (res.access_token) {
    await storeAccessToken(res.access_token);
  }
  return res;
};

export const checkdevice = async (formData) => {
  const data = await apiPost("/auth/check-device", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to check device", success: false };
  }
  return data;
};

export const loginWithPin = async (formData) => {
  const data = await apiPost("/auth/login-pin", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to check PIN", success: false };
  }
  if (data.access_token) {
    await storeAccessToken(data.access_token);
  }
  return data;
};

export const SetMyPin = async (formData) => {
  const data = await apiPost("/auth/set-pin", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to set PIN", success: false };
  }
  return data;
};
