import { useMemo } from "react";
import { useAppTheme } from "../context/ThemeContext";

export function useThemedStyles(styleFactory) {
  const { colors } = useAppTheme();
  return useMemo(() => styleFactory(colors), [colors, styleFactory]);
}
