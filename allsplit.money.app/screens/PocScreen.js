// BillSplit PRO UI - React Native (Expo)
// Production-style UI with cards, toggles, better spacing

import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selections, setSelections] = useState({});

  const addPerson = () => {
    if (!name) return;
    setPeople([...people, name]);
    setName('');
  };

  const addItem = () => {
    if (!itemName || !price) return;
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      price: parseFloat(price),
      splitType,
    };
    setItems([...items, newItem]);
    setItemName('');
    setPrice('');
  };

  const toggleSelection = (itemId, person) => {
    setSelections(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [person]: !prev[itemId]?.[person],
      },
    }));
  };

  const calculate = () => {
    let totals = {};
    people.forEach(p => (totals[p] = 0));

    items.forEach(item => {
      if (item.splitType === 'equal') {
        const share = item.price / people.length;
        people.forEach(p => (totals[p] += share));
      } else {
        const selected = selections[item.id] || {};
        const consumers = people.filter(p => selected[p]);
        if (consumers.length === 0) return;
        const share = item.price / consumers.length;
        consumers.forEach(p => (totals[p] += share));
      }
    });

    return totals;
  };

  const totals = calculate();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>BillSplit</Text>

        {/* Add Person */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add People</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Enter name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.button} onPress={addPerson}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsContainer}>
            {people.map(p => (
              <View key={p} style={styles.chip}>
                <Text style={styles.chipText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Add Item */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Item</Text>

          <TextInput
            placeholder="Item name"
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
          />

          <TextInput
            placeholder="Price"
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggle, splitType === 'equal' && styles.activeToggle]}
              onPress={() => setSplitType('equal')}
            >
              <Text>Equal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggle, splitType === 'custom' && styles.activeToggle]}
              onPress={() => setSplitType('custom')}
            >
              <Text>Selected</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={addItem}>
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        {items.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemTitle}>{item.name} - ₹{item.price}</Text>

            {item.splitType === 'custom' && people.map(p => (
              <TouchableOpacity
                key={p}
                style={styles.selectionRow}
                onPress={() => toggleSelection(item.id, p)}
              >
                <Text>{p}</Text>
                <View style={[
                  styles.circle,
                  selections[item.id]?.[p] && styles.selectedCircle
                ]} />
              </TouchableOpacity>
            ))}

            {item.splitType === 'equal' && (
              <Text style={{ color: '#888' }}>Split equally</Text>
            )}
          </View>
        ))}

        {/* Totals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Totals</Text>
          {Object.keys(totals).map(p => (
            <View key={p} style={styles.totalRow}>
              <Text>{p}</Text>
              <Text style={styles.amount}>₹{totals[p].toFixed(2)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  title: { fontSize: 26, fontWeight: 'bold', margin: 20 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: { color: '#fff', fontWeight: '600' },

  row: { flexDirection: 'row', gap: 10 },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },

  chip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },

  chipText: { color: '#3730a3' },

  toggleRow: { flexDirection: 'row', marginBottom: 10 },

  toggle: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  activeToggle: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },

  itemTitle: { fontWeight: '600', marginBottom: 10 },

  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
  },

  selectedCircle: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },

  amount: { fontWeight: '600' },
});
