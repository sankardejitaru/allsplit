import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ViewMyOweScreen({ route, navigation }) {
  // Extract finalPayload passed from BillScanScreen
  const { finalPayload } = route.params;
 
  const renderParticipant = ({ item }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.participantName}>{item.name}</Text>
          <Text style={styles.participantPhone}>{item.contact}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {item.items.map((entry, index) => {
        // Find the full item details from the main items list to get description/price
        const itemDetail = finalPayload.items.find(i => i.item_id === entry.item_id);
        return (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemDescription}>{itemDetail?.description}</Text>
            <View style={styles.badge}>
               <Text style={styles.badgeText}>{entry.share}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{itemDetail?.price}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Owe Details</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Split Name</Text>
        <Text style={styles.summaryValue}>{finalPayload.split_name}</Text>
        <Text style={styles.metaDate}>Created: {new Date(finalPayload.meta.created_at).toLocaleDateString()}</Text>
      </View>

      <FlatList
        data={finalPayload.consolidated.participants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderParticipant}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.doneButtonText}>Finish Split</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  summaryCard: { 
    backgroundColor: '#4CAF50', 
    padding: 20, 
    margin: 15, 
    borderRadius: 15, 
    elevation: 5 
  },
  summaryLabel: { color: '#E8F5E9', fontSize: 12, textTransform: 'uppercase' },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  metaDate: { color: '#fff', fontSize: 10, marginTop: 5, opacity: 0.8 },
  listContainer: { padding: 15 },
  participantCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 2 
  },
  participantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  avatarText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 18 },
  participantName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  participantPhone: { fontSize: 12, color: '#777' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  itemDescription: { flex: 1, fontSize: 14, color: '#444' },
  badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginHorizontal: 10 },
  badgeText: { fontSize: 10, color: '#666', textTransform: 'capitalize' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
  doneButton: { 
    backgroundColor: '#4CAF50', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 30 
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});