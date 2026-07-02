import { StyleSheet } from "react-native";

export function createBillStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.white,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: colors.textDark,
  },
  permissionBtnContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  permissionBtn: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  topBackBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    borderRadius: 50,
  },
  captureText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: "90%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    margin: 16,
    color: colors.primaryDark,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemPrice: {
    color: "red",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginRight: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  primaryText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addIcon: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 26,
  },
  arrowIconbtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  input: {
    width: "30%",
    fontSize: 20,
    height: 100,
  },
});
}
