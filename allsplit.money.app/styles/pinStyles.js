import { StyleSheet } from "react-native";
import { COLORS } from "./theme";
import { color } from "react-native-elements/dist/helpers";

export default StyleSheet.create({
   
  container: {
    flex: 4,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1A9B4B",
  },
  subtitle: {
    fontSize: 16,
    color: "#1A9B4B",
    marginBottom: 32,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    height: 56,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: 24,
    color: "#1A9B4B",
  },
  button: {
    backgroundColor: COLORS.primary,
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
    marginTop: 24,
    alignItems: "center",
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: "500",
  }, 
  logo :{
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 10,
  },
});