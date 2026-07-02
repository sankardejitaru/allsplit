import React, { useState,useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { MyOwePrizeUpdate, closebill } from "../../services/splitService";
import { createViewmyoweStyle } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showToast } from "../../utils/toastService";



export default function ViewMyOweScreen({ route, navigation }) {
  const styles = useThemedStyles(createViewmyoweStyle);
  const { finalPayload } = route.params;
  

  // ✅ Keep participants in local state
  const [participants, setParticipants] = useState([]);
  const [tempPrice, setTempPrice] = useState();
  const [Name, setName] = useState(finalPayload.consolidated.participants[0].name);

  useEffect(() => {
    // Deep clone to avoid mutating route.params
    const cloned = JSON.parse(JSON.stringify(finalPayload.consolidated.participants));
    setParticipants(cloned);
  }, [finalPayload]);

  const handlePriceChange = (participantIndex, itemIndex, newPrice) => {
    const updated = [...participants];
    updated[participantIndex].items[itemIndex].price = parseFloat(newPrice) || 0;
    setParticipants(updated);
    setTempPrice(newPrice);
  };
  const handleSave = async (participantIndex, itemIndex) => {
     const finalPayload1 = {
      "id": finalPayload._id,
      "participant_name": finalPayload.consolidated.participants[participantIndex].name,
      "item_id": finalPayload.consolidated.participants[participantIndex].items[itemIndex].item_id,
      "new_price": tempPrice
    };
    
    
      const response = await MyOwePrizeUpdate(finalPayload1); 
      if(!response.success) {
        showToast('danger', 'WARNING!', 'Item price is exceed the limit.');
        handlePriceChange(participantIndex, itemIndex, response.message);
      }
  };

  const btnclosebill = async () => {
    const matchedPerson = finalPayload.people?.find(
      (person) => person.name === Name
    );
    const finalPayload1 = {
      id: finalPayload._id,
      participant_name: Name,
      person_id: matchedPerson?.id,
    };
    const response = await closebill(finalPayload1);
    
    if(!response.success) {
      showToast('danger', 'WARNING!', 'Something went wrong.');
      return;
    }
    showToast('info', 'SUCCESS!', 'Bill closed successfully.');
    navigation.navigate('MyOwe');
  };

  const renderParticipant = ({ item, index: participantIndex }) => {
    // Calculate total dynamically
     
    const total = item.items.reduce((sum, entry) => {
      sum = 0;
      
      {finalPayload.items.map(i => {
        if(i.item_id === entry.item_id) {
          if(entry.price !== undefined) {
            i.price = entry.price;
            
          }
          //i.price = entry.price;
        }
        sum = sum + (parseFloat(i.price) || 0)
         
      })}
      //itemDetail.price = parseFloat(entry.price) || 0;
      return sum;
    }, 0);

    return (
      <View style={styles.participantCard}>
        <View style={styles.participantHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.participantName}>{item.name}</Text>
            <Text style={styles.participantPhone}>{item.contact}</Text>
          </View>
        </View>

        <View style={styles.divider} />

          
        {item.items.map((entry, itemIndex) => {
          const itemDetail = finalPayload.items.find(i => i.item_id === entry.item_id);

          return (
            <View key={itemIndex} style={styles.itemRow}>
              <Text style={styles.itemDescription}>{itemDetail?.description}</Text>
              <View>
                {itemDetail?.is_split_equal ? (
                  <MaterialCommunityIcons name="equal" size={12} color="black" />
                ) : (
                  <MaterialCommunityIcons name="not-equal" size={12} color="black" />
                )}
              </View>

              {finalPayload.consolidated.participants.map((participant, pIndex) => (
                <View key={pIndex} style={{ marginLeft: 10 }}>
                  {participant.items.map((pItem, piIndex) => {
                    if (pItem.item_id === entry.item_id) {
                      return (
                        <TextInput
                          key={piIndex}   // ✅ add a unique key here
                          style={itemDetail?.is_split_equal===true ? styles.itemPriceimmuted : styles.itemPrice}
                          value={entry.price ? entry.price.toString() : ''}
                          editable={!itemDetail?.is_split_equal ?? false}
                          keyboardType="decimal-pad"
                          inputMode="decimal"
                          onChangeText={(text) =>
                            handlePriceChange(pIndex, itemIndex, text)
                          }
                          onBlur={() =>
                            handleSave(pIndex, itemIndex)
                          }
                        />
                      );
                    }
                    return null;
                  })}
                </View>
              ))}
            </View>
          );
        })}


        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.itemDescription}>Total</Text>
          <Text>{Number(total).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Owe Details</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Split Name</Text>
        <Text style={styles.summaryValue}>{finalPayload.split_name}</Text>
        <Text style={styles.metaDate}>Created: {new Date(finalPayload.meta.created_at).toLocaleDateString()}</Text>
      </View>

      <FlatList
        data={participants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderParticipant}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.closeButton} onPress={btnclosebill}>
        <Text style={styles.closeButtonText}>Close Bill</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

 