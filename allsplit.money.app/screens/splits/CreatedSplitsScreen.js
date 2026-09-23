import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { createdSplitsList, updateSplitName } from "../../services/splitService";
import { createCreatedSplitsStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/toastService";
import {
  countPendingSettlements,
  getBillSettlementStatus,
  getCreatorNetDueSummary,
  canCreatorEditBill,
} from "../../utils/splitStats";
import { goBackOrNavigate } from "../../utils/navigationHelpers";

function formatRupee(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatNetDueBreakdown(netDue) {
  const parts = [];

  if (netDue.pending > 0) {
    parts.push(`${formatRupee(netDue.pending)} pending`);
  }
  if (netDue.received > 0) {
    parts.push(`${formatRupee(netDue.received)} received`);
  }
  if (netDue.open > 0) {
    parts.push(`${formatRupee(netDue.open)} open`);
  }

  return parts.join(" · ");
}

function statusLabel(status) {
  switch (status) {
    case "fully_settled":
      return "Settled";
    case "awaiting_settlement":
      return "Awaiting";
    default:
      return "Active";
  }
}

function statusStyle(status, styles) {
  switch (status) {
    case "fully_settled":
      return {
        badge: styles.statusDone,
        text: styles.statusTextDone,
      };
    case "awaiting_settlement":
      return {
        badge: styles.statusAwaiting,
        text: styles.statusTextAwaiting,
      };
    default:
      return {
        badge: styles.statusActive,
        text: styles.statusTextActive,
      };
  }
}

export default function CreatedSplitsScreen({ navigation }) {
  const styles = useThemedStyles(createCreatedSplitsStyles);
  const { colors } = useAppTheme();
  const [splits, setSplits] = useState([]);
  const [userMobile, setUserMobileState] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [renameSplit, setRenameSplit] = useState(null);
  const [draftSplitName, setDraftSplitName] = useState("");
  const [savingSplitName, setSavingSplitName] = useState(false);

  const fetchCreatedSplits = async () => {
    try {
      const response = await createdSplitsList({
        device_id: await DeviceInfo.getUniqueId(),
      });

      if (!response.success) {
        setSplits([]);
        return;
      }

      setUserMobileState(response.user_mobile || "");
      setSplits(response.data || []);
    } catch (error) {
      console.error("Created splits fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCreatedSplits();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCreatedSplits();
  };

  const openRename = (item) => {
    setRenameSplit(item);
    setDraftSplitName(item?.split_name || "");
  };

  const openEditBill = (item) => {
    if (!canCreatorEditBill(item, userMobile)) {
      openRename(item);
      showToast(
        "info",
        "Rename only",
        "Someone already closed their share. You can still rename this bill."
      );
      return;
    }

    navigation.navigate("Details", {
      mode: "edit",
      billId: item._id,
      editBill: item,
      returnScreen: "CreatedSplits",
      selectedPeople: item.people || [],
      Items: (item.items || []).map((entry) => ({
        id: entry.id,
        name: entry.name,
        qty: entry.qty,
        price: entry.price,
        split: entry.split_type === "equal" ? "equal" : "consumption",
      })),
      split_name: item.split_name || "",
    });
  };

  const confirmRenameSplit = async () => {
    const nextName = String(draftSplitName || "").trim();
    if (!nextName) {
      showToast("danger", "Bill name required", "Enter a name for this bill");
      return;
    }

    if (!renameSplit?._id) {
      return;
    }

    if (nextName === String(renameSplit.split_name || "").trim()) {
      setRenameSplit(null);
      return;
    }

    try {
      setSavingSplitName(true);
      const response = await updateSplitName({
        id: renameSplit._id,
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

      const savedName = response.split_name || nextName;
      setSplits((prev) =>
        prev.map((entry) =>
          entry._id === renameSplit._id ? { ...entry, split_name: savedName } : entry
        )
      );
      setRenameSplit(null);
      showToast("info", "Bill renamed", "Bill name has been updated");
    } catch (error) {
      showToast("danger", "Could not rename", "Try again");
    } finally {
      setSavingSplitName(false);
    }
  };

  const renderItem = ({ item }) => {
    const billStatus = getBillSettlementStatus(item, userMobile);
    const badgeStyles = statusStyle(billStatus, styles);
    const pendingCount = countPendingSettlements(item, userMobile);
    const netDue = getCreatorNetDueSummary(item, userMobile);
    const netDueBreakdown = formatNetDueBreakdown(netDue);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.splitNameWrap}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ManageSettlement", {
                  bill: item,
                  userMobile,
                })
              }
            >
              <Text style={styles.splitName}>{item.split_name || "Untitled split"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editNameBtn}
              onPress={() => openEditBill(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil" size={12} color={colors.primary} />
              <Text style={styles.editNameText}>
                {canCreatorEditBill(item, userMobile) ? "Edit bill" : "Rename"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.statusBadge, badgeStyles.badge]}>
            <Text style={[styles.statusText, badgeStyles.text]}>
              {statusLabel(billStatus)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ManageSettlement", {
              bill: item,
              userMobile,
            })
          }
        >
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {item?.people?.length ?? 0} people
            </Text>
            <Text style={styles.metaText}>
              {item?.items?.length ?? 0} items
            </Text>
            <Text style={styles.metaText}>
              {new Date(item?.meta?.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.netDueRow}>
            <View style={styles.netDueMain}>
              <Text style={styles.netDueLabel}>Net due</Text>
              <Text style={styles.netDueAmount}>{formatRupee(netDue.netDue)}</Text>
            </View>
            {netDueBreakdown ? (
              <Text style={styles.netDueBreakdown}>{netDueBreakdown}</Text>
            ) : null}
          </View>

          {pendingCount > 0 ? (
            <Text style={styles.pendingText}>
              {pendingCount} payment{pendingCount === 1 ? "" : "s"} waiting for confirmation
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => goBackOrNavigate(navigation, { screen: "Dashboard" })}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bills I Created</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={splits}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No bills created by you yet. Start a split from the dashboard.
            </Text>
          }
        />
      )}
      <Modal
        transparent
        visible={!!renameSplit}
        animationType="fade"
        onRequestClose={() => !savingSplitName && setRenameSplit(null)}
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
                onPress={() => setRenameSplit(null)}
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
