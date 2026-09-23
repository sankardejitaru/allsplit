import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createSettingsStyles, THEME_MODES } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import {
  formatDisplayMobile,
  getProfileInitials,
  getUserDisplayName,
  getUserFirstname,
  getUserLastname,
  getUserMobile,
  setUserProfile,
} from "../../utils/userIdentity";
import { showToast } from "../../utils/toastService";
import { FEATURE_FLAGS } from "../../constants/config";
import { getProfile, updateProfile } from "../../services/profileService";
import { logout, switchAccount } from "../../services/authService";
import DeviceInfo from "react-native-device-info";

const NOTIFICATIONS_KEY = "SettingsNotifications";

export default function SettingsScreen({ navigation }) {
  const styles = useThemedStyles(createSettingsStyles);
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const [userMobile, setUserMobileState] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  const loadSettings = async () => {
    const [mobile, notifications, cachedFirst, cachedLast] = await Promise.all([
      getUserMobile(),
      AsyncStorage.getItem(NOTIFICATIONS_KEY),
      getUserFirstname(),
      getUserLastname(),
    ]);

    setUserMobileState(mobile);
    setNotificationsEnabled(notifications !== "false");
    setFirstname(cachedFirst);
    setLastname(cachedLast);

    if (!mobile) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await getProfile(mobile);
      if (res?.success) {
        setFirstname(res.firstname || "");
        setLastname(res.lastname || "");
        await setUserProfile({
          firstname: res.firstname || "",
          lastname: res.lastname || "",
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? "true" : "false");
  };

  const handleSaveProfile = async () => {
    const trimmedFirst = firstname.trim();
    const trimmedLast = lastname.trim();

    if (!trimmedFirst) {
      showToast("danger", "First name required", "Please enter your first name");
      return;
    }

    if (!userMobile) {
      showToast("danger", "Not signed in", "Your mobile number was not found");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateProfile({
        mobile: userMobile,
        firstname: trimmedFirst,
        lastname: trimmedLast,
      });

      if (!res?.success) {
        showToast("danger", "Could not save", res.message || "Try again");
        return;
      }

      setFirstname(res.firstname || trimmedFirst);
      setLastname(res.lastname || trimmedLast);
      await setUserProfile({
        firstname: res.firstname || trimmedFirst,
        lastname: res.lastname || trimmedLast,
      });
      showToast("info", "Profile saved", "Your name has been updated");
      setIsEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const openProfileEditor = () => {
    setIsEditingProfile(true);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "PinLogin" }],
    });
  };

  const handleSwitchAccount = () => {
    setShowSwitchModal(true);
  };

  const confirmSwitchAccount = async () => {
    try {
      setSwitchingAccount(true);
      const deviceId = await DeviceInfo.getUniqueId();
      await switchAccount(deviceId);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } finally {
      setSwitchingAccount(false);
      setShowSwitchModal(false);
    }
  };

  const displayName = getUserDisplayName(firstname, lastname);
  const initials = getProfileInitials(firstname, lastname, userMobile);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.profileCard}>
          {!isEditingProfile ? (
            <TouchableOpacity
              style={styles.profileEditButton}
              onPress={openProfileEditor}
              disabled={loadingProfile}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profilePhone}>
            {formatDisplayMobile(userMobile)}
          </Text>

          {isEditingProfile ? (
            <View style={styles.profileFormInner}>
              {loadingProfile ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
              ) : (
                <>
                  <Text style={styles.inputLabel}>First name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstname}
                    onChangeText={setFirstname}
                    placeholder="First name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    editable={!savingProfile}
                  />

                  <Text style={styles.inputLabel}>Last name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastname}
                    onChangeText={setLastname}
                    placeholder="Last name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    editable={!savingProfile}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, savingProfile && styles.saveButtonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    <Text style={styles.saveButtonText}>
                      {savingProfile ? "Saving..." : "Save profile"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.themeRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Appearance</Text>
            </View>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === THEME_MODES.LIGHT && styles.themeOptionActive,
                ]}
                onPress={() => setThemeMode(THEME_MODES.LIGHT)}
              >
                <Ionicons
                  name="sunny-outline"
                  size={18}
                  color={themeMode === THEME_MODES.LIGHT ? colors.primaryDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === THEME_MODES.LIGHT && styles.themeOptionTextActive,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  styles.themeOptionLast,
                  themeMode === THEME_MODES.DARK && styles.themeOptionActive,
                ]}
                onPress={() => setThemeMode(THEME_MODES.DARK)}
              >
                <Ionicons
                  name="moon-outline"
                  size={18}
                  color={themeMode === THEME_MODES.DARK ? colors.primaryDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === THEME_MODES.DARK && styles.themeOptionTextActive,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.lightGreen }}
              thumbColor={notificationsEnabled ? colors.primary : colors.backgroundAlt}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("InviteQr")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="qr-code-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Invite QR</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("SetPin")}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Reset PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>SMS alerts</Text>
            </View>
            <Text style={styles.rowValue}>
              {FEATURE_FLAGS.enableSms ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="logo-whatsapp" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>WhatsApp invites</Text>
            </View>
            <Text style={styles.rowValue}>
              {FEATURE_FLAGS.enableWhatsapp ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Push notifications</Text>
            </View>
            <Text style={styles.rowValue}>
              {FEATURE_FLAGS.enablePush ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>App Version</Text>
            </View>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.switchAccountButton} onPress={handleSwitchAccount}>
          <Text style={styles.switchAccountText}>Switch account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>allsplit.money</Text>
      </ScrollView>

      <Modal
        transparent
        visible={showSwitchModal}
        animationType="fade"
        onRequestClose={() => !switchingAccount && setShowSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Switch account</Text>
            <Text style={styles.modalMessage}>
              Sign in with a different mobile number? Your current session will be cleared on this device.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowSwitchModal(false)}
                disabled={switchingAccount}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSwitchAccount}
                disabled={switchingAccount}
              >
                <Text style={styles.modalConfirmText}>
                  {switchingAccount ? "Switching..." : "Switch"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
