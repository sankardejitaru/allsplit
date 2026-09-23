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
import { MyOweList, createdSplitsList } from "../../services/splitService";
import { createDashboardStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useBrandStatusBar } from "../../hooks/useBrandStatusBar";
import { useAppTheme } from "../../context/ThemeContext";
import {
  findPersonByPhone,
  getUserMobile,
  setUserMobile,
  getUserFirstname,
  getUserLastname,
  getUserDisplayName,
  setUserProfile,
} from "../../utils/userIdentity";
import { getProfile } from "../../services/profileService";
import { getPersonFullName } from "../../utils/phoneUtils";
import {
  getMyOweForSplit,
  summarizeSplits,
  summarizeCreatedSplits,
} from "../../utils/splitStats";

function getDashboardGreeting(firstname, lastname) {
  const displayName = getUserDisplayName(firstname, lastname);
  if (displayName !== "AllSplit User") {
    return `Hi, ${displayName}`;
  }

  return "Hi there";
}

function formatRupee(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function DashboardScreen({ navigation }) {
  const styles = useThemedStyles(createDashboardStyles);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  useBrandStatusBar();
  const [splits, setSplits] = useState([]);
  const [createdSplits, setCreatedSplits] = useState([]);
  const [userMobile, setUserMobileState] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [mobile, deviceId, cachedFirst, cachedLast] = await Promise.all([
        getUserMobile(),
        DeviceInfo.getUniqueId(),
        getUserFirstname(),
        getUserLastname(),
      ]);

      setFirstname(cachedFirst);
      setLastname(cachedLast);
      setUserMobileState(mobile);

      const payload = { device_id: deviceId };
      const [oweResponse, createdResponse] = await Promise.all([
        MyOweList(payload),
        createdSplitsList(payload),
      ]);
      const result = Array.isArray(oweResponse.data) ? oweResponse.data : [];

      let activeMobile = mobile;
      if (oweResponse.user_mobile) {
        activeMobile = oweResponse.user_mobile;
        await setUserMobile(activeMobile);
        setUserMobileState(activeMobile);
      } else if (createdResponse.user_mobile) {
        activeMobile = createdResponse.user_mobile;
        await setUserMobile(activeMobile);
        setUserMobileState(activeMobile);
      }

      setSplits(result);
      setCreatedSplits(
        createdResponse.success === false ? [] : createdResponse.data || []
      );

      if (activeMobile) {
        try {
          const profile = await getProfile(activeMobile);
          if (profile?.success) {
            setFirstname(profile.firstname || "");
            setLastname(profile.lastname || "");
            await setUserProfile({
              firstname: profile.firstname || "",
              lastname: profile.lastname || "",
            });
          }
        } catch (profileError) {
          console.error("Dashboard profile load error:", profileError);
        }
      }
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
  const collectStats = summarizeCreatedSplits(createdSplits, userMobile);
  const recentSplits = [...splits]
    .sort((a, b) => {
      const aTime = new Date(a?.meta?.created_at || a?.created_at || 0).getTime();
      const bTime = new Date(b?.meta?.created_at || b?.created_at || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 3);
  const greeting = getDashboardGreeting(firstname, lastname);

  const quickActions = [
    {
      label: "New split",
      icon: "add-circle-outline",
      onPress: () => navigation.navigate("MyOwe", { openNewSplit: true }),
    },
    {
      label: "My Splits",
      icon: "receipt-outline",
      onPress: () => navigation.navigate("MyOwe"),
    },
    {
      label: "Collect",
      icon: "cash-outline",
      badge: collectStats.pendingConfirmations,
      onPress: () => navigation.navigate("CreatedSplits"),
    },
    {
      label: "Invite",
      icon: "qr-code-outline",
      onPress: () => navigation.navigate("InviteQr"),
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{greeting}</Text>
              <Text style={styles.headerSubtitle}>Split bills. Settle easy.</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.moneyRow}>
            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>You owe</Text>
              <Text style={styles.moneyValue}>{formatRupee(stats.openYouOwe)}</Text>
              <Text style={styles.moneyMeta}>
                {stats.openSplits} open bill{stats.openSplits === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>You are owed</Text>
              <Text style={styles.moneyValue}>{formatRupee(collectStats.youAreOwed)}</Text>
              <Text style={styles.moneyMeta}>
                {collectStats.activeCollections} to collect
              </Text>
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
                  {action.badge > 0 ? (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>
                        {action.badge > 9 ? "9+" : action.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {collectStats.pendingConfirmations > 0 ? (
          <TouchableOpacity
            style={styles.attentionCard}
            onPress={() => navigation.navigate("CreatedSplits")}
          >
            <View style={styles.attentionIcon}>
              <Ionicons name="alert-circle-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.attentionTextWrap}>
              <Text style={styles.attentionTitle}>Needs attention</Text>
              <Text style={styles.attentionMeta}>
                {collectStats.pendingConfirmations} payment
                {collectStats.pendingConfirmations === 1 ? "" : "s"} waiting for confirmation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Splits</Text>
          {recentSplits.length === 0 ? (
            <Text style={styles.emptyText}>
              No splits yet. Tap New split to create your first bill.
            </Text>
          ) : (
            recentSplits.map((split) => {
              const myOwe = getMyOweForSplit(split, userMobile);
              const peopleNames = (split?.people ?? [])
                .map((person) => getPersonFullName(person))
                .filter(Boolean)
                .slice(0, 3)
                .join(", ");
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
                  <Text style={styles.recentMeta} numberOfLines={1}>
                    {peopleNames || `${split?.people?.length ?? 0} people`}
                    {` · ${split?.items?.length ?? 0} items`}
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
