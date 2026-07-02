import { StyleSheet } from "react-native";

export function createAuditLogStyles(colors) {
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
    filterSection: {
      backgroundColor: colors.white,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    filterLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      marginLeft: 20,
      marginBottom: 8,
    },
    chipRow: {
      paddingHorizontal: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.lightGreen,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.primaryDark,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    summaryText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    actionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.textDark,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    statusSuccess: {
      backgroundColor: colors.lightGreen,
    },
    statusFailure: {
      backgroundColor: "#fde8e8",
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    statusTextSuccess: {
      color: colors.primaryDark,
    },
    statusTextFailure: {
      color: "#b42318",
    },
    messageText: {
      fontSize: 14,
      color: colors.textBody,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 6,
    },
    metaPill: {
      fontSize: 11,
      color: colors.textMuted,
      backgroundColor: colors.backgroundAlt,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      overflow: "hidden",
    },
    timeText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    detailsBox: {
      marginTop: 8,
      padding: 10,
      borderRadius: 8,
      backgroundColor: colors.backgroundAlt,
    },
    detailsText: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: "monospace",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textDark,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 6,
    },
    footerLoader: {
      paddingVertical: 16,
    },
  });
}
