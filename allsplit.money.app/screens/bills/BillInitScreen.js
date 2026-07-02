import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Contacts from "react-native-contacts";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBillinitStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { Icon } from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { showToast } from "../../utils/toastService";

export default function BillInitScreen({ navigation }) {
  const styles = useThemedStyles(createBillinitStyles);
  const { colors } = useAppTheme();
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [splitName, setSplitName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    Contacts.getAll()
      .then((contacts) => {
        const sorted = contacts.sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || "")
        );
        setAllContacts(sorted);
        setFilteredContacts(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = allContacts.filter((contact) => {
      const nameMatch = (contact.displayName || "")
        .toLowerCase()
        .includes(text.toLowerCase());
      const phoneMatch = contact.phoneNumbers.some((entry) =>
        entry.number.includes(text)
      );
      return nameMatch || phoneMatch;
    });
    setFilteredContacts(filtered);
  };

  const toggleSelect = (contact) => {
    const isAlreadySelected = selectedContacts.some(
      (entry) => entry.recordID === contact.recordID
    );
    if (isAlreadySelected) {
      setSelectedContacts(
        selectedContacts.filter((entry) => entry.recordID !== contact.recordID)
      );
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const buildPayload = (type) => {
    if (splitName.length === 0) {
      showToast("danger", "Error", "Please enter a split name");
      return;
    }

    const payload = {
      type,
      split_name: splitName,
      contacts: selectedContacts.map((contact) => ({
        name: contact.displayName || `${contact.givenName} ${contact.familyName}`,
        contact:
          contact.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, "").length > 10
            ? contact.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, "")
            : "91" + contact.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, ""),
      })),
      items: [],
      meta: {
        created_at: new Date().toISOString(),
        created_by: "mobile_app_ui",
      },
    };

    navigation.navigate("BillScan", { splitData: payload });
  };

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.some(
      (entry) => entry.recordID === item.recordID
    );
    const beforePhoneNumber = item.phoneNumbers[0]?.number.replace(/[ \-\(\)\+]/g, "");
    const phoneNumber =
      beforePhoneNumber.length > 10 ? beforePhoneNumber : "91" + beforePhoneNumber;

    return (
      <TouchableOpacity
        style={[styles.contactRow, isSelected && styles.selectedRow]}
        onPress={() => toggleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {item.displayName || "Unknown Contact"}
          </Text>
          <Text style={styles.contactPhone}>{phoneNumber}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Icon name="check" type="font-awesome" color="#fff" size={14} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create a Split</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Split Details</Text>
          <TextInput
            style={styles.input}
            placeholder="What is this for? (e.g. Pizza Night)"
            placeholderTextColor={colors.textMuted}
            value={splitName}
            onChangeText={setSplitName}
          />
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="Search name or number..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.recordID}
            renderItem={renderContactItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No contacts found. Make sure you have contacts on your device!
              </Text>
            }
          />
        )}

        <View style={{ flexDirection: "row", justifyContent: "center", margin: 10 }}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedContacts.length === 0 && styles.disabledButton,
            ]}
            onPress={() => buildPayload("scan")}
            disabled={selectedContacts.length === 0}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedContacts.length === 0 && styles.disabledButton,
            ]}
            onPress={() => buildPayload("upload")}
            disabled={selectedContacts.length === 0}
          >
            <MaterialCommunityIcons name="upload" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedContacts.length === 0 && styles.disabledButton,
            ]}
            onPress={() => buildPayload("manual")}
            disabled={selectedContacts.length === 0}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
