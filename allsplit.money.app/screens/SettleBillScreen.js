import React, { useMemo, useState,useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from "../utils/toastService";
import { MyOwePrizeUpdate,closebill } from '../controllers/authController'; 




export default function SettleBillScreen({ route }) {
  const bill = route?.params?.bill;
  const [LOGGED_IN_USER_ID, setLoginId] = useState("1"); 
  

  
  let grandTotal = 0;

  if (bill?.items) {
    //grandTotal = bill.items.reduce((acc, item) => acc + item.price, 0);
    bill.items.forEach(item => {
        
      grandTotal += item.price * item.qty
    })
  }
 
  if (!bill?.people || !bill?.items) {
    return <Text>Loading…</Text>;
  }

  const [items, setItems] = useState(() =>
    bill.items.map(item => ({
      ...item,
      consumption: {
        consumers: bill.people.map(p => {
          const existing = item.consumption?.consumers?.find(
            c => c.person_id === p.id
          );
          const qty = existing?.qty || 0;
          return {
            person_id: p.id,
            qty,
            unit_price: item.price,
            amount: qty * item.price,
          };
        }),
      },
    }))
  );

  useEffect(() => {
    const fetchLoginId = async () => {
      const loginId = await AsyncStorage.getItem("LoginId");
      
      if (loginId) setLoginId(loginId.toString());
    };
    fetchLoginId();
  }, []);


  const updateQty = (itemId, qty) => {
     
    setItems(prev =>
      prev.map(item => { 
        if (item.id !== itemId) return item;
        
        let currentQty =0;
        item.consumption.consumers.forEach(c => {
          if(c.person_id !== LOGGED_IN_USER_ID){
             currentQty += +c.qty;
          }else{
            currentQty += +qty;      
          }
          
        }); 
        // handleSave(itemId);
        if(item.qty < currentQty){
          //console.log("Quantity cannot be more than total item quantity");
          showToast("danger", "Error", "Quantity cannot be more than total item quantity");
          qty = 0;
        }
         
        const consumers = item.consumption.consumers.map(c =>
          c.person_id === LOGGED_IN_USER_ID
            ? {
                ...c,
                qty: Number(qty) || 0,
                amount: (Number(qty) || 0) * c.unit_price,
              }
            : c
        );
        item.consumption.consumers.forEach(c => {
          if(c.person_id === LOGGED_IN_USER_ID){             
             const finalPayload1 = {
                "id": bill._id,
                "item_id": item.id,
                "amount": parseFloat(c.unit_price * qty),
                "person_id": LOGGED_IN_USER_ID,
                "unit_price": parseFloat(c.unit_price),
                "qty": qty?parseInt(qty):0,
              };
              if(qty !== 0){
                handleSave(finalPayload1);
              }
          }
        });
        return {
          ...item,
          consumption: { consumers },
        };
      })
    );
  };

   const handleSave = async (finalPayload1) => {
      
        console.log("Saving changes with payload:", finalPayload1); // Debug log
        //return; // Stop execution here to check payload before API call
      
        const response = await MyOwePrizeUpdate(finalPayload1); 
        console.log("API Response:", response); // Debug log
        if(!response.success) {
          showToast('danger', 'WARNING!', 'Item price is exceed the limit.');
          //handlePriceChange(participantIndex, itemIndex, response.message);
        }
    };

  const settlement = useMemo(() => {
    let myTotal = 0;
    

    items.forEach(item => {
      item.consumption.consumers.forEach(c => {
       
        if (c.person_id === LOGGED_IN_USER_ID) {
          myTotal += c.amount;
        }
      });
    });

    return { myTotal };
  }, [items]);

  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <Text style={styles.title}>Settle Bill</Text>
      }
      renderItem={({ item }) => {
        const _id = item._id;
        const isEditable = item.split_type === "consumption";
        
        const myConsumption = item.consumption.consumers.find(
          c => c.person_id === LOGGED_IN_USER_ID
        ); 
        return (
          <View style={styles.card}>
            <Text style={styles.itemName}>
              {item.name} (₹{item.price*item.qty})
            </Text>

            {/* 🔥 YOUR CONSUMPTION */}
            <View style={[styles.rowBase, styles.myRow]}>
              <Text style={[styles.nameCol, styles.youLabel]}>You</Text>

              
                {isEditable ? (
                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="numeric"
                    value={String(myConsumption.qty)}
                    onChangeText={q => updateQty(item.id, q)}
                  />
                ) : (
                  <Text style={[styles.qtyCol, styles.lockedQty]}>
                    {myConsumption.qty}
                  </Text>
                )}
              

              <Text style={[styles.amountCol, styles.amount]}>
                ₹ {myConsumption.amount}
              </Text>
            </View>

            {/* 👥 OTHERS (READ ONLY) */}
            {item.consumption.consumers
              .filter(c => c.person_id !== LOGGED_IN_USER_ID)
              .map(c => {
                const person = bill.people.find(
                  p => p.id === c.person_id
                );
                return (
                  <View key={c.person_id} style={[styles.rowBase, styles.mylockRow]}>
                    <Text style={[styles.nameCol, styles.otherName]}>
                      {person.name}
                    </Text>

                    <Text style={[styles.qtyCol, styles.lockedQty]}>
                      {c.qty}
                    </Text>

                    <Text style={[styles.amountCol, styles.amount]}>
                      ₹ {c.amount}
                    </Text>
                  </View>
                );
              })}
          </View>
        );
      }}
      ListFooterComponent={
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>You Pay</Text>
            <Text style={styles.bold}>
              ₹ {settlement.myTotal}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Total Bill</Text>
            <Text>₹ {grandTotal}</Text>
          </View>
        </View>
      }
    />
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    margin: 16,
  },
  card: {
    backgroundColor: "#FFF",
    margin: 12,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  // 🔥 Sankar Row
  myRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9F6EF",
    padding: 8,
    borderRadius: 8,
    width: "100%",
    marginVertical: 3,
  },
  mylockRow:{
     flexDirection: "row",
    alignItems: "center", 
    padding: 8,
    borderRadius: 8,
    width: "100%",
    marginVertical: 3,
  },
  youLabel: {
    flex: 1,
    fontWeight: "700",
    color: "#1A9B4B",
  },
  qtyInput: {
    width: 60,
    borderWidth: 1,
    borderColor: "#1A9B4B",
    borderRadius: 6,
    padding: 6,
    textAlign: "center",
    backgroundColor: "#FFF",
  },
  amount: {
    width: 80,
    textAlign: "right",
    fontWeight: "600",
  },

  // 👥 Others
  otherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingLeft: 4,
    width: "100%",
  },
  otherName: {
    flex: 1,
    color: "#666",
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    backgroundColor: "#F8F9FB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  bold: {
    fontWeight: "700",
    fontSize: 16,
  },
  lockedQty: {
    width: 60,
    textAlign: "center",
    color: "#999",
    fontWeight: "600",
    },
    rowBase: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 6,
},

nameCol: {
  flex: 1,
},

qtyCol: {
  width: 70,
  alignItems: "center",
},

amountCol: {
  width: 90,
  alignItems: "flex-end",
},
});