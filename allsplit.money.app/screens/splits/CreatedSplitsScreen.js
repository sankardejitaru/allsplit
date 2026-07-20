import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { createdSplitsList } from "../../services/splitService";
import { createCreatedSplitsStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import {
  countPendingSettlements,
  getBillSettlementStatus,
  getCreatorNetDueSummary,
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

  const renderItem = ({ item }) => {
    const billStatus = getBillSettlementStatus(item, userMobile);
    const badgeStyles = statusStyle(billStatus, styles);
    const pendingCount = countPendingSettlements(item, userMobile);
    const netDue = getCreatorNetDueSummary(item, userMobile);
    const netDueBreakdown = formatNetDueBreakdown(netDue);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ManageSettlement", {
            bill: item,
            userMobile,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.splitName}>{item.split_name || "Untitled split"}</Text>
          <View style={[styles.statusBadge, badgeStyles.badge]}>
            <Text style={[styles.statusText, badgeStyles.text]}>
              {statusLabel(billStatus)}
            </Text>
          </View>
        </View>

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
    </SafeAreaView>
  );
}
