import { StyleSheet } from "react-native";

export function createMyoweStyle(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.primaryDark,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 6,
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

export function createViewmyoweStyle(colors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textDark },
  summaryCard: {
    backgroundColor: colors.success,
    padding: 20,
    margin: 15,
    borderRadius: 15,
    elevation: 5,
  },
  summaryLabel: { color: colors.lightGreen, fontSize: 12, textTransform: "uppercase" },
  summaryValue: { color: colors.white, fontSize: 22, fontWeight: "bold" },
  metaDate: { color: colors.white, fontSize: 10, marginTop: 5, opacity: 0.8 },
  listContainer: { padding: 15 },
  participantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  participantHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: colors.success, fontWeight: "bold", fontSize: 18 },
  participantName: { fontSize: 16, fontWeight: "bold", color: colors.textDark },
  participantPhone: { fontSize: 12, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  itemDescription: { flex: 1, fontSize: 14, color: colors.textDark },
  badge: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  badgeText: { fontSize: 10, color: colors.textMuted, textTransform: "capitalize" },
  itemPrice: {
    width: 80,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  itemPriceimmuted: {
    backgroundColor: colors.border,
    width: 80,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  doneButton: {
    backgroundColor: colors.success,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  doneButtonText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    margin: 30,
  },
  closeButtonText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  });
}
