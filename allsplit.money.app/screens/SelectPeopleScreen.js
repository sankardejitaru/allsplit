import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Contacts from "react-native-contacts";
import { getContact } from "../controllers/authController";

export default function SelectPeopleScreen({ navigation, route }) {
  const [contacts, setContacts] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState(
    route.params?.selectedPeople || []
  );
  const [Items, setItems] = useState(route.params?.Items || []);

  useEffect(() => {
    async function loadContacts() {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      const getcontact = await getContact();
          
      setContacts(getcontact.contacts.filter(c => c.phone.length > 0));
    }

    loadContacts();
  }, []);

  // 🔹 Convert contact → PEOPLE format
  const normalizeContact = (contact) => {
    const rawNumber =
      contact.phone.replace(/[^\d]/g, "");

    const phone =
      rawNumber.length > 10
        ? rawNumber.slice(-10)
        : rawNumber;
     
    return {
      id: contact._id,
      name: `${contact.firstname || ""} ${contact.lastname || ""}`.trim(),
      phone: `91${phone}`,
    };
  };

  const togglePerson = (contact) => {
    const person = normalizeContact(contact);
     

    setSelectedPeople((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedPeople.some(
      (p) => p.id === item._id
    );

    const person = normalizeContact(item);

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.activeRow]}
        onPress={() => togglePerson(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {person.name.charAt(0)}
          </Text>
        </View>

        <View>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.phone}>{person.phone}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select people</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() =>
          navigation.navigate("Details", {
            selectedPeople: selectedPeople,Items:Items
          })
        }
      >
        <Text style={styles.doneText}>
          Add ({selectedPeople.length})
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },

  activeRow: {
    backgroundColor: "#E9F6EF",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ddd",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontWeight: "700",
    fontSize: 16,
  },

  name: {
    fontWeight: "600",
  },

  phone: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },

  doneBtn: {
    backgroundColor: "#1A9B4B",
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },

  doneText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});