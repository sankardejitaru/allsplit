import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MySplits({ navigation }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Splits</Text>

      {/* Plus Button */}
      <TouchableOpacity 
        style={styles.plusButton} 
        onPress={() => setShowOptions(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
              onPress={() => { setShowOptions(false); navigation.navigate('Scan'); }}
            >
              <Ionicons name="scan" size={22} color="#007AFF" />
              <Text style={styles.optionText}>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => { setShowOptions(false); navigation.navigate('Upload'); }}
            >
              <Ionicons name="cloud-upload" size={22} color="#007AFF" />
              <Text style={styles.optionText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => { setShowOptions(false); navigation.navigate('Manual'); }}
            >
              <Ionicons name="create" size={22} color="#007AFF" />
              <Text style={styles.optionText}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  plusButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#28a745',
    borderRadius: 30,
    padding: 16,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
