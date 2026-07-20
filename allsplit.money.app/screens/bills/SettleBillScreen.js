import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../utils/toastService";
import { MyOwePrizeUpdate, closebill, reopenShare, markSettled } from "../../services/splitService";
import { findPersonByPhone, getUserMobile } from "../../utils/userIdentity";
import {
  isUserBillClosed,
  isSplitCreator,
  haveAllOthersClosedShare,
  canCreatorReopenShare,
  canCreatorMarkReceived,
  getPersonSettlement,
  getPersonOweForSplit,
  isShareReopened,
} from "../../utils/splitStats";
import { createSettleBillStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate, resetToScreen } from "../../utils/navigationHelpers";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../context/ThemeContext";

function isConsumptionItem(item) {
  return !item?.split_type || item.split_type === "consumption";
}

function participantStatusStyle(person) {
  if (isShareReopened(person)) {
    return "reopened";
  }

  const settlement = getPersonSettlement(person);
  switch (settlement) {
    case "settled":
      return "settled";
    case "pending":
      return "closed";
    default:
      return "open";
  }
}

export default function SettleBillScreen({ route, navigation }) {
  const styles = useThemedStyles(createSettleBillStyles);
  const { colors } = useAppTheme();
  const initialBill = route?.params?.bill;
  const [billData, setBillData] = useState(initialBill);
  const routeMyPersonId = route?.params?.myPersonId ?? "";
  const [userMobile, setUserMobile] = useState("");
  const [items, setItems] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [closingBill, setClosingBill] = useState(false);
  const [savingBill, setSavingBill] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [reopenPerson, setReopenPerson] = useState(null);
  const [reopeningShare, setReopeningShare] = useState(false);
  const [receivePerson, setReceivePerson] = useState(null);
  const [markingReceived, setMarkingReceived] = useState(false);

  const myPerson = useMemo(
    () => findPersonByPhone(billData?.people ?? [], userMobile),
    [billData?.people, userMobile]
  );
  const myPersonId = routeMyPersonId || myPerson?.id || "";
  const isBillCreator = useMemo(
    () => isSplitCreator(billData, userMobile),
    [billData, userMobile]
  );
  const canShowCloseButton = useMemo(() => {
    if (!myPersonId || isClosed) {
      return false;
    }
    if (isBillCreator) {
      return haveAllOthersClosedShare(billData, userMobile);
    }
    return true;
  }, [myPersonId, isClosed, isBillCreator, billData, userMobile]);

  const canEditConsumer = useCallback(
    (personId, item) => {
      if (!isConsumptionItem(item)) {
        return false;
      }
      if (isBillCreator) {
        return true;
      }
      if (personId === myPersonId && isClosed) {
        return false;
      }
      return personId === myPersonId;
    },
    [isBillCreator, isClosed, myPersonId]
  );

  const myShareReopened = useMemo(
    () => isShareReopened(myPerson),
    [myPerson]
  );

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
      if (reopenPerson) {
        if (!reopeningShare) {
          setReopenPerson(null);
        }
        return true;
      }
      if (receivePerson) {
        if (!markingReceived) {
          setReceivePerson(null);
        }
        return true;
      }
      if (savingBill) {
        return true;
      }
      handleBack();
      return true;
    }, [showCloseConfirm, closingBill, savingBill, reopenPerson, reopeningShare, receivePerson, markingReceived, handleBack])
  );

  useEffect(() => {
    setBillData(initialBill);
  }, [initialBill]);

  useEffect(() => {
    getUserMobile().then((mobile) => {
      setUserMobile(mobile);
      if (billData) {
        setIsClosed(isUserBillClosed(billData, mobile));
      }
    });
  }, [billData]);

  useEffect(() => {
    if (!billData?.people || !billData?.items) {
      return;
    }

    setItems(
      billData.items.map((item) => ({
        ...item,
        consumption: {
          consumers: billData.people.map((person) => {
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
  }, [billData]);

  const grandTotal = useMemo(() => {
    if (!billData?.items) {
      return 0;
    }

    return billData.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }, [billData?.items]);

  const handleCloseBill = () => {
    if (!myPerson || !billData?._id) {
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

      if (hasUnsavedChanges) {
        const saveResult = await saveAllItems();
        if (!saveResult.success) {
          showToast("danger", "Could not save", saveResult.message);
          return;
        }
        setHasUnsavedChanges(false);
      }

      const response = await closebill({
        id: billData._id,
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

  const updateQty = (itemId, personId, qty) => {
    if (personId === myPersonId && isClosed) {
      return;
    }

    if (!personId) {
      showToast("danger", "Error", "Could not identify the participant on this bill.");
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        let totalQty = 0;
        item.consumption.consumers.forEach((consumer) => {
          if (consumer.person_id === personId) {
            totalQty += Number(qty) || 0;
          } else {
            totalQty += Number(consumer.qty) || 0;
          }
        });

        if (item.qty < totalQty) {
          showToast(
            "danger",
            "Error",
            "Quantity cannot be more than total item quantity"
          );
          return item;
        }

        const parsedQty = Number(qty) || 0;
        const consumers = item.consumption.consumers.map((consumer) =>
          consumer.person_id === personId
            ? {
                ...consumer,
                qty: parsedQty,
                amount: parsedQty * consumer.unit_price,
              }
            : consumer
        );

        return {
          ...item,
          consumption: { consumers },
        };
      })
    );

    setHasUnsavedChanges(true);
  };

  const saveAllItems = async () => {
    const billId = String(billData._id ?? "");
    if (!billId) {
      return { success: false, message: "Bill id is missing." };
    }

    const consumptionItems = items.filter(isConsumptionItem);

    if (consumptionItems.length === 0) {
      return { success: true };
    }

    for (const item of consumptionItems) {
      const consumersToSave = isBillCreator
        ? item.consumption?.consumers ?? []
        : item.consumption?.consumers?.filter(
            (consumer) => consumer.person_id === myPersonId
          ) ?? [];

      for (const consumer of consumersToSave) {
        const unitPrice = Number(consumer.unit_price ?? item.price ?? 0);
        const qty = Number(consumer.qty ?? 0);

        if (!Number.isFinite(unitPrice) || !Number.isFinite(qty)) {
          return {
            success: false,
            message: "Invalid quantity or price on one of the items.",
          };
        }

        const amount = Number((unitPrice * qty).toFixed(2));
        const response = await MyOwePrizeUpdate({
          id: billId,
          item_id: String(item.id ?? ""),
          amount,
          person_id: String(consumer.person_id),
          unit_price: unitPrice,
          qty,
        });

        if (!response.success) {
          return {
            success: false,
            message: response.message || "Quantity exceeds the item limit.",
          };
        }
      }
    }

    return { success: true };
  };

  const handleSaveBill = async () => {
    if (!billData?._id) {
      showToast("danger", "Error", "Bill details are missing.");
      return;
    }

    if (!isBillCreator && !myPersonId) {
      showToast("danger", "Error", "Could not identify your profile on this bill.");
      return;
    }

    if (!isBillCreator && isClosed) {
      showToast("info", "Bill closed", "Your share is already closed.");
      return;
    }

    try {
      setSavingBill(true);
      const result = await saveAllItems();

      if (!result.success) {
        showToast("danger", "Could not save", result.message);
        return;
      }

      setHasUnsavedChanges(false);
      showToast(
        "info",
        "Saved",
        isBillCreator
          ? "Bill quantities have been saved for all participants."
          : "Your share on this bill has been saved."
      );
      resetToScreen(navigation, "MyOwe");
    } catch (error) {
      showToast("danger", "Error", "Failed to save bill.");
    } finally {
      setSavingBill(false);
    }
  };

  const confirmReopenShare = async () => {
    if (!reopenPerson || !billData?._id) {
      return;
    }

    try {
      setReopeningShare(true);
      const response = await reopenShare({
        id: billData._id,
        person_id: reopenPerson.id,
      });

      if (!response.success) {
        showToast(
          "danger",
          "Could not reopen",
          response.message || response.detail || "Try again"
        );
        return;
      }

      if (response.updated_doc) {
        setBillData(response.updated_doc);
      }

      showToast(
        "info",
        "Share reopened",
        `${reopenPerson.name} can review their share and close again.`
      );
      setReopenPerson(null);
    } catch (error) {
      showToast("danger", "Error", "Failed to reopen share.");
    } finally {
      setReopeningShare(false);
    }
  };

  const confirmMarkReceived = async () => {
    if (!receivePerson || !billData?._id) {
      return;
    }

    try {
      setMarkingReceived(true);
      const response = await markSettled({
        id: billData._id,
        person_id: receivePerson.id,
      });

      if (!response.success) {
        showToast(
          "danger",
          "Could not mark received",
          response.message || response.detail || "Try again"
        );
        return;
      }

      if (response.updated_doc) {
        setBillData(response.updated_doc);
      }

      showToast("info", "Payment received", `${receivePerson.name} marked as received.`);
      setReceivePerson(null);
    } catch (error) {
      showToast("danger", "Error", "Failed to mark payment as received.");
    } finally {
      setMarkingReceived(false);
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

  if (!billData?.people || !billData?.items) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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

      {isBillCreator ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.participantsStrip}
          style={styles.participantsStripWrap}
        >
          {(billData.people ?? [])
            .filter((person) => person.id !== myPersonId)
            .map((person) => {
              const statusKey = participantStatusStyle(person);
              const wasReopened = isShareReopened(person);
              const canReopen = canCreatorReopenShare(billData, userMobile, person);
              const canMarkReceived = canCreatorMarkReceived(billData, userMobile, person);
              const isReopening = reopeningShare && reopenPerson?.id === person.id;
              const isReceiving = markingReceived && receivePerson?.id === person.id;
              const actionBusy = reopeningShare || markingReceived;

              return (
                <View
                  key={person.id}
                  style={[styles.participantChip, styles[`chip_${statusKey}`]]}
                >
                  {wasReopened ? (
                    <Ionicons
                      name="refresh-circle"
                      size={15}
                      color={colors.primary}
                      style={styles.chipReopenedIcon}
                    />
                  ) : (
                    <View style={[styles.statusDot, styles[`dot_${statusKey}`]]} />
                  )}
                  <Text style={styles.chipName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  {wasReopened ? (
                    <Text style={styles.chipReopenedTag}>Reopened</Text>
                  ) : null}
                  {canMarkReceived ? (
                    <TouchableOpacity
                      style={[
                        styles.chipActionBtn,
                        styles.chipActionBtnPrimary,
                        actionBusy && styles.chipActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      activeOpacity={0.7}
                      onPress={() => setReceivePerson(person)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${person.name} as received`}
                    >
                      {isReceiving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color={colors.white}
                        />
                      )}
                    </TouchableOpacity>
                  ) : null}
                  {canReopen ? (
                    <TouchableOpacity
                      style={[
                        styles.chipActionBtn,
                        actionBusy && styles.chipActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      activeOpacity={0.7}
                      onPress={() => setReopenPerson(person)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Reopen ${person.name}'s share`}
                    >
                      {isReopening ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons
                          name="refresh-outline"
                          size={15}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
        </ScrollView>
      ) : null}

      {myShareReopened ? (
        <View style={styles.reopenedBanner}>
          <Ionicons name="refresh-circle" size={16} color={colors.primary} />
          <Text style={styles.reopenedBannerText}>
            Your share was reopened. Review quantities and close again when ready.
          </Text>
        </View>
      ) : null}

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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>
              {item.name} (₹{item.price * item.qty})
            </Text>

            {item.consumption.consumers.map((consumer) => {
              const person = billData.people.find(
                (participant) => participant.id === consumer.person_id
              );
              const isYou = consumer.person_id === myPersonId;
              const editable = canEditConsumer(consumer.person_id, item);

              return (
                <View
                  key={consumer.person_id}
                  style={[styles.rowBase, isYou ? styles.myRow : styles.mylockRow]}
                >
                  <Text
                    style={[
                      styles.nameCol,
                      isYou ? styles.youLabel : styles.otherName,
                    ]}
                  >
                    {isYou ? "You" : person?.name ?? "Guest"}
                  </Text>

                  {editable ? (
                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={String(consumer.qty ?? 0)}
                      onChangeText={(value) =>
                        updateQty(item.id, consumer.person_id, value)
                      }
                    />
                  ) : (
                    <Text style={[styles.qtyCol, styles.lockedQty]}>
                      {consumer.qty ?? 0}
                    </Text>
                  )}

                  <Text style={[styles.amountCol, styles.amount]}>
                    ₹ {(consumer.amount ?? 0).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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

        {((!isClosed && myPersonId) || isBillCreator) ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (savingBill || closingBill) && styles.actionButtonDisabled,
              ]}
              onPress={handleSaveBill}
              disabled={savingBill || closingBill}
            >
              <Text style={styles.saveButtonText}>
                {savingBill ? "Saving..." : "Save bill"}
              </Text>
            </TouchableOpacity>

            {canShowCloseButton ? (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  (closingBill || savingBill) && styles.actionButtonDisabled,
                ]}
                onPress={handleCloseBill}
                disabled={closingBill || savingBill}
              >
                <Text style={styles.closeButtonText}>
                  {closingBill ? "Closing..." : "Close my share"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
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
              {hasUnsavedChanges
                ? "Your latest quantities will be saved, then your share will be closed. You will not be able to edit after closing."
                : "Confirm your share on this bill? You will not be able to edit quantities after closing."}
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

      <Modal
        transparent
        visible={!!reopenPerson}
        animationType="fade"
        onRequestClose={() => !reopeningShare && setReopenPerson(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Reopen share</Text>
            <Text style={styles.confirmMessage}>
              Reopen {reopenPerson?.name}&apos;s share so they can review quantities
              and close again? Any payment confirmation will be cleared.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setReopenPerson(null)}
                disabled={reopeningShare}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmPrimaryButton,
                  reopeningShare && styles.closeButtonDisabled,
                ]}
                onPress={confirmReopenShare}
                disabled={reopeningShare}
              >
                <Text style={styles.confirmPrimaryText}>
                  {reopeningShare ? "Reopening..." : "Reopen share"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={!!receivePerson}
        animationType="fade"
        onRequestClose={() => !markingReceived && setReceivePerson(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Mark as received</Text>
            <Text style={styles.confirmMessage}>
              Confirm payment of ₹
              {getPersonOweForSplit(billData, receivePerson?.id).toFixed(2)} received
              from {receivePerson?.name}?
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setReceivePerson(null)}
                disabled={markingReceived}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmPrimaryButton,
                  markingReceived && styles.closeButtonDisabled,
                ]}
                onPress={confirmMarkReceived}
                disabled={markingReceived}
              >
                <Text style={styles.confirmPrimaryText}>
                  {markingReceived ? "Saving..." : "Mark received"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
