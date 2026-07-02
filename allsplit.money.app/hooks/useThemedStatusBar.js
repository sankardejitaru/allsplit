import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../context/ThemeContext";

/** Use on standard screens so status bar icons match the themed background. */
export function useThemedStatusBar() {
  const { colors, registerStatusBarConfig } = useAppTheme();

  useFocusEffect(
    useCallback(() => {
      return registerStatusBarConfig({
        barStyle: colors.statusBarStyle,
        backgroundColor: colors.statusBarBackground,
      });
    }, [colors.statusBarStyle, colors.statusBarBackground, registerStatusBarConfig])
  );
}
