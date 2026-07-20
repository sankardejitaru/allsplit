import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { createdSplitsList, markSettled, reopenShare } from "../../services/splitService";
import { createManageSettlementStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/toastService";
import {
  findPersonByPhone,
  getUserMobile,
} from "../../utils/userIdentity";
import {
  getBillSettlementStatus,
  getPersonOweForSplit,
  getPersonSettlement,
  canCreatorReopenShare,
  canCreatorMarkReceived,
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
    }, [confirmPerson, reopenPerson, navigation])
  );

  const participants = useMemo(() => {
    return (bill?.people ?? []).filter(
      (person) => !findPersonByPhone([person], userMobile)
    );
  }, [bill?.people, userMobile]);

  const billStatus = getBillSettlementStatus(bill, userMobile);
  const actionBusy = !!settlingPersonId || !!reopeningPersonId;

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

      showToast("info", "Payment received", `${confirmPerson.name} marked as received`);
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
        `${reopenPerson.name} can review and close their share again.`
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
        <View style={{ width: 40 }} />
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
            const isReceiving = settlingPersonId === person.id;
            const isReopening = reopeningPersonId === person.id;

            return (
              <View
                key={person.id}
                style={[styles.compactRow, wasReopened && styles.compactRowReopened]}
              >
                <View style={[styles.statusDot, pillStyle.pill]} />
                <View style={styles.compactInfo}>
                  <Text style={styles.compactName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.compactMeta}>
                    {settlementLabel(settlement, person)} · ₹{amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.compactActions}>
                  {canMarkReceived ? (
                    <TouchableOpacity
                      style={[
                        styles.iconActionBtn,
                        styles.iconActionBtnPrimary,
                        actionBusy && styles.iconActionBtnDisabled,
                      ]}
                      disabled={actionBusy}
                      activeOpacity={0.7}
                      onPress={() => setConfirmPerson(person)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${person.name} as received`}
                    >
                      {isReceiving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Ionicons name="checkmark" size={15} color={colors.white} />
                      )}
                    </TouchableOpacity>
                  ) : null}

                  {canReopen ? (
                    <TouchableOpacity
                      style={[
                        styles.iconActionBtn,
                        actionBusy && styles.iconActionBtnDisabled,
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
              from {confirmPerson?.name}?
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
              Reopen {reopenPerson?.name}&apos;s share of ₹
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
    </SafeAreaView>
  );
}
