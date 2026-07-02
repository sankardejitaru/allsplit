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
import { createdSplitsList, markSettled } from "../../services/splitService";
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
} from "../../utils/splitStats";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { useHardwareBack } from "../../hooks/useHardwareBack";

function settlementLabel(status) {
  switch (status) {
    case "settled":
      return "Settled";
    case "pending":
      return "Closed";
    default:
      return "Open";
  }
}

function settlementStyle(status, styles) {
  switch (status) {
    case "settled":
      return { pill: styles.statusSettled, text: { color: "#0f5132" } };
    case "pending":
      return { pill: styles.statusClosed, text: { color: "#175cd3" } };
    default:
      return { pill: styles.statusOpen, text: { color: "#b54708" } };
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
  const [confirmPerson, setConfirmPerson] = useState(null);

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
      goBackOrNavigate(navigation, { screen: "CreatedSplits" });
      return true;
    }, [confirmPerson, navigation])
  );

  const participants = useMemo(() => {
    return (bill?.people ?? []).filter(
      (person) => !findPersonByPhone([person], userMobile)
    );
  }, [bill?.people, userMobile]);

  const billStatus = getBillSettlementStatus(bill, userMobile);

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
        showToast("danger", "Could not mark settled", response.message || response.detail || "Try again");
        return;
      }

      if (response.updated_doc) {
        setBill(response.updated_doc);
      } else {
        await refreshBill();
      }

      showToast("info", "Payment received", `${confirmPerson.name} marked as settled`);
      setConfirmPerson(null);
    } catch (error) {
      showToast("danger", "Error", "Failed to mark payment as received");
    } finally {
      setSettlingPersonId("");
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

      <ScrollView>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{bill.split_name || "Untitled split"}</Text>
          <Text style={styles.summaryMeta}>
            Bill status: {billStatus.replace(/_/g, " ")}
          </Text>
          <Text style={styles.summaryMeta}>
            Mark participants as paid after they close their share.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Participants</Text>

        {participants.length === 0 ? (
          <Text style={styles.emptyText}>No other participants on this bill.</Text>
        ) : (
          participants.map((person) => {
            const settlement = getPersonSettlement(person);
            const pillStyle = settlementStyle(settlement, styles);
            const amount = getPersonOweForSplit(bill, person.id);
            const canMarkSettled = settlement === "pending";
            const isSubmitting = settlingPersonId === person.id;

            return (
              <View key={person.id} style={styles.participantCard}>
                <View style={styles.participantRow}>
                  <Text style={styles.participantName}>{person.name}</Text>
                  <Text style={styles.participantAmount}>₹{amount.toFixed(2)}</Text>
                </View>

                <View style={styles.participantMeta}>
                  <View style={[styles.statusPill, pillStyle.pill]}>
                    <Text style={[styles.statusPillText, pillStyle.text]}>
                      {settlementLabel(settlement)}
                    </Text>
                  </View>

                  {canMarkSettled ? (
                    <TouchableOpacity
                      style={[
                        styles.settleButton,
                        isSubmitting && styles.settleButtonDisabled,
                      ]}
                      disabled={isSubmitting}
                      onPress={() => setConfirmPerson(person)}
                    >
                      <Text style={styles.settleButtonText}>
                        {isSubmitting ? "Saving..." : "Mark as paid"}
                      </Text>
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
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.white, borderRadius: 14, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>
              Confirm payment received
            </Text>
            <Text style={{ color: colors.textMuted, marginBottom: 20 }}>
              Mark {confirmPerson?.name}&apos;s share of ₹
              {getPersonOweForSplit(bill, confirmPerson?.id).toFixed(2)} as paid?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setConfirmPerson(null)}
                disabled={!!settlingPersonId}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmMarkSettled}
                disabled={!!settlingPersonId}
              >
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {settlingPersonId ? "Saving..." : "Mark as paid"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
