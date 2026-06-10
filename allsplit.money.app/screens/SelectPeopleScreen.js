import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Modal,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Contacts from "react-native-contacts";
import { getContact,addnewcontact } from "../controllers/authController";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { showToast } from '../utils/toastService';

export default function SelectPeopleScreen({ navigation, route }) {
  const [showOptions, setShowOptions] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPeople, setSelectedPeople] = useState(
    route.params?.selectedPeople || []
  );
  const [Items, setItems] = useState(route.params?.Items || []);
   const [split_name,setSplit_name]= useState(route.params?.split_name || '');

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
  const handleAddContact = async () => {
    if (!firstname || !lastname || !phone) {
      showToast('danger', 'WARNING!', 'All fields are required.');
    return;
  }
    const payload = {
      firstname:firstname,
      lastname:lastname,
      phone:phone
    };
     
    try {
      const response = await addnewcontact(payload);
      // Optionally clear inputs after success
      if(response.success){
        showToast('info', 'SUCCESS!', 'Contact added successfully.');
        setFirstname('');
        setLastname('');
        setPhone('');
        setShowOptions(false);
        setContacts(response.contacts.filter(c => c.phone.length > 0));
      }
      
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };
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
      <View style = {{flexDirection:"row"}}>
      <Text style={styles.title}>Select people ({selectedPeople.length})</Text>
       <TouchableOpacity
                    style={[styles.addItemBtn, { marginLeft: "auto" }]} // ✅ pushes to right
                    onPress={() => setShowOptions(true)}
                  >
                    <Text style={styles.addItemPlus}><MaterialCommunityIcons name="plus" size={30} color="#4CAF50" /> </Text>
                  </TouchableOpacity>
                  </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() =>{

          if(selectedPeople.length==0){
            showToast('danger', 'WARNING!', 'Please select at least one person.');
            return;
          }
          navigation.navigate("Details", {
            selectedPeople: selectedPeople,Items:Items,split_name:split_name
          })
        }
      }
      >
        <Text style={styles.doneText}>
          <MaterialCommunityIcons name="chevron-right" size={30} color="white" /> 
        </Text>
      </TouchableOpacity>
      <Modal
              transparent={true}
              visible={showOptions}
              animationType="slide"
              onRequestClose={() => setShowOptions(false)}
            >
               <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Add New Contact</Text>

        <TextInput
          style={styles.standardinput}
          keyboardType="default"
          value={firstname}
          placeholder="First Name"
          placeholderTextColor="#1A9B4B"
          onChangeText={val => setFirstname(val)}
        />

        <TextInput
          style={styles.standardinput}
          keyboardType="default"
          value={lastname}
          placeholder="Last Name"
          placeholderTextColor="#1A9B4B"
          onChangeText={val => setLastname(val)}
        />

        <TextInput
          style={styles.standardinput}
          keyboardType="phone-pad"
          value={phone}
          placeholder="Phone Number"
          placeholderTextColor="#1A9B4B"
          onChangeText={val => setPhone(val)}
        />

        <TouchableOpacity style={styles.NewBtn} onPress={handleAddContact}>
          <Text style={styles.NewBtnText}>
            <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
            </Modal>
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
    position: 'absolute',
        right: 20,
        bottom: 75,
        backgroundColor: "#1A9B4B",
        borderRadius: 30,
        padding: 16,
        elevation: 4,
  },

  doneText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  NewBtn: {
    position: 'absolute',
        right: 20,
        bottom:30,
        backgroundColor: "#1A9B4B",
        borderRadius: 30,
        padding: 16,
        elevation: 4,
  },

  NewBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 50,
    
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,   
    width: '100%',
    height: '50%', 
    bottom: 0
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1A9B4B"
  },
  standardinput: {
    borderWidth: 1,
    borderColor: "#1A9B4B",
    borderRadius: 8,
    textAlign: "left",
    backgroundColor: "#fff",
    fontSize: 16, 
    color: "#1A9B4B",
    margin: 8
  },
});