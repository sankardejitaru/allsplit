import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: COLORS.primaryDark,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: COLORS.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
  width: 180,
  height: 80,
  alignSelf: "center",
  marginBottom: 40,
},
});