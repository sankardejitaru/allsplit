import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createAuditLogStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { getUserMobile } from "../../utils/userIdentity";
import { showToast } from "../../utils/toastService";
import { AUDIT_CATEGORIES, listAuditLogs } from "../../services/auditService";

const PAGE_SIZE = 40;

function formatTimestamp(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDetails(details) {
  if (!details || Object.keys(details).length === 0) {
    return null;
  }

  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

function AuditLogItem({ item, styles, colors }) {
  const isSuccess = item.status === "success";
  const detailsText = formatDetails(item.details);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.actionText}>{item.action}</Text>
        <View
          style={[
            styles.statusBadge,
            isSuccess ? styles.statusSuccess : styles.statusFailure,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isSuccess ? styles.statusTextSuccess : styles.statusTextFailure,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {item.message ? <Text style={styles.messageText}>{item.message}</Text> : null}

      <View style={styles.metaRow}>
        <Text style={styles.metaPill}>{item.category}</Text>
        {item.method ? <Text style={styles.metaPill}>{item.method}</Text> : null}
        {item.status_code ? (
          <Text style={styles.metaPill}>HTTP {item.status_code}</Text>
        ) : null}
        {item.duration_ms != null ? (
          <Text style={styles.metaPill}>{item.duration_ms} ms</Text>
        ) : null}
      </View>

      <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>

      {detailsText ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>{detailsText}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AuditLogScreen({ navigation }) {
  const styles = useThemedStyles(createAuditLogStyles);
  const { colors } = useAppTheme();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLogs = async ({ reset = false } = {}) => {
    const mobile = await getUserMobile();
    const skip = reset ? 0 : logs.length;

    const res = await listAuditLogs({
      mobile: mobile || undefined,
      category,
      limit: PAGE_SIZE,
      skip,
    });

    if (!res?.success) {
      showToast("danger", "Could not load logs", res?.message || "Try again");
      return false;
    }

    const nextLogs = reset ? res.logs || [] : [...logs, ...(res.logs || [])];
    setLogs(nextLogs);
    setTotal(res.total ?? nextLogs.length);
    return true;
  };

  const loadInitial = async () => {
    setLoading(true);
    try {
      await fetchLogs({ reset: true });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [category])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLogs({ reset: true });
    } finally {
      setRefreshing(false);
    }
  };

  const onLoadMore = async () => {
    if (loadingMore || loading || logs.length >= total) {
      return;
    }

    setLoadingMore(true);
    try {
      await fetchLogs({ reset: false });
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <View style={styles.chipRow}>
          {AUDIT_CATEGORIES.map((item) => {
            const active = category === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(item.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {total} event{total === 1 ? "" : "s"}
        </Text>
        {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={colors.muted} />
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptySubtitle}>
                Actions you take in the app will appear here.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={colors.primary}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AuditLogItem item={item} styles={styles} colors={colors} />
        )}
      />
    </SafeAreaView>
  );
}
