import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  base: {
    width: "90%",
    borderRadius: 8,
    borderLeftWidth: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
    alignSelf: "center",
  },
  content: {
    paddingHorizontal: 4,
  },
  text1: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text2: {
    fontSize: 14,
    marginTop: 4,
  },
  hidden: {
    height: 0,
    width: 0,
    opacity: 0,
  },
});

function ToastLayout({ text1, text2, style, text1Style, text2Style, onPress }) {
  const title =
    text1 != null && String(text1).trim() !== "" ? String(text1) : null;
  const message =
    text2 != null && String(text2).trim() !== "" ? String(text2) : null;

  if (!title && !message) {
    return <View style={styles.hidden} />;
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.base, style]} onPress={onPress}>
      <View style={styles.content}>
        {title ? <Text style={[styles.text1, text1Style]}>{title}</Text> : null}
        {message ? <Text style={[styles.text2, text2Style]}>{message}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const infoToast = (props) => (
  <ToastLayout
    text1={props.text1}
    text2={props.text2}
    onPress={props.onPress}
    style={{ borderLeftColor: "#137A3A", backgroundColor: "#E8F5E9" }}
    text1Style={{ color: "#137A3A" }}
    text2Style={{ color: "#2c3e50" }}
  />
);

const dangerToast = (props) => (
  <ToastLayout
    text1={props.text1}
    text2={props.text2}
    onPress={props.onPress}
    style={{ borderLeftColor: "#e74c3c", backgroundColor: "#fdecea" }}
    text1Style={{ color: "#e74c3c" }}
    text2Style={{ color: "#c0392b" }}
  />
);

// Override all built-in types so the library never falls back to its default toasts.
export const toastConfig = {
  success: infoToast,
  info: infoToast,
  error: dangerToast,
  danger: dangerToast,
};

export const showToast = (type = "info", title = "", message = "") => {
  const safeType = type === "danger" || type === "error" ? "danger" : "info";
  const safeTitle =
    title != null && String(title).trim() !== "" ? String(title) : undefined;
  const safeMessage =
    message != null && String(message).trim() !== ""
      ? String(message)
      : undefined;

  if (!safeTitle && !safeMessage) {
    return;
  }

  Toast.show({
    type: safeType,
    text1: safeTitle,
    text2: safeMessage,
    position: "top",
    visibilityTime: 3000,
  });
};
