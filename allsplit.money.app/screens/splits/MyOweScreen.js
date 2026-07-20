import React, { useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MyOweList } from "../../services/splitService";
import DeviceInfo from 'react-native-device-info'; 
import { createHomeStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { findPersonByPhone, getUserMobile, setUserMobile } from "../../utils/userIdentity";
import { isUserBillClosed, isSplitCreator, isUserShareReopened } from "../../utils/splitStats";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { useAppTheme } from "../../context/ThemeContext";


export default function MyOweScreen({ navigation, route }) {
  const styles = useThemedStyles(createHomeStyles);
  const { colors } = useAppTheme();
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [userMobile, setUserMobileState] = useState("");

  // Replace with your actual API endpoint
  const fetchSplits = async () => {
    try {
        const payload = { device_id: await DeviceInfo.getUniqueId() };
      const response = await MyOweList(payload);
      const result = response.data;

      if (response.user_mobile) {
        await setUserMobile(response.user_mobile);
        setUserMobileState(response.user_mobile);
      }

      setSplits(result);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const buildPayload = (type) => {
      const payload = {
        type: type, // "scan", "upload", or "manual"
        contacts: [], // This will be filled in the next step],
        items : [], // This will be filled in the next step
  
        meta: {
          created_at: new Date().toISOString(),
          created_by: 'mobile_app_ui',
        },
      };
      
      navigation.navigate('BillScan', { splitData: payload });
    };
  useHardwareBack(
    useCallback(() => {
      if (showOptions) {
        setShowOptions(false);
        return true;
      }
      goBackOrNavigate(navigation, { screen: "Dashboard" });
      return true;
    }, [showOptions, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      getUserMobile().then(setUserMobileState);
      fetchSplits();

      if (route.params?.startSplitType) {
        const splitType = route.params.startSplitType;
        navigation.setParams({ startSplitType: undefined, openNewSplit: undefined });
        buildPayload(splitType);
        return;
      }

      if (route.params?.openNewSplit) {
        navigation.setParams({ openNewSplit: undefined });
        setShowOptions(true);
      }
    }, [route.params?.openNewSplit, route.params?.startSplitType])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSplits();
  };

  const renderSplitItem = ({ item }) => {
    const isClosed = isUserBillClosed(item, userMobile);
    const isCreator = isSplitCreator(item, userMobile);
    const shareReopened = isUserShareReopened(item, userMobile);

    return (
    <TouchableOpacity 
      style={[styles.card, shareReopened && styles.cardReopened]}
      onPress={() =>
        navigation.navigate("SettleBill", {
          bill: item,
          myPersonId: findPersonByPhone(item?.people ?? [], userMobile)?.id,
        })
      }
      disabled={isClosed && !isCreator}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.splitName}>{item.split_name}</Text>
          {shareReopened ? (
            <View style={styles.reopenedBadge}>
              <Ionicons name="refresh-circle" size={12} color={colors.primary} />
              <Text style={styles.reopenedBadgeText}>Reopened</Text>
            </View>
          ) : null}
        </View>
        {isClosed ? (
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
        
      </View>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>         
          
        </View>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.statText}>{new Date(item?.meta?.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item?.people?.length} People</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="fast-food-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item?.items?.length} Items</Text>
        </View>
        
        </View>
        <View style={styles.cardFooter}>
        <Text style={isClosed ? styles.owepriceTotal : styles.priceTotal}>
          My Owe: ₹{
          item?.items?.reduce((sum, billItem) => {
            const myPersonId = findPersonByPhone(item?.people ?? [], userMobile)?.id;
            const consumer = billItem?.consumption?.consumers?.find(
              (c) => c.person_id === myPersonId
            );

            return sum + (consumer?.amount || 0);
          }, 0).toFixed(2)
        }
          </Text>
          <Text style={isClosed ? styles.owepriceTotal : styles.priceTotal}>
          Total: ₹ {item?.items.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0).toFixed(2)}
        </Text>
         
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Ionicons name="grid-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Splits</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={splits}
          keyExtractor={(item) => item._id} // Using MongoDB _id
          renderItem={renderSplitItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No splits found. Start by creating one!</Text>
          }
        />
      )}
      {!loading && (
      <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.plusButton} 
            onPress={() => setShowOptions(true)}>
            <MaterialCommunityIcons name="plus" size={30} color="white" />
          </TouchableOpacity>
          
        </View> 
)}
        {/* Options Modal */}
      <Modal
        transparent={true}
        visible={showOptions}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => { setShowOptions(false); buildPayload('scan'); }}
            >
              <Ionicons name="scan" size={22} color="#1A9B4B" />
              <Text style={styles.optionText}>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => { setShowOptions(false); buildPayload('upload'); }}
            >
              <Ionicons name="cloud-upload" size={22} color="#1A9B4B" />
              <Text style={styles.optionText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => { setShowOptions(false); buildPayload('manual'); }}
            >
              <Ionicons name="create" size={22} color="#1A9B4B" />
              <Text style={styles.optionText}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
