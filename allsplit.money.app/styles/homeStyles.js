import { StyleSheet } from "react-native";
import { COLORS } from "./theme";
import { color } from "react-native-elements/dist/helpers";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A9B4B",
  },

  tagline: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },

  footer: {
    marginTop: 16,
    fontSize: 12,
    color: "#999",
  },
  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
     
    marginTop: 150,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1A9B4B",
  },

  allsplitlogo: {
  width: 180,
  height: 80,
  alignSelf: "center",
  marginBottom: 40,
},

  tagline: {
    fontSize: 20,
    color: COLORS.primary, 
  },
});