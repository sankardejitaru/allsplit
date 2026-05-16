import React, { useRef, useState } from "react";
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
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SendBillScan } from "../controllers/authController";

import styles from "../styles/billStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScanBillScreen from "./ScanBillScreen";
import { MyOweAdd } from "../controllers/authController";


export default function BillScanScreen({ navigation,route }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>
          Camera permission required
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionBtn}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const { splitData } = route.params;

  /* from this get list of contacts choosed from split data and its count */
  const contacts = splitData.contacts;
  const contactCount = contacts.length;

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
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "bill.jpg",
        type: "image/jpeg",
      });
      
      const data = await SendBillScan(formData);     
      
      if (data.success) {
        const mappedItems = data.items.map((item, index) => ({
          id: index.toString(),
          name: item.item,
          price: item.amount,
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
    quantity: item.quantity || 0, // Defaulting to 1 as per UI, adjust if you add quantity input
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
   //console.log("AllSplit API Log - Save Split Response:", response);
   //AllSplit API Log - Save Split Response: {"inserted_id": "6a0304990cab1c231aeca456", "message": "Split saved successfully", "status": true}
    if (response.status) { 
     // navigation.navigate("MyOwe");
    } else {
     // alert(response.message);
    }
 //navigation.navigate('ViewMyOwe', { finalPayload: finalPayload });
};
const addItem = () => {

    const newItem = {
      id: Date.now().toString(),
      name: "",
      price: "",
      quantity: contactCount.toString(),
      splitEqual: true,
      isEditing: true,
    };
    setItems([newItem, ...items]); 
   console.log("Current items list:", [newItem, ...items]);
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
            <ScanBillScreen photo={photo} />
          )}

          {!loading && (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Split Items</Text>

                <TouchableOpacity
                  style={styles.addIconBtn}
                  onPress={addItem}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              {items.length === 0 && (
                <Text style={styles.noItems}>
                  No items detected. You can add manually.
                </Text>
              )}
            
      <View style={{ flex: 1  }}>
      {/* Add Button */}
      

      {/* Scrollable List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            
            {/* Name & Price (Editable) */}
            <View style={{ flexDirection: "row", flex: 1 }}>
              
              <TextInput
                placeholder="name"
                value={item.name}
                onChangeText={(text) =>
                  updateItem(item.id, "name", text)
                }
                style={styles.input}
              />

              <TextInput
                placeholder="Amount"
                 value={item.price?.toString()}
                 keyboardType="decimal-pad" 
                 inputMode="decimal"
                onChangeText={(text) =>
                  updateItem(item.id, "price", text)
                }
                style={styles.input}
              /> 
              <TextInput
                placeholder="Qty"
                 value={item.quantity?.toString()}
                 keyboardType="decimal-pad" 
                 inputMode="decimal"
                 editable={item.splitEqual==true?false:true}
                onChangeText={(text) =>
                  updateItem(item.id, "quantity", text)
                }
                style={styles.input}
              />
            </View>

            {/* Switch */}
            <View style={styles.switchRow}> 
              <Switch
                value={item.splitEqual}
                onValueChange={() => toggleSplit(item.id)}
              />
            </View>

            {/* Delete */}
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.deleteBtn}
            >
              <Text><Ionicons name="trash" size={24} color="green" /></Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
<View style={styles.rightAlign}>
    <TouchableOpacity style={styles.arrowIconbtn} 
    onPress={() => handleFinalSubmit()} >
  <Ionicons name="arrow-forward" size={22} color="#fff" />
</TouchableOpacity>
</View>
            </>
          )}
        </>
      )}
    </View>
    
    </SafeAreaView>
     
  );
}
 