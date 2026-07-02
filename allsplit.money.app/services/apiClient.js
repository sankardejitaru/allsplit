import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/config";

const ACCESS_TOKEN_KEY = "AccessToken";
const USER_MOBILE_KEY = "UserMobile";

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function logNetworkError(method, url, err) {
  console.log("AllSplit API Log:", {
    method,
    url,
    error: err?.message ?? String(err),
    hint:
      "Check API is running and EXPO_PUBLIC_API_URL / LOCAL_DEV_IP in constants/config.js",
  });
}

async function buildHeaders(extraHeaders = {}) {
  const [token, mobile] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(USER_MOBILE_KEY),
  ]);
  return {
    "Content-Type": "application/json",
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(mobile ? { "x-user-mobile": mobile } : {}),
  };
}

export async function apiPost(path, body, options = {}) {
  const url = buildUrl(path);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: await buildHeaders(options.headers),
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    logNetworkError("POST", url, err);
    return { message: err?.message ?? "Request failed", success: false };
  }
}

export async function apiMultipart(path, formData, options = {}) {
  const url = buildUrl(path);
  const [token, mobile] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(USER_MOBILE_KEY),
  ]);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(mobile ? { "x-user-mobile": mobile } : {}),
        ...options.headers,
      },
      body: formData,
    });

    const raw = await res.text();
    let data = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw.slice(0, 200) };
      }
    }

    if (!res.ok) {
      return {
        success: false,
        message: data.message || data.detail || `HTTP ${res.status}`,
        status: res.status,
      };
    }

    return data;
  } catch (err) {
    logNetworkError("POST", url, err);
    return { message: err?.message ?? "Request failed", success: false };
  }
}

export async function apiGet(path, body) {
  const url = buildUrl(path);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    logNetworkError("GET", url, err);
    return { message: err?.message ?? "Request failed", success: false };
  }
}
