import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  camera: {
    flex: 1,
  },
  captureBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    borderRadius: 50,
  },
  captureText: {
    color: COLORS.white,
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
    color: COLORS.primaryDark,
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
    color: COLORS.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginRight: 8,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  primaryText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  addIconBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: COLORS.primary,
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
  color: "#fff",
  fontSize: 24,
  lineHeight: 26,
},
arrowIconbtn: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: COLORS.primary,
  alignItems: "center",
  justifyContent: "center",
  margin: 16,
},
rightAlign: {
  alignItems: "flex-end",
},
input: {
  width: "35%",  
  fontSize: 20,
  height: 100,
},
});