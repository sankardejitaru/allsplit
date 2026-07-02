import { StyleSheet } from "react-native";

export function createBillinitStyles(colors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textDark,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: colors.backgroundAlt,
    fontSize: 16,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedRow: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.success,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  contactPhone: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.success,
  },
  checkMark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    margin: 10,
    elevation: 2,
    width: "20%",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: colors.muted,
    fontSize: 14,
  },
});
}
