import React, { useRef, useState,useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {launchImageLibrary} from 'react-native-image-picker';
import { SendBillScan } from "../controllers/authController";

import { billStyles as styles, theme } from "../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScanBillScreen from "./ScanBillScreen";
import { MyOweAdd } from "../controllers/authController";
import { showToast } from '../utils/toastService'; // your reusable toast function
import BillScannerScreen from "./BillScannerScreen";
import BillDetailsScreen from "./BillDetailsScreen";



export default function BillScanScreen({ navigation,route }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRequestPermission = async () => {
    if (!permission) return;
    const result = await requestPermission();

    if (!result?.granted) {
      if (result?.canAskAgain === false) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to scan bills. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Please allow camera access to use the scanning feature.",
          [{ text: "OK" }]
        );
      }
    }
  };

  
  const { splitData } = route.params;

  useEffect(() => {
    if (splitData.type === 'manual') {
      setPhoto("NA"); // skip camera and show manual entry UI
      setLoading(false);
    } else if(splitData.type === 'upload') {
      choosePhoto();      
    } else {
      setPhoto(null);
    }
  }, [splitData.type]);

  const choosePhoto = () => {
    console.log("Opening image library for bill upload...");
        launchImageLibrary({mediaType: 'photo'}, (response) => {
          if (!response.didCancel && !response.errorCode) {
            setPhoto(response.assets[0].uri);
            uploadBill(response.assets[0].uri); // set photo to result.assets[0].uri
            setLoading(true);
          }
        });
      };
  /* from this get list of contacts choosed from split data and its count */
  const contacts = splitData.contacts;
  const contactCount = contacts.length;
  
  const pickImage = async () => {
    // Ask for permission   

    // Open gallery
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri); // store the chosen photo URI
    }
  };

  /* ========= Take Picture ========= */
  const takePicture = async () => {
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      }); 
      setPhoto(result.uri);
      uploadBill(result.uri);
    } catch (err) {
      console.log("AllSplit Error:", err);
      alert("Failed to capture bill");
    }
  };

  /* ========= Send Image to Backend ========= */
  const uploadBill = async (imageUri) => {
    console.log("Uploading bill with image URI:", imageUri);
    
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "bill.png",
        type: "image/png",
      });
      
      const data = await SendBillScan(formData);     
      console.log("Received items from bill scan:", JSON.stringify(data.items));
      if (data.success) {
        const mappedItems = data.items.map((item, index) => ({
          id: index.toString(),
          name: item.item,
          price: item.amount,
          qty: 1,
          splitEqual: true,
        }));

        setItems(mappedItems);
      } else {
        alert("Failed to read bill");
      }
    } catch (err) {
      console.log("AllSplit API Error:", err);
      alert("Bill scan failed");
    } finally {
      setLoading(false);
    }
  };
const handleFinalSubmit = async () => { 
  
  // 1. Map the items to include item_id and the keys expected by your API
  const mappedItems = items.map((item, index) => ({
    item_id: item.id || `ITEM${index + 1}`,
    description: item.name,
    qty: item.quantity || 0, // Defaulting to 1 as per UI, adjust if you add quantity input
    price: parseFloat(item.price) || 0,
    is_split_equal: item.splitEqual,
  }));

  // 2. Build the consolidated participants list
  // Note: By default, this logic adds every contact to every item. 
  // If "splitEqual" is true, share is "equal", otherwise "custom".
  const participants = splitData.contacts.map((contact) => ({
    name: contact.name,
    contact: contact.contact,
    items: mappedItems.map((item) => ({
      item_id: item.item_id,
      share: item.is_split_equal ? "equal" : "custom",
      price: item.is_split_equal ? (item.price / contactCount).toFixed(2) : '0',
    })),
  }));

  // 3. Construct the Final Payload
  const finalPayload = {
    split_name: splitData.split_name,
    contacts: splitData.contacts,
    bill: {
      bill_id: `BILL${Date.now().toString().slice(-5)}`, // Generating a pseudo ID
      scan_reference: photo, // Using the image URI as reference 
    },
    items: mappedItems,
    consolidated: {
      participants: participants,
    },
    meta: {
      created_at: new Date().toISOString(),
      created_by: "mobile_app_ui",
    },
  };

  const response = await MyOweAdd(finalPayload);  
    if (response.status) { 
      showToast('info', 'SUCCESS!', 'All split money bill created.');
      navigation.navigate("MyOwe");
    } else {
      alert(response.message);
    }
 //navigation.navigate('ViewMyOwe', { finalPayload: finalPayload });
};
const addItem = () => {

    const newItem = {
      id: Date.now().toString(),
      name: "",
      price: "",
      qty: 1,
      splitEqual: true,
      isEditing: true,
    };
    setItems([newItem, ...items]); 
    
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const toggleSplit = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, splitEqual: !item.splitEqual }
          : item
      )
    );
  };

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <View style={styles.container}>
      {!photo ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />

          <TouchableOpacity
            style={styles.captureBtn}
            onPress={takePicture}
          >
            <Text style={styles.captureText}><Ionicons name="camera" size={24} color="#fff" /></Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
        
          {loading && (
            <BillScannerScreen photo={photo} />
          )}

          {!loading && 
           navigation.navigate("Details", { selectedPeople : [],Items : items })
          }
        </>
      )}
    </View>
    
    </SafeAreaView>
     
  );
}
 