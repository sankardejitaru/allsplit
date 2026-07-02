import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../utils/toastService";
import { MyOwePrizeUpdate, closebill } from "../../services/splitService";
import { findPersonByPhone, getUserMobile } from "../../utils/userIdentity";
import { isUserBillClosed } from "../../utils/splitStats";
import { createSettleBillStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate, resetToScreen } from "../../utils/navigationHelpers";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../context/ThemeContext";

export default function SettleBillScreen({ route, navigation }) {
  const styles = useThemedStyles(createSettleBillStyles);
  const { colors } = useAppTheme();
  const bill = route?.params?.bill;
  const routeMyPersonId = route?.params?.myPersonId ?? "";
  const [userMobile, setUserMobile] = useState("");
  const [items, setItems] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [closingBill, setClosingBill] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const myPerson = useMemo(
    () => findPersonByPhone(bill?.people ?? [], userMobile),
    [bill?.people, userMobile]
  );
  const myPersonId = routeMyPersonId || myPerson?.id || "";

  const handleBack = useCallback(() => {
    goBackOrNavigate(navigation, { screen: "MyOwe" });
  }, [navigation]);

  useHardwareBack(
    useCallback(() => {
      if (showCloseConfirm) {
        if (!closingBill) {
          setShowCloseConfirm(false);
        }
        return true;
      }
      handleBack();
      return true;
    }, [showCloseConfirm, closingBill, handleBack])
  );

  useEffect(() => {
    getUserMobile().then((mobile) => {
      setUserMobile(mobile);
      if (bill) {
        setIsClosed(isUserBillClosed(bill, mobile));
      }
    });
  }, [bill]);

  useEffect(() => {
    if (!bill?.people || !bill?.items) {
      return;
    }

    setItems(
      bill.items.map((item) => ({
        ...item,
        consumption: {
          consumers: bill.people.map((person) => {
            const existing = item.consumption?.consumers?.find(
              (consumer) => consumer.person_id === person.id
            );
            const qty = existing?.qty || 0;

            return {
              person_id: person.id,
              qty,
              unit_price: item.price,
              amount: qty * item.price,
            };
          }),
        },
      }))
    );
  }, [bill]);

  const grandTotal = useMemo(() => {
    if (!bill?.items) {
      return 0;
    }

    return bill.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }, [bill?.items]);

  const handleCloseBill = () => {
    if (!myPerson || !bill?._id) {
      showToast("danger", "Error", "Could not identify your profile on this bill.");
      return;
    }

    if (isClosed) {
      showToast("info", "Already closed", "This bill is already closed for you.");
      return;
    }

    setShowCloseConfirm(true);
  };

  const confirmCloseBill = async () => {
    try {
      setClosingBill(true);
      const response = await closebill({
        id: bill._id,
        participant_name: myPerson.name,
        person_id: myPersonId,
      });

      if (!response.success) {
        showToast(
          "danger",
          "Error",
          response.message || response.detail || "Failed to close your share."
        );
        return;
      }

      setShowCloseConfirm(false);
      setIsClosed(true);
      showToast("info", "Success", "Your share is closed. Waiting for creator to confirm payment.");
      resetToScreen(navigation, "MyOwe");
    } catch (error) {
      showToast("danger", "Error", "Failed to close bill.");
    } finally {
      setClosingBill(false);
    }
  };

  const updateQty = (itemId, qty) => {
    if (isClosed) {
      return;
    }

    if (!myPersonId) {
      showToast("danger", "Error", "Could not identify your profile on this bill.");
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        let currentQty = 0;
        item.consumption.consumers.forEach((consumer) => {
          if (consumer.person_id !== myPersonId) {
            currentQty += +consumer.qty;
          } else {
            currentQty += +qty;
          }
        });

        if (item.qty < currentQty) {
          showToast(
            "danger",
            "Error",
            "Quantity cannot be more than total item quantity"
          );
          qty = "00";
        }

        const consumers = item.consumption.consumers.map((consumer) =>
          consumer.person_id === myPersonId
            ? {
                ...consumer,
                qty: Number(qty) || 0,
                amount: (Number(qty) || 0) * consumer.unit_price,
              }
            : consumer
        );

        consumers.forEach((consumer) => {
          if (consumer.person_id === myPersonId) {
            const finalPayload = {
              id: bill._id,
              item_id: item.id,
              amount: parseFloat(consumer.unit_price * qty),
              person_id: myPersonId,
              unit_price: parseFloat(consumer.unit_price),
              qty: qty !== "" ? parseInt(qty, 10) : 0,
            };

            if (qty !== "" && !isNaN(qty)) {
              handleSave(finalPayload);
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

  const handleSave = async (finalPayload) => {
    const response = await MyOwePrizeUpdate(finalPayload);
    if (!response.success) {
      showToast("danger", "WARNING!", "Item price is exceed the limit.");
    }
  };

  const settlement = useMemo(() => {
    if (!myPersonId) {
      return { myTotal: 0 };
    }

    let myTotal = 0;

    items.forEach((item) => {
      item.consumption.consumers.forEach((consumer) => {
        if (consumer.person_id === myPersonId) {
          myTotal += consumer.amount;
        }
      });
    });

    return { myTotal };
  }, [items, myPersonId]);

  if (!bill?.people || !bill?.items) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A9B4B" />
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Settle Bill</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isClosed ? (
        <Text style={styles.closedBanner}>Your share on this bill is closed.</Text>
      ) : null}

      {!myPersonId ? (
        <Text style={styles.warningText}>
          Your phone number is not listed on this bill, so your share cannot be shown.
        </Text>
      ) : null}

      <FlatList
        style={styles.container}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isEditable = item.split_type === "consumption";
          const myConsumption = item.consumption.consumers.find(
            (consumer) => consumer.person_id === myPersonId
          );

          return (
            <View style={styles.card}>
              <Text style={styles.itemName}>
                {item.name} (₹{item.price * item.qty})
              </Text>

              <View style={[styles.rowBase, styles.myRow]}>
                <Text style={[styles.nameCol, styles.youLabel]}>You</Text>

                {isEditable && !isClosed ? (
                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="numeric"
                    value={String(myConsumption?.qty ?? 0)}
                    onChangeText={(value) => updateQty(item.id, value)}
                  />
                ) : (
                  <Text style={[styles.qtyCol, styles.lockedQty]}>
                    {myConsumption?.qty ?? 0}
                  </Text>
                )}

                <Text style={[styles.amountCol, styles.amount]}>
                  ₹ {(myConsumption?.amount ?? 0).toFixed(2)}
                </Text>
              </View>

              {item.consumption.consumers
                .filter((consumer) => consumer.person_id !== myPersonId)
                .map((consumer) => {
                  const person = bill.people.find(
                    (participant) => participant.id === consumer.person_id
                  );

                  return (
                    <View
                      key={consumer.person_id}
                      style={[styles.rowBase, styles.mylockRow]}
                    >
                      <Text style={[styles.nameCol, styles.otherName]}>
                        {person?.name ?? "Guest"}
                      </Text>

                      <Text style={[styles.qtyCol, styles.lockedQty]}>
                        {consumer.qty}
                      </Text>

                      <Text style={[styles.amountCol, styles.amount]}>
                        ₹ {consumer.amount.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>You Pay</Text>
          <Text style={styles.bold}>₹ {settlement.myTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text>Total Bill</Text>
          <Text>₹ {grandTotal.toFixed(2)}</Text>
        </View>

        {!isClosed && myPersonId ? (
          <TouchableOpacity
            style={[styles.closeButton, closingBill && styles.closeButtonDisabled]}
            onPress={handleCloseBill}
            disabled={closingBill}
          >
            <Text style={styles.closeButtonText}>
              {closingBill ? "Closing..." : "Close my share"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal
        transparent
        visible={showCloseConfirm}
        animationType="fade"
        onRequestClose={() => !closingBill && setShowCloseConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Close my share</Text>
            <Text style={styles.confirmMessage}>
              Confirm your share on this bill? You will not be able to edit quantities after closing.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setShowCloseConfirm(false)}
                disabled={closingBill}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmPrimaryButton,
                  closingBill && styles.closeButtonDisabled,
                ]}
                onPress={confirmCloseBill}
                disabled={closingBill}
              >
                <Text style={styles.confirmPrimaryText}>
                  {closingBill ? "Closing..." : "Close my share"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
