import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MyOweList } from '../controllers/authController';
import DeviceInfo from 'react-native-device-info'; 
import styles from '../styles/myoweStyle';

export default function MyOweScreen({ navigation }) {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Replace with your actual API endpoint
  const fetchSplits = async () => {
    try {
        const payload = { device_id: await DeviceInfo.getUniqueId() };
      const response = await MyOweList(payload);
      console.log("AllSplit API Log - My Owe List Response:", response);
      const result = response.data;
      setSplits(result);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
      onPress={() => navigation.navigate('ViewMyOwe', { finalPayload: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.splitName}>{item.split_name}</Text>
          <Text style={styles.dateText}>
            {new Date(item.meta.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.contacts.length} People</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="fast-food-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.items.length} Items</Text>
        </View>
        <Text style={styles.priceTotal}>
          ₹{item.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Splits</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('BillInit')}>
          <Ionicons name="add" size={28} color="#fff" />
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
    </SafeAreaView>
  );
}
