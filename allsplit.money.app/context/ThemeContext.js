import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  THEME_MODES,
  getColorsForMode,
  lightColors,
} from "../styles/palettes";

const THEME_STORAGE_KEY = "AppThemeMode";

const ThemeContext = createContext({
  themeMode: THEME_MODES.LIGHT,
  isDark: false,
  colors: lightColors,
  setThemeMode: () => {},
  toggleTheme: () => {},
  registerStatusBarConfig: () => () => {},
});

function toExpoStatusBarStyle(barStyle) {
  return barStyle === "light-content" ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(THEME_MODES.LIGHT);
  const [ready, setReady] = useState(false);
  const [stackVersion, setStackVersion] = useState(0);
  const statusBarStackRef = useRef([]);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === THEME_MODES.DARK || stored === THEME_MODES.LIGHT) {
        setThemeModeState(stored);
      }
      setReady(true);
    });
  }, []);

  const setThemeMode = useCallback(async (mode) => {
    const nextMode = mode === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    setThemeModeState(nextMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  }, [setThemeMode, themeMode]);

  const isDark = themeMode === THEME_MODES.DARK;
  const colors = useMemo(() => getColorsForMode(themeMode), [themeMode]);

  const registerStatusBarConfig = useCallback((config) => {
    const entry = { id: Symbol("status-bar"), config };
    statusBarStackRef.current.push(entry);
    setStackVersion((version) => version + 1);

    return () => {
      statusBarStackRef.current = statusBarStackRef.current.filter(
        (item) => item.id !== entry.id
      );
      setStackVersion((version) => version + 1);
    };
  }, []);

  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      dark: isDark,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [colors, isDark]);

  const statusBarConfig = useMemo(() => {
    const active = statusBarStackRef.current.at(-1)?.config;

    if (active) {
      return active;
    }

    if (!ready) {
      return {
        barStyle: "light-content",
        backgroundColor: lightColors.brandBackground,
      };
    }

    return {
      barStyle: colors.statusBarStyle,
      backgroundColor: colors.statusBarBackground,
    };
  }, [stackVersion, ready, colors]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
      navigationTheme,
      ready,
      registerStatusBarConfig,
    }),
    [themeMode, isDark, colors, setThemeMode, toggleTheme, navigationTheme, ready, registerStatusBarConfig]
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: statusBarConfig.backgroundColor }}>
        <StatusBar
          style={toExpoStatusBarStyle(statusBarConfig.barStyle)}
          backgroundColor={
            Platform.OS === "android" ? statusBarConfig.backgroundColor : undefined
          }
          translucent={false}
        />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
