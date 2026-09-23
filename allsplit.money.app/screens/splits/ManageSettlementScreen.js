import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { createdSplitsList, markSettled, reopenShare, sendReminder, updateSplitName } from "../../services/splitService";
import { sendPaymentReminder, sendPaymentReminders } from "../../services/notificationService";
import { createManageSettlementStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/toastService";
import {
  findPersonByPhone,
  getUserDisplayName,
  getUserFirstname,
  getUserLastname,
  getUserMobile,
} from "../../utils/userIdentity";
import { getPersonFullName } from "../../utils/phoneUtils";
import {
  getBillSettlementStatus,
  getPersonOweForSplit,
  getPersonSettlement,
  canCreatorReopenShare,
  canCreatorMarkReceived,
  canCreatorRemind,
  canCreatorEditBill,
  getRemindablePeople,
  isShareReopened,
} from "../../utils/splitStats";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { useHardwareBack } from "../../hooks/useHardwareBack";

function settlementLabel(status, person) {
  if (isShareReopened(person)) {
    return "Reopened";
  }

  switch (status) {
    case "settled":
      return "Received";
    case "pending":
      return "Closed";
    default:
      return "Open";
  }
}

function settlementStyle(status, styles, person) {
  if (isShareReopened(person)) {
    return { pill: styles.statusReopened, text: styles.statusReopenedText };
  }

  switch (status) {
    case "settled":
      return { pill: styles.statusSettled, text: styles.statusSettledText };
    case "pending":
      return { pill: styles.statusClosed, text: styles.statusClosedText };
    default:
      return { pill: styles.statusOpen, text: styles.statusOpenText };
  }
}

export default function ManageSettlementScreen({ route, navigation }) {
  const styles = useThemedStyles(createManageSettlementStyles);
  const { colors } = useAppTheme();
  const initialBill = route?.params?.bill;
  const [bill, setBill] = useState(initialBill);
  const [userMobile, setUserMobileState] = useState(route?.params?.userMobile || "");
  const [loading, setLoading] = useState(false);
  const [settlingPersonId, setSettlingPersonId] = useState("");
  const [reopeningPersonId, setReopeningPersonId] = useState("");
  const [confirmPerson, setConfirmPerson] = useState(null);
  const [reopenPerson, setReopenPerson] = useState(null);
  const [remindingPersonId, setRemindingPersonId] = useState("");
  const [remindingAll, setRemindingAll] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [draftSplitName, setDraftSplitName] = useState("");
  const [savingSplitName, setSavingSplitName] = useState(false);

  const refreshBill = async () => {
    setLoading(true);
    try {
      const mobile = userMobile || (await getUserMobile());
      setUserMobileState(mobile);

      const response = await createdSplitsList({
        device_id: await DeviceInfo.getUniqueId(),
      });

      if (!response.success) {
        return;
      }

      const updated = (response.data || []).find((entry) => entry._id === bill?._id);
      if (updated) {
        setBill(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshBill();
    }, [bill?._id])
  );

  useHardwareBack(
    useCallback(() => {
      if (showRenameModal) {
        if (!savingSplitName) {
          setShowRenameModal(false);
        }
        return true;
      }
      if (confirmPerson) {
        setConfirmPerson(null);
        return true;
      }
      if (reopenPerson) {
        setReopenPerson(null);
        return true;
      }
      goBackOrNavigate(navigation, { screen: "CreatedSplits" });
      return true;
    }, [showRenameModal, savingSplitName, confirmPerson, reopenPerson, navigation])
  );

  const participants = useMemo(() => {
    return (bill?.people ?? []).filter(
      (person) => !findPersonByPhone([person], userMobile)
    );
  }, [bill?.people, userMobile]);

  const billStatus = getBillSettlementStatus(bill, userMobile);
  const actionBusy =
    !!settlingPersonId || !!reopeningPersonId || !!remindingPersonId || remindingAll;
  const remindablePeople = useMemo(
    () => getRemindablePeople(bill, userMobile),
    [bill, userMobile]
  );

  const openRenameModal = () => {
    setDraftSplitName(bill?.split_name || "");
    setShowRenameModal(true);
  };

  const openEditBill = () => {
    if (!bill) {
      return;
    }

    if (!canCreatorEditBill(bill, userMobile)) {
      openRenameModal();
      showToast(
        "info",
        "Rename only",
        "Someone already closed their share. You can still rename this bill."
      );
      return;
    }

    navigation.navigate("Details", {
      mode: "edit",
      billId: bill._id,
      editBill: bill,
      returnScreen: "ManageSettlement",
      selectedPeople: bill.people || [],
      Items: (bill.items || []).map((entry) => ({
        id: entry.id,
        name: entry.name,
        qty: entry.qty,
        price: entry.price,
        split: entry.split_type === "equal" ? "equal" : "consumption",
      })),
      split_name: bill.split_name || "",
    });
  };

  const confirmRenameSplit = async () => {
    const nextName = String(draftSplitName || "").trim();
    if (!nextName) {
      showToast("danger", "Bill name required", "Enter a name for this bill");
      return;
    }

    if (nextName === String(bill?.split_name || "").trim()) {
      setShowRenameModal(false);
      return;
    }

    try {
      setSavingSplitName(true);
      const response = await updateSplitName({
        id: bill._id,
        split_name: nextName,
      });

      if (!response.success) {
        showToast(
          "danger",
          "Could not rename",
          response.message || response.detail || "Try again"
        );
        return;
      }

      setBill((prev) => ({
        ...prev,
        split_name: response.split_name || nextName,
      }));
      setShowRenameModal(false);
      showToast("info", "Bill renamed", "Bill name has been updated");
    } catch (error) {
      showToast("danger", "Could not rename", "Try again");
    } finally {
      setSavingSplitName(false);
    }
  };

  const remindPerson = async (person) => {
    if (!person || !bill?._id) {
      return;
    }

    try {
      setRemindingPersonId(person.id);
      const response = await sendReminder({
        id: bill._id,
        person_id: person.id,
      });

      if (!response.success && response.message?.includes("recently")) {
        showToast("info", "Already reminded", response.message);
      }

      const [firstname, lastname] = await Promise.all([
        getUserFirstname(),
        getUserLastname(),
      ]);
      await sendPaymentReminder({
        splitName: bill.split_name,
        person,
        amount: getPersonOweForSplit(bill, person.id),
        creatorName: getUserDisplayName(firstname, lastname),
      });
    } catch (error) {
      showToast("danger", "Reminder failed", "Try again");
    } finally {
      setRemindingPersonId("");
    }
  };

  const remindAll = async () => {
    if (!remindablePeople.length || !bill?._id) {
      return;
    }

    try {
      setRemindingAll(true);
      await sendReminder({ id: bill._id });
      const [firstname, lastname] = await Promise.all([
        getUserFirstname(),
        getUserLastname(),
      ]);
      const amountsByPersonId = {};
      remindablePeople.forEach((person) => {
        amountsByPersonId[person.id] = getPersonOweForSplit(bill, person.id);
      });
      await sendPaymentReminders({
        splitName: bill.split_name,
        people: remindablePeople,
        amountsByPersonId,
        creatorName: getUserDisplayName(firstname, lastname),
      });
    } finally {
      setRemindingAll(false);
    }
  };

  const confirmMarkSettled = async () => {
    if (!confirmPerson || !bill?._id) {
      return;
    }

    try {
      setSettlingPersonId(confirmPerson.id);
      const response = await markSettled({
        id: bill._id,
        person_id: confirmPerson.id,
      });

      if (!response.success) {
        showToast("danger", "Could not mark received", response.message || response.detail || "Try again");
        return;
      }

      if (response.updated_doc) {
        setBill(response.updated_doc);
      } else {
        await refreshBill();
      }

      showToast("info", "Payment received", `${getPersonFullName(confirmPerson)} marked as received`);
      setConfirmPerson(null);
    } catch (error) {
      showToast("danger", "Error", "Failed to mark payment as received");
    } finally {
      setSettlingPersonId("");
    }
  };

  const confirmReopenShare = async () => {
    if (!reopenPerson || !bill?._id) {
      return;
    }

    try {
      setReopeningPersonId(reopenPerson.id);
      const response = await reopenShare({
        id: bill._id,
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
        setBill(response.updated_doc);
      } else {
        await refreshBill();
      }

      showToast(
        "info",
        "Share reopened",
        `${getPersonFullName(reopenPerson)} can review and close their share again.`
      );
      setReopenPerson(null);
    } catch (error) {
      showToast("danger", "Error", "Failed to reopen share");
    } finally {
      setReopeningPersonId("");
    }
  };

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => goBackOrNavigate(navigation, { screen: "CreatedSplits" })}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collect Payments</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={openEditBill}
          accessibilityLabel="Edit bill"
        >
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryTitle} numberOfLines={1}>
          {bill.split_name || "Untitled split"}
        </Text>
        <Text style={styles.summaryMeta}>{billStatus.replace(/_/g, " ")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        ) : null}

        {remindablePeople.length > 0 ? (
          <TouchableOpacity
            style={[styles.remindAllBtn, actionBusy && styles.iconActionBtnDisabled]}
            onPress={remindAll}
            disabled={actionBusy}
          >
            {remindingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="notifications-outline" size={16} color={colors.primary} />
            )}
            <Text style={styles.remindAllText}>
              Remind all ({remindablePeople.length})
            </Text>
          </TouchableOpacity>
        ) : null}

        {participants.length === 0 ? (
          <Text style={styles.emptyText}>No other participants on this bill.</Text>
        ) : (
          participants.map((person) => {
            const settlement = getPersonSettlement(person);
            const pillStyle = settlementStyle(settlement, styles, person);
            const amount = getPersonOweForSplit(bill, person.id);
            const wasReopened = isShareReopened(person);
            const canMarkReceived = canCreatorMarkReceived(bill, userMobile, person);
            const canReopen = canCreatorReopenShare(bill, userMobile, person);
            const canRemind = canCreatorRemind(bill, userMobile, person);
            const isReceiving = settlingPersonId === person.id;
            const isReopening = reopeningPersonId === person.id;
            const isReminding = remindingPersonId === person.id;
            const fullName = getPersonFullName(person);

            return (
              <View
                key={person.id}
                style={[styles.compactRow, wasReopened && styles.compactRowReopened]}
              >
                <View style={[styles.statusDot, pillStyle.pill]} />
                <View style={styles.compactInfo}>
                  <Text style={styles.compactName} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text style={styles.compactMeta}>
                    {settlementLabel(settlement, person)} · ₹{amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.compactActions}>
                  {canRemind ? (
                    <TouchableOpacity
                      style={[
                        styles.textActionBtn,
                        actionBusy && styles.iconActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      onPress={() => remindPerson(person)}
                      accessibilityLabel={`Remind ${fullName}`}
                    >
                      {isReminding ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={styles.textActionLabel}>Remind</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}

                  {canMarkReceived ? (
                    <TouchableOpacity
                      style={[
                        styles.textActionBtn,
                        styles.textActionBtnPrimary,
                        actionBusy && styles.iconActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      activeOpacity={0.7}
                      onPress={() => setConfirmPerson(person)}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${fullName} as received`}
                    >
                      {isReceiving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.textActionLabelPrimary}>Received</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}

                  {canReopen ? (
                    <TouchableOpacity
                      style={[
                        styles.textActionBtn,
                        actionBusy && styles.iconActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      activeOpacity={0.7}
                      onPress={() => setReopenPerson(person)}
                      accessibilityRole="button"
                      accessibilityLabel={`Reopen ${fullName}'s share`}
                    >
                      {isReopening ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={styles.textActionLabel}>Reopen</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        transparent
        visible={!!confirmPerson}
        animationType="fade"
        onRequestClose={() => !settlingPersonId && setConfirmPerson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mark as received</Text>
            <Text style={styles.modalMessage}>
              Confirm ₹{getPersonOweForSplit(bill, confirmPerson?.id).toFixed(2)} received
              from {getPersonFullName(confirmPerson)}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setConfirmPerson(null)}
                disabled={!!settlingPersonId}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmMarkSettled}
                disabled={!!settlingPersonId}
              >
                <Text style={styles.modalConfirmText}>
                  {settlingPersonId ? "Saving..." : "Mark received"}
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
        onRequestClose={() => !reopeningPersonId && setReopenPerson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reopen share</Text>
            <Text style={styles.modalMessage}>
              Reopen {getPersonFullName(reopenPerson)}&apos;s share of ₹
              {getPersonOweForSplit(bill, reopenPerson?.id).toFixed(2)}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setReopenPerson(null)}
                disabled={!!reopeningPersonId}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReopenShare}
                disabled={!!reopeningPersonId}
              >
                <Text style={styles.modalConfirmText}>
                  {reopeningPersonId ? "Reopening..." : "Reopen"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showRenameModal}
        animationType="fade"
        onRequestClose={() => !savingSplitName && setShowRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit bill name</Text>
            <TextInput
              style={styles.renameInput}
              value={draftSplitName}
              onChangeText={setDraftSplitName}
              placeholder="Bill name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              maxLength={120}
              editable={!savingSplitName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                disabled={savingSplitName}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRenameSplit}
                disabled={savingSplitName}
              >
                <Text style={styles.modalConfirmText}>
                  {savingSplitName ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
