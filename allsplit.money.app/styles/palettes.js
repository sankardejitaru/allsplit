export const lightColors = {
  primary: "#1A9B4B",
  primaryDark: "#137A3A",
  success: "#4CAF50",
  lightGreen: "#E9F6EF",
  white: "#FFFFFF",
  text: "#1E1E1E",
  textMuted: "#6B7280",
  textDark: "#333333",
  muted: "#999999",
  border: "#D1D5DB",
  borderLight: "#EEEEEE",
  surface: "#FFFFFF",
  background: "#F5F7FA",
  backgroundAlt: "#F9F9F9",
  red: "#FF0000",
  danger: "#dc2626",
  dangerBorder: "#fecaca",
  statusBarStyle: "dark-content",
  statusBarBackground: "#F5F7FA",
  brandBackground: "#1A9B4B",
  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.45)",
  devHintBg: "#FFF8E1",
  devHintBorder: "#FFE082",
  devHintText: "#8D6E00",
};

export const darkColors = {
  primary: "#34D399",
  primaryDark: "#10B981",
  success: "#4ADE80",
  lightGreen: "#1A3D2E",
  white: "#1C1C1E",
  text: "#F5F5F7",
  textMuted: "#A1A1AA",
  textDark: "#E5E5EA",
  muted: "#8E8E93",
  border: "#3A3A3C",
  borderLight: "#2C2C2E",
  surface: "#2C2C2E",
  background: "#121212",
  backgroundAlt: "#1C1C1E",
  red: "#FF453A",
  danger: "#F87171",
  dangerBorder: "#7F1D1D",
  statusBarStyle: "light-content",
  statusBarBackground: "#121212",
  brandBackground: "#137A3A",
  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.65)",
  devHintBg: "#3D3520",
  devHintBorder: "#5C4D1F",
  devHintText: "#FCD34D",
};

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export function getColorsForMode(mode) {
  return mode === THEME_MODES.DARK ? darkColors : lightColors;
}
