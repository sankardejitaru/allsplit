import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../context/ThemeContext";

/** Use on screens with a green brand header or splash background. */
export function useBrandStatusBar() {
  const { colors, registerStatusBarConfig } = useAppTheme();

  useFocusEffect(
    useCallback(() => {
      return registerStatusBarConfig({
        barStyle: "light-content",
        backgroundColor: colors.primary,
      });
    }, [colors.primary, registerStatusBarConfig])
  );
}
