import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createInviteStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { showToast } from "../../utils/toastService";
import { createContactInvite } from "../../services/contactService";
import {
  formatDisplayMobile,
  getUserDisplayName,
  getUserFirstname,
  getUserLastname,
  getUserMobile,
} from "../../utils/userIdentity";
import { getProfile } from "../../services/profileService";

export default function InviteQrScreen({ navigation }) {
  const styles = useThemedStyles(createInviteStyles);
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [deeplink, setDeeplink] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleBack = useCallback(() => {
    goBackOrNavigate(navigation, { screen: "Dashboard" });
  }, [navigation]);

  useHardwareBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack])
  );

  React.useEffect(() => {
    let cancelled = false;

    const loadInvite = async () => {
      try {
        const [mobile, firstname, lastname] = await Promise.all([
          getUserMobile(),
          getUserFirstname(),
          getUserLastname(),
        ]);
        let displayName = getUserDisplayName(firstname, lastname);
        let displayPhone = mobile;

        if (mobile) {
          try {
            const profile = await getProfile(mobile);
            if (profile?.success) {
              displayName = getUserDisplayName(
                profile.firstname || firstname,
                profile.lastname || lastname
              );
            }
          } catch (error) {
            console.log("Invite profile load error:", error);
          }
        }

        const response = await createContactInvite();
        if (cancelled) {
          return;
        }

        if (response?.success && response.deeplink) {
          setDeeplink(response.deeplink);
          setName(response.inviter?.name || displayName);
          setPhone(response.inviter?.phone || displayPhone);
        } else {
          const fallback = `allsplit://join-contact?p=${encodeURIComponent(
            displayPhone
          )}&f=${encodeURIComponent(firstname)}&l=${encodeURIComponent(lastname)}`;
          setDeeplink(fallback);
          setName(displayName);
          setPhone(displayPhone);
          if (response?.success === false) {
            showToast(
              "info",
              "Offline invite",
              "QR will still work for friends scanning in the app."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInvite();
    return () => {
      cancelled = true;
    };
  }, []);

  const qrUri = deeplink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        deeplink
      )}`
    : "";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Add me on AllSplit: ${name}. Open the app and scan my QR, or use this invite: ${deeplink}`,
      });
    } catch (error) {
      showToast("danger", "Could not share", "Try again");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite to contacts</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your join QR</Text>
        <Text style={styles.subtitle}>
          Friends can scan this in AllSplit to save your full name and number as a contact.
        </Text>

        <View style={styles.qrCard}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ margin: 80 }} />
          ) : (
            <>
              {qrUri ? (
                <Image source={{ uri: qrUri }} style={styles.qrImage} />
              ) : null}
              <Text style={styles.name}>{name || "AllSplit User"}</Text>
              <Text style={styles.phone}>{formatDisplayMobile(phone)}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          disabled={loading || !deeplink}
        >
          <Text style={styles.shareText}>Share invite</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          On Choose people, tap the QR icon to scan someone else&apos;s invite.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
