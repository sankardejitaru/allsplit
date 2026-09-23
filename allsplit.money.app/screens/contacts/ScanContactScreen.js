import React, { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createInviteStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { showToast } from "../../utils/toastService";
import { acceptContactInvite } from "../../services/contactService";
import { parseJoinContactPayload } from "../../utils/joinContact";
import { normalizePerson } from "../../utils/phoneUtils";

export default function ScanContactScreen({ navigation, route }) {
  const styles = useThemedStyles(createInviteStyles);
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [handling, setHandling] = useState(false);
  const scannedRef = useRef(false);
  const returnTo = route?.params?.returnTo || "People";
  const returnParams = route?.params?.returnParams || {};

  const handleBack = useCallback(() => {
    goBackOrNavigate(navigation, { screen: returnTo, params: returnParams });
  }, [navigation, returnTo, returnParams]);

  useHardwareBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack])
  );

  const finishWithContact = (contact) => {
    const person = normalizePerson(contact);
    navigation.navigate({
      name: returnTo,
      params: {
        ...returnParams,
        scannedPerson: person,
      },
      merge: true,
    });
  };

  const onBarcodeScanned = async ({ data }) => {
    if (scannedRef.current || handling) {
      return;
    }

    const payload = parseJoinContactPayload(data);
    if (!payload) {
      showToast("danger", "Not an AllSplit invite", "Ask your friend to open Invite QR");
      return;
    }

    scannedRef.current = true;
    setHandling(true);
    try {
      const response = await acceptContactInvite(payload);
      if (!response.success) {
        showToast("danger", "Could not add contact", response.message || "Try again");
        scannedRef.current = false;
        return;
      }
      showToast("info", "Contact added", response.contact?.name || "Saved to your contacts");
      finishWithContact(response.contact);
    } catch (error) {
      scannedRef.current = false;
      showToast("danger", "Could not add contact", "Try again");
    } finally {
      setHandling(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan contact</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Camera access is needed to scan an AllSplit invite QR.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Allow camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.topBackBtn} onPress={handleBack}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handling ? undefined : onBarcodeScanned}
      />
      <View style={styles.scanHint}>
        <Text style={styles.scanHintText}>
          {handling ? "Adding contact..." : "Align the AllSplit invite QR in the frame"}
        </Text>
      </View>
    </SafeAreaView>
  );
}
