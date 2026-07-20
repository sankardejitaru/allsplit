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
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textDark,
      flex: 1,
      textAlign: "center",
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.lightGreen,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: 12,
    },
    summaryTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: colors.textDark,
    },
    summaryMeta: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "capitalize",
    },
    listContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      paddingBottom: 16,
    },
    loader: {
      marginVertical: 12,
    },
    compactRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.white,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    compactRowReopened: {
      borderColor: colors.primary,
      backgroundColor: colors.lightGreen,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    compactInfo: {
      flex: 1,
      marginRight: 8,
    },
    compactName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textDark,
    },
    compactMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    compactActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    iconActionBtn: {
      minWidth: 28,
      height: 28,
      paddingHorizontal: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    iconActionBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconActionBtnDisabled: {
      opacity: 0.55,
    },
    statusOpen: {
      backgroundColor: colors.muted,
    },
    statusClosed: {
      backgroundColor: colors.primary,
    },
    statusSettled: {
      backgroundColor: colors.primaryDark,
    },
    statusReopened: {
      backgroundColor: colors.primary,
    },
    statusOpenText: {
      color: colors.textMuted,
    },
    statusClosedText: {
      color: colors.primaryDark,
    },
    statusSettledText: {
      color: colors.primaryDark,
    },
    statusReopenedText: {
      color: colors.primaryDark,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 24,
      paddingHorizontal: 24,
      fontSize: 13,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 18,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textDark,
      marginBottom: 8,
    },
    modalMessage: {
      color: colors.textMuted,
      marginBottom: 18,
      lineHeight: 20,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 16,
    },
    modalCancelText: {
      color: colors.textMuted,
      fontWeight: "600",
    },
    modalConfirmText: {
      color: colors.primary,
      fontWeight: "700",
    },
  });
}
