import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Contacts from 'react-native-contacts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { billinitStyles as styles, theme } from '../styles';
import { Icon } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showToast } from '../utils/toastService';

export default function ContactSelectorScreen({ navigation }) {
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [splitName, setSplitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        loadContacts();
      } catch (err) {
        console.error('Contacts load error:', err);
        setLoading(false);
      }
    };

    fetchContacts();
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

  const buildPayload = (type) => {
    
    if(splitName.length == 0){
      showToast("danger", "Error", "Please enter a split name");
      return;
    }

    const payload = {
      type: type, // "scan", "upload", or "manual"
      split_name: splitName,
      contacts: selectedContacts.map((c) => ({
        name: c.displayName || `${c.givenName} ${c.familyName}`,
        contact: c.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, '').length > 10 ? c.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, '') : '91'+ c.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, ''),
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
    const beforephoneNumber = item.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, '');
    //console.log(beforephoneNumber.length);
    // Remove spaces, dashes, parentheses, and plus signs 

    const phoneNumber = beforephoneNumber.length > 10 ? beforephoneNumber : '91'+ beforephoneNumber;
    //console.log(phoneNumber);

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
            placeholderTextColor={theme.colors.textMuted}
            value={splitName}
            onChangeText={setSplitName}
          />
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="Search name or number..."
            placeholderTextColor={theme.colors.textMuted}
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
        <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
          <TouchableOpacity
            style={[styles.submitButton, selectedContacts.length === 0 && styles.disabledButton]}
            onPress={() => buildPayload('scan')}
            disabled={selectedContacts.length === 0}
          >
            <Text style={styles.submitText}>
              <Text>
                <MaterialCommunityIcons name="qrcode-scan" size={30} color="white" />
              </Text> 
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, selectedContacts.length === 0 && styles.disabledButton]}
            onPress={() => buildPayload('upload')}
            disabled={selectedContacts.length === 0}
          >
            <Text style={styles.submitText}>
              <Text>
                <MaterialCommunityIcons name="upload" size={30} color="white" />
              </Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, selectedContacts.length === 0 && styles.disabledButton]}
            onPress={() => buildPayload('manual')}
            disabled={selectedContacts.length === 0}
          >
            <Text style={styles.submitText}>
              <Text>
                <MaterialCommunityIcons name="file-document-outline" size={30} color="white" />
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
 