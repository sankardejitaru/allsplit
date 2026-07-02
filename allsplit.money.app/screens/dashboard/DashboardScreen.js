import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { MyOweList } from "../../services/splitService";
import { createDashboardStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useBrandStatusBar } from "../../hooks/useBrandStatusBar";
import { useAppTheme } from "../../context/ThemeContext";
import { findPersonByPhone, getUserMobile, setUserMobile } from "../../utils/userIdentity";
import {
  getMyOweForSplit,
  summarizeSplits,
} from "../../utils/splitStats";

export default function DashboardScreen({ navigation }) {
  const styles = useThemedStyles(createDashboardStyles);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  useBrandStatusBar();
  const [splits, setSplits] = useState([]);
  const [userMobile, setUserMobileState] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [mobile, deviceId] = await Promise.all([
        getUserMobile(),
        DeviceInfo.getUniqueId(),
      ]);

      setUserMobileState(mobile);

      const response = await MyOweList({ device_id: deviceId });
      const result = response.data ?? [];

      if (response.user_mobile) {
        await setUserMobile(response.user_mobile);
        setUserMobileState(response.user_mobile);
      }

      setSplits(result);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const stats = summarizeSplits(splits, userMobile);
  const recentSplits = splits.slice(0, 5);

  const quickActions = [
    {
      label: "My Splits",
      icon: "receipt-outline",
      onPress: () => navigation.navigate("MyOwe"),
    },
    {
      label: "Collect",
      icon: "cash-outline",
      onPress: () => navigation.navigate("CreatedSplits"),
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.statusBarFill, { height: insets.top }]} />
        <View style={[styles.loadingWrap, { paddingBottom: insets.bottom }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Split bills. Settle easy.</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalSplits}</Text>
              <Text style={styles.statLabel}>Total Splits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.openSplits}</Text>
              <Text style={styles.statLabel}>Open Bills</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{stats.openYouOwe.toFixed(0)}</Text>
              <Text style={styles.statLabel}>You Owe</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Splits</Text>
          {recentSplits.length === 0 ? (
            <Text style={styles.emptyText}>
              No splits yet. Create your first split to get started.
            </Text>
          ) : (
            recentSplits.map((split) => {
              const myOwe = getMyOweForSplit(split, userMobile);
              return (
                <TouchableOpacity
                  key={split._id}
                  style={styles.recentCard}
                  onPress={() =>
                    navigation.navigate("SettleBill", {
                      bill: split,
                      myPersonId: findPersonByPhone(split?.people ?? [], userMobile)?.id,
                    })
                  }
                >
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>{split.split_name}</Text>
                    <Text style={styles.recentAmount}>₹{myOwe.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.recentMeta}>
                    {split?.people?.length ?? 0} people · {split?.items?.length ?? 0} items
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
