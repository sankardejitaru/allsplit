import { StyleSheet } from "react-native";

export function createAuthStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "top",
    padding: 24,
    backgroundColor: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 18,
    color: colors.primaryDark,
  },
  subtitle: {
    textAlign: "left",
    marginBottom: 20,
    fontSize: 20,
    color: colors.primaryDark,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  countryCode: {
    width: 72,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: colors.backgroundAlt,
    marginRight: 8,
    textAlign: "center",
    color: colors.textMuted,
  },
  otpinput: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  input: {
    width: "75%",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left",
    backgroundColor: colors.white,
  },
  });
}

export function createLoginScreenStyles(colors) {
  return StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  prefixBox: {
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.backgroundAlt,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  channelRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  channelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: colors.backgroundAlt,
  },
  channelBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  channelText: {
    fontWeight: "600",
    color: colors.textMuted,
  },
  channelTextActive: {
    color: colors.primaryDark,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    paddingHorizontal: 12,
  },
  });
}

export function createOtpScreenStyles(colors) {
  return StyleSheet.create({
  devHint: {
    backgroundColor: colors.devHintBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.devHintBorder,
  },
  devHintText: {
    color: colors.devHintText,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  resendBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  });
}
