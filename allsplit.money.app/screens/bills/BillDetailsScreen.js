import React, { useEffect,useState,useCallback  } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { MyOweAdd } from "../../services/splitService";
import { notifySplitParticipants } from "../../services/notificationService";
import { showToast } from "../../utils/toastService";
import { getUserMobile } from "../../utils/userIdentity";
import { normalizeParticipantPhone } from "../../utils/phoneUtils";
import { createBillDetailsStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useBrandStatusBar } from "../../hooks/useBrandStatusBar";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate, resetToScreen } from "../../utils/navigationHelpers";

export default function BillDetailsScreen({ navigation,route }) {
  const styles = useThemedStyles(createBillDetailsStyles);
  const insets = useSafeAreaInsets();
  useBrandStatusBar();
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [split_name,setSplit_name]= useState('');
  const handleLeaveDetails = useCallback(() => {
    goBackOrNavigate(navigation, { screen: "MyOwe" });
  }, [navigation]);

  useHardwareBack(
    useCallback(() => {
      handleLeaveDetails();
      return true;
    }, [handleLeaveDetails])
  );
  useEffect(() => {
    
    if (route.params?.selectedPeople) {
      setPeople(
        route.params.selectedPeople.map((person) => ({
          ...person,
          phone: normalizeParticipantPhone(person.phone),
        }))
      );
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

   const buildBillPayload = (creatorMobile = "") => {
    
  const totalPeople = people.length;

  return {
    split_name:split_name,
    bill_summary: {
      total_amount: totalAmount,
      total_items: items.length,
      total_people: totalPeople,
    },

    people: people.map((p) => ({
      id: p.id,
      name: p.name,
      phone: normalizeParticipantPhone(p.phone),
    })),
    meta: {
          created_at: new Date().toISOString(),
          created_by: 'mobile_app_ui',
          creator_mobile: creatorMobile
            ? normalizeParticipantPhone(creatorMobile)
            : undefined,
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
          <Text style={styles.fieldLabel}>Qty</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.qty)}
            onChangeText={val => updateItem(item.id, "qty", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.price)}
            onChangeText={val => updateItem(item.id, "price", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Total</Text>
          <Text style={styles.total}>
            ₹ {item.qty * item.price}
          </Text>
        </View>
      </View>

      {/* Split Type */}
      <View style={styles.splitRow}>
        <SplitButton
          styles={styles}
          label="Equally"
          active={item.split === "equal"}
          onPress={() => updateItem(item.id, "split", "equal")}
        />
        <SplitButton
          styles={styles}
          label="By Consumption"
          active={item.split === "consumption"}
          onPress={() => updateItem(item.id, "split", "consumption")}
        />
      </View>
    </View>
  );
  const handleFinalSubmit = async () => {
    if (!people.length) {
      showToast("danger", "Add people", "Select at least one person for this split");
      return;
    }

    if (!items.length) {
      showToast("danger", "Add items", "Add at least one bill item");
      return;
    }

    const creatorMobile = await getUserMobile();
    const payload = buildBillPayload(creatorMobile);
    const response = await MyOweAdd(payload);

    if (response.status) {
      await notifySplitParticipants({
        splitName: split_name,
        people,
        creatorMobile,
        totalAmount: totalAmount,
        serverResult: response.notifications,
      });

      showToast("info", "Split created", "Your bill split has been saved.");
      resetToScreen(navigation, "MyOwe");
    } else {
      showToast("danger", "Could not save", response.message || "Try again");
    }
  };
  return (
    <View style={styles.container}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
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
        <Text style={styles.sectionLabel}>Add people</Text>

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
  style={[styles.proceedBtn, { bottom: Math.max(insets.bottom, 16) + 16 }]}
  onPress={handleFinalSubmit}
>
  <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
</TouchableOpacity>
    </View>
  );
}

function SplitButton({ styles, label, active, onPress }) {
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