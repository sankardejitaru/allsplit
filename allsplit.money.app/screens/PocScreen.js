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


export default function PocScreen({ navigation,route }) {
  const [photo, setPhoto] = useState(null);
return (
<ScanBillScreen photo={photo} />
)
}