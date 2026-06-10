import React, { useEffect,useState,useCallback  } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { MyOweAdd } from "../controllers/authController";
import { showToast } from '../utils/toastService';

export default function BillDetailsScreen({ navigation,route }) {
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [split_name,setSplit_name]= useState('');
   useFocusEffect(
  useCallback(() => {
     
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate("MyOwe"); // your target screen
        return true; // block default back
      }
    );

    return () => backHandler.remove(); // ✅ correct cleanup
  }, [navigation])
);
  useEffect(() => {
    
    if (route.params?.selectedPeople) {
      setPeople(route.params.selectedPeople);
    }
    if (route.params?.Items) {
      setItems(route.params.Items);
    }
    if (route.params?.split_name) {
      setSplit_name(route.params.split_name);
    }else{
      generateRandomNumber();
    }
  }, [route.params?.selectedPeople]);

  const generateRandomNumber = () => {
  // Get today's date
  const today = new Date();

  // Format ddmmyy
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const yy = String(today.getFullYear()).slice(-4);

  const datePart = dd + mm + yy;

  // Generate random 4-digit number
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  // Combine
  const finalNumber = datePart + ' - ' + randomPart;

  // Set into state
  setSplit_name(finalNumber);
};
  const addNewItem = () => {
  const newItem = {
    id: Date.now().toString(),
    name: `Item ${items.length + 1}`,
    qty: 1,
    price: 0,
    split: "equal",
  };

  setItems(prev => [...prev, newItem]);
};
    const updateItemText = (id, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: field === "name" ? String(value) || "" : value }
          : item
      )
    );
  };
  const fnSplit_name = (val) => {
    setSplit_name(val);
     
  };
  const updateItem = (id, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: field === "qty" || field === "price" ? Number(value) || 0 : value }
          : item
      )
    );
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

   const buildBillPayload = () => {
    
  const totalPeople = people.length;

  return {
    split_name:split_name,
    bill_summary: {
      total_amount: totalAmount,
      total_items: items.length,
      total_people: totalPeople,
    },

    people: people.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
    })),
    meta: {
          created_at: new Date().toISOString(),
          created_by: 'mobile_app_ui',
        },
    items: items.map(item => {
      // 🔹 Equal split → auto quantity allocation
      if (item.split === "equal") {
        const perPersonQty = Number(
          (item.qty / totalPeople).toFixed(2)
        );

        return {
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price,
          split_type: "equal",

          consumption: {
            mode: "quantity",
            consumers: people.map(p => ({
              person_id: p.id,
              qty: perPersonQty,
              unit_price: item.price,
              amount: Number((perPersonQty * item.price).toFixed(2)),
            })),
          },
        };
      }

      // 🔹 By consumption → quantities added later
      return {
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
        split_type: "consumption",

        consumption: {
          mode: "quantity",
          consumers: people.map(p => ({
              person_id: p.id,
              qty: 0,
              unit_price: item.price,
              amount: 0,
            })),      
        },
      };
    }),

    created_at: new Date().toISOString(),
  };
};

  const renderItem = ({ item }) => (
    <View style={styles.card}> 
      <TextInput
            style={styles.standardinput}
            keyboardType="default"
            value={String(item.name)}
            onChangeText={val => updateItemText(item.id, "name", val)}
          />
           
          <TouchableOpacity
            style={{ position: "absolute", top: 8, right: 8 }}
            onPress={() => {
              setItems(prev => prev.filter(i => i.id !== item.id));
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#888" />
          </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Qty</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.qty)}
            onChangeText={val => updateItem(item.id, "qty", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.price)}
            onChangeText={val => updateItem(item.id, "price", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>
            ₹ {item.qty * item.price}
          </Text>
        </View>
      </View>

      {/* Split Type */}
      <View style={styles.splitRow}>
        <SplitButton
          label="Equally"
          active={item.split === "equal"}
          onPress={() => updateItem(item.id, "split", "equal")}
        />
        <SplitButton
          label="By Consumption"
          active={item.split === "consumption"}
          onPress={() => updateItem(item.id, "split", "consumption")}
        />
      </View>
    </View>
  );
  const handleFinalSubmit = async () => { 
   
    const payload = buildBillPayload(); 
    const response = await MyOweAdd(payload);  
    
        if (response.status) { 
          showToast('info', 'SUCCESS!', 'All split money bill created.');
          navigation.navigate("MyOwe");
        } else {
          alert(response.message);
        }
     
    

    // Example navigation / API usage
    // navigation.navigate("BillSummary", { payload });
    // or
    // api.createBill(payload);
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>         
          <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
            <Text style={styles.amount}>₹ {totalAmount.toFixed(2)}</Text>

            <TouchableOpacity
              style={[styles.addItemBtn, { marginLeft: "auto" }]} // ✅ pushes to right
              onPress={addNewItem}
            >
              <MaterialCommunityIcons name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>

      </View>
      <View style={styles.addPeopleContainer}>
        <Text style={styles.label}>Add people</Text>

         <View style={{ flexDirection: "row", alignItems: "center" }}>
  {/* Static + button */}
  <TouchableOpacity
    style={styles.addBtn}
    onPress={() =>
      navigation.navigate("People", {
        selectedPeople: people, Items: items,split_name : split_name
      })
    }
  >
    <Text style={styles.plus}>+</Text>
  </TouchableOpacity>

  {/* Scrollable avatars */}
  <FlatList
    data={people}
    horizontal
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase() + item.name.charAt(1).toUpperCase()}
        </Text>
      </View>
    )}
  />
</View>

      </View>
      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity
  style={styles.proceedBtn}
  onPress={handleFinalSubmit}
>
  <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
</TouchableOpacity>
    </SafeAreaView>
  );
}

function SplitButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.splitBtn,
        active && styles.splitBtnActive,
      ]}
    >
      <Text style={[styles.splitText, active && styles.splitTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    height: "100%",
  },
  addPeopleContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E9F6EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    fontWeight: "700",
    color: "#1A9B4B",
  },

  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  plus: {
    fontSize: 28,
    color: "#888",
    marginTop: -2,
  },

  placeholder: {
    marginTop: 40,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#1A9B4B",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
  },
  amount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  field: {
    flex: 1,
    marginRight: 8,
  },

  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
    margin: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#1A9B4B",
    borderRadius: 8,
    paddingVertical: 6,
    textAlign: "center",
    backgroundColor: "#fff",
    color: "#1A9B4B"
  },
   splitinput: {
    borderWidth: 1,
    borderColor: "#1A9B4B",
    borderRadius: 8,
    paddingVertical: 6,
    textAlign: "left",
    backgroundColor: "#fff",
    fontSize: 16,
    width: "100%",
    color: "#1A9B4B"
  },
  standardinput: {
    borderWidth: 1,
    borderColor: "#1A9B4B",
    borderRadius: 8,
    paddingVertical: 6,
    textAlign: "left",
    backgroundColor: "#fff",
    fontSize: 16,
    width: "95%",
    color: "#1A9B4B"
  },
  total: {
    paddingVertical: 8,
    textAlign: "center",
    fontWeight: "600",
  },

  splitRow: {
    flexDirection: "row",
    marginTop: 16,
  },

  splitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 12,
  },

  splitBtnActive: {
    borderColor: "#1A9B4B",
    backgroundColor: "#E9F6EF",
  },

  splitText: {
    color: "#444",
  },

  splitTextActive: {
    color: "#1A9B4B",
    fontWeight: "600",
  },

  proceedBtn: {
    position: 'absolute',
        right: 20,
        bottom: 75,
        backgroundColor: "#1A9B4B",
        borderRadius: 30,
        padding: 16,
        elevation: 4,
    
    
  },

  proceedText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    
  },
  addItemRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: 16,
  marginTop: 16,
},

addItemText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#fff",
},

addItemBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#1A9B4B",
  alignItems: "center",
  justifyContent: "center",
},

addItemPlus: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "700",
  marginTop: -2,
},
});