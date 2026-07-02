import { StyleSheet } from "react-native";

export function createCreatedSplitsStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textDark,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.lightGreen,
      alignItems: "center",
      justifyContent: "center",
    },
    listPadding: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    splitName: {
      flex: 1,
      fontSize: 17,
      fontWeight: "700",
      color: colors.textDark,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusActive: {
      backgroundColor: "#fff4e5",
    },
    statusAwaiting: {
      backgroundColor: "#e8f1ff",
    },
    statusDone: {
      backgroundColor: colors.lightGreen,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    statusTextActive: {
      color: "#b54708",
    },
    statusTextAwaiting: {
      color: "#175cd3",
    },
    statusTextDone: {
      color: colors.primaryDark,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 8,
    },
    metaText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    pendingText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#175cd3",
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 48,
      paddingHorizontal: 24,
    },
  });
}

export function createManageSettlementStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textDark,
      flex: 1,
      textAlign: "center",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.lightGreen,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryCard: {
      backgroundColor: colors.white,
      margin: 16,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textDark,
      marginBottom: 4,
    },
    summaryMeta: {
      fontSize: 13,
      color: colors.textMuted,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textMuted,
      marginHorizontal: 16,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    participantCard: {
      backgroundColor: colors.white,
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    participantRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    participantName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textDark,
    },
    participantAmount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
    participantMeta: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusOpen: {
      backgroundColor: "#fff4e5",
    },
    statusClosed: {
      backgroundColor: "#e8f1ff",
    },
    statusSettled: {
      backgroundColor: colors.lightGreen,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    settleButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    settleButtonDisabled: {
      opacity: 0.6,
    },
    settleButtonText: {
      color: colors.white,
      fontWeight: "700",
      fontSize: 13,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 24,
      paddingHorizontal: 24,
    },
  });
}
