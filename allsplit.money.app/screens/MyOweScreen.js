import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MyOweList } from '../controllers/authController';
import DeviceInfo from 'react-native-device-info'; 
import { homeStyles as styles } from '../styles';
import { MaterialCommunityIcons } from 'react-native-vector-icons';


export default function MyOweScreen({ navigation }) {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Replace with your actual API endpoint
  const fetchSplits = async () => {
    try {
        const payload = { device_id: await DeviceInfo.getUniqueId() };
      const response = await MyOweList(payload); 
      const result = response.data;
      setSplits(result);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const buildPayload = (type) => {
      
    console.log("Building payload for type:", type);
  
      const payload = {
        type: type, // "scan", "upload", or "manual"
        split_name: "Test 1",
        contacts: [], // This will be filled in the next step],
        items : [], // This will be filled in the next step
  
        meta: {
          created_at: new Date().toISOString(),
          created_by: 'mobile_app_ui',
        },
      };
      
      navigation.navigate('BillScan', { splitData: payload });
    };
  const disable =((item) => {
     return item=== undefined;
     
  })
  useEffect(() => {
    fetchSplits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSplits();
  };

  const renderSplitItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('SettleBill', { bill: item })}
      disabled={!disable(item?.people?.[0]?.status)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.splitName}>{item.split_name}</Text>
          
        </View>
        {!disable(item?.people?.[0]?.status)?<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />:<Ionicons name="chevron-forward" size={20} color="#ccc" />}
        
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
        <Text style={disable(item?.consolidated?.participants[0].status)?styles.owepriceTotal:styles.priceTotal}>
          My Owe: ₹ {item?.consolidated?.participants.reduce((sum, participant) => {
            return sum + participant.items.reduce((participantSum, i) => participantSum + (parseFloat(i.price) || 0), 0);
          }, 0)} .00
          </Text>
          <Text style={disable(item?.consolidated?.participants[0].status)?styles.owepriceTotal:styles.priceTotal}>
          Total: ₹ {item?.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)}.00
        </Text>
         
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Splits</Text>
        
         
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
      <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.plusButton} 
            onPress={() => setShowOptions(true)}>
            <MaterialCommunityIcons name="plus" size={30} color="white" />
          </TouchableOpacity>
          
        </View> 
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
