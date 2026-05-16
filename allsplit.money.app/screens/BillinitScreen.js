import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Contacts from 'react-native-contacts';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/billinitStyles';
import { Icon } from 'react-native-elements';

export default function ContactSelectorScreen({ navigation }) {
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [splitName, setSplitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestPermissionAndFetch = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts Permission',
              message: 'This app needs access to your contacts to split bills.',
              buttonPositive: 'OK',
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            loadContacts();
          } else {
            setLoading(false);
          }
        } else {
          loadContacts();
        }
      } catch (err) {
        console.error('Permission error:', err);
        setLoading(false);
      }
    };

    requestPermissionAndFetch();
  }, []);

  const loadContacts = () => {
    Contacts.getAll()
      .then((contacts) => {
        // Sort contacts alphabetically by name
        const sorted = contacts.sort((a, b) =>
          (a.displayName || '').localeCompare(b.displayName || '')
        );
        setAllContacts(sorted);
        setFilteredContacts(sorted);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Fetch error:', e);
        setLoading(false);
      });
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = allContacts.filter((c) => {
      const nameMatch = (c.displayName || '').toLowerCase().includes(text.toLowerCase());
      const phoneMatch = c.phoneNumbers.some((p) => p.number.includes(text));
      return nameMatch || phoneMatch;
    });
    setFilteredContacts(filtered);
  };

  const toggleSelect = (contact) => {
    const isAlreadySelected = selectedContacts.some((c) => c.recordID === contact.recordID);
    if (isAlreadySelected) {
      setSelectedContacts(selectedContacts.filter((c) => c.recordID !== contact.recordID));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const buildPayload = () => {
    const payload = {
      split_name: splitName,
      contacts: selectedContacts.map((c) => ({
        name: c.displayName || `${c.givenName} ${c.familyName}`,
        contact: c.phoneNumbers[0]?.number || '',
      })),
      items : [], // This will be filled in the next step

      meta: {
        created_at: new Date().toISOString(),
        created_by: 'mobile_app_ui',
      },
    };
    navigation.navigate('BillScan', { splitData: payload });
  };

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.some((c) => c.recordID === item.recordID);
    const phoneNumber = item.phoneNumbers[0]?.number || 'No number';

    return (
      <TouchableOpacity
        style={[styles.contactRow, isSelected && styles.selectedRow]}
        onPress={() => toggleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.displayName || "Unknown Contact"}</Text>
          <Text style={styles.contactPhone}>{phoneNumber}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="check" type="font-awesome" color="#fff" size={14} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>💸 Create a Split</Text>

        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.label}>Split Details</Text>
          <TextInput
            style={styles.input}
            placeholder="What is this for? (e.g. Pizza Night)"
            value={splitName}
            onChangeText={setSplitName}
          />
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="Search name or number..."
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {/* List Section */}
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.recordID}
            renderItem={renderContactItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No contacts found. Make sure you have contacts on your device!</Text>
            }
          />
        )}

        {/* Footer Action */}
        <TouchableOpacity
          style={[styles.submitButton, selectedContacts.length === 0 && styles.disabledButton]}
          onPress={buildPayload}
          disabled={selectedContacts.length === 0}
        >
          <Text style={styles.submitText}>
            Continue {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
 