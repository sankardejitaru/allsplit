import { StyleSheet } from "react-native";

export function createPinStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: "top",
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: "center",
    marginBottom: 10,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  pinBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#fff",
    elevation: 2,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 32,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    height: 56,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: 24,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgot: {
    marginTop: 1,
    alignItems: "center",
  },
  forgotText: {
    color: colors.primary,
    fontWeight: "500",
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left",
    backgroundColor: colors.white,
  },
  scrolltext: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  });
}

export function createSetPinScreenStyles(colors) {
  return StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 8,
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
  },
  biometricTitle: {
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  biometricHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  });
}

export function createPinLoginScreenStyles(colors) {
  return StyleSheet.create({
  forgotText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: colors.lightGreen,
  },
  biometricButtonText: {
    marginLeft: 8,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  });
}
