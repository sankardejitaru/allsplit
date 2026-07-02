import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { launchImageLibrary } from "react-native-image-picker";
import { SendBillScan } from "../../services/billService";
import { createBillStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useBrandStatusBar } from "../../hooks/useBrandStatusBar";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { showToast } from "../../utils/toastService";
import BillScannerScreen from "./BillScannerScreen";

export default function BillScanScreen({ navigation, route }) {
  const styles = useThemedStyles(createBillStyles);
  useBrandStatusBar();
  const cameraRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanFinished, setScanFinished] = useState(false);

  const handleCancel = useCallback(() => {
    goBackOrNavigate(navigation, { screen: "MyOwe" });
  }, [navigation]);

  useHardwareBack(
    useCallback(() => {
      if (loading) {
        return true;
      }
      handleCancel();
      return true;
    }, [loading, handleCancel])
  );

  const splitData = route.params?.splitData ?? {
    type: "scan",
    contacts: [],
    split_name: "",
  };

  useEffect(() => {
    if (splitData.type === "manual") {
      setPhoto("NA");
      setLoading(false);
      setScanFinished(true);
    } else if (splitData.type === "upload") {
      choosePhoto();
    } else {
      setPhoto(null);
    }
  }, [splitData.type]);

  useEffect(() => {
    if (!photo || loading || !scanFinished || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    navigation.replace("Details", {
      selectedPeople: [],
      Items: items,
      split_name: splitData.split_name,
    });
  }, [photo, loading, scanFinished, items, navigation, splitData.split_name]);

  const choosePhoto = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setPhoto(response.assets[0].uri);
        setLoading(true);
        uploadBill(response.assets[0].uri);
      }
    });
  };

  const takePicture = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result?.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to scan bills.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setPhoto(result.uri);
      setLoading(true);
      uploadBill(result.uri);
    } catch (err) {
      console.log("AllSplit Error:", err);
      showToast("danger", "Error", "Failed to capture bill");
    }
  };

  const uploadBill = async (imageUri) => {
    try {
      setLoading(true);

      const data = await SendBillScan(imageUri);

      if (data?.success && data.items?.length) {
        const mappedItems = data.items.map((entry, index) => ({
          id: index.toString(),
          name: entry.name,
          price: entry.rate ?? entry.price ?? 0,
          qty: entry.qty ?? 1,
          amount: entry.amount ?? 0,
          split: "equal",
        }));
        setItems(mappedItems);

        if (__DEV__ && data.parse_meta) {
          console.log("AllSplit scan meta:", data.parse_meta);
        }

        showToast(
          "success",
          "Bill scanned",
          data.message || `${mappedItems.length} items detected`
        );
      } else {
        showToast(
          "danger",
          "Could not read bill",
          data?.message || "Try a clearer photo or add items manually"
        );
      }
    } catch (err) {
      console.log("AllSplit API Error:", err);
      showToast("danger", "WARNING!", "Bill scan failed");
    } finally {
      setLoading(false);
      setScanFinished(true);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: loading ? "#F5F7FA" : "#fff",
      }}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        {!photo && !loading ? (
          <TouchableOpacity style={styles.topBackBtn} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}
        {!photo ? (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : loading ? (
          <BillScannerScreen photo={photo} embedded />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
