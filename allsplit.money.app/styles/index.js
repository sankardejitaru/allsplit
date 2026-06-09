import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    primary: "#1A9B4B",
    primaryDark: "#137A3A",
    success: "#4CAF50",
    lightGreen: "#E9F6EF",
    white: "#FFFFFF",
    text: "#1E1E1E",
    textMuted: "#6B7280",
    textDark: "#333333",
    muted: "#999999",
    border: "#D1D5DB",
    borderLight: "#EEEEEE",
    surface: "#FFFFFF",
    background: "#F5F7FA",
    backgroundAlt: "#F9F9F9",
    red: "#FF0000",
  },
};

export const COLORS = theme.colors;

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "top",
    padding: 24,
    backgroundColor: theme.colors.white,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: 24,
    justifyContent: "center",
    marginBottom: 10,
  },
  
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 18,
    color: theme.colors.primaryDark,
  },
  subtitle: {
    textAlign: "left",
    marginBottom: 20,
    fontSize: 20,
    color: theme.colors.primaryDark,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  countryCode: {
    width: "23%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    marginRight: 2,
  },
  otpinput: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  input: {
    width: "75%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left", 
    backgroundColor: theme.colors.white,
  },
});

export const pinStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 24,
    justifyContent: "top",
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: 24,
    justifyContent: "center",
    marginBottom: 10,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20, 
    marginBottom: 40,
  },
  pinBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#fff",
    elevation: 2, // subtle shadow for Material feel
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 32,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    height: 56,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: 24,
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgot: {
    marginTop: 1,
    alignItems: "center",
  },
  forgotText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left", 
    backgroundColor: theme.colors.white,
  },
  scrolltext: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  addButtonContainer: {
      flexDirection: 'row',
      margin: 5,
  },
  plusButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    padding: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    padding: 5,
    marginLeft: 10,
  },
  listPadding: {
    padding: 15,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: theme.colors.lightGreen,
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  splitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  priceTotal: {
    marginLeft: "auto",
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.success,
    textAlign: "right",
  },
  owepriceTotal: {
    marginLeft: "auto",
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textMuted,
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: "#999",
  },
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    marginTop: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    fontSize: 20,
    color: theme.colors.primary,
  },  
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left", 
    backgroundColor: theme.colors.white,
  },
  fabContainer: {
    position: 'relative',
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  subMenu: {
    marginTop: 100,
    marginLeft: 200,
     position: 'absolute',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  subButton: {
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  subText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 50,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export const billStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.colors.white,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.textDark,
  },
  permissionBtnContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  permissionBtn: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  captureBtn: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    borderRadius: 50,
  },
  captureText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: "90%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    margin: 16,
    color: theme.colors.primaryDark,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemPrice: {
    color: "red",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginRight: 8,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  primaryText: {
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addIcon: {
    color: theme.colors.white,
    fontSize: 24,
    lineHeight: 26,
  },
  arrowIconbtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  input: {
    width: "30%",
    fontSize: 20,
    height: 100,
  },
});

export const billinitStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.textDark,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.success,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: theme.colors.backgroundAlt,
    fontSize: 16,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedRow: {
    backgroundColor: theme.colors.lightGreen,
    borderColor: theme.colors.success,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  contactPhone: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.success,
  },
  checkMark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.success,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    margin: 10,
    elevation: 2,
    width: "20%",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: theme.colors.muted,
    fontSize: 14,
  },
});

export const myoweStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: theme.colors.primaryDark,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 6,
    backgroundColor: theme.colors.white,
    
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "left", 
    backgroundColor: theme.colors.white,
  },
});

export const viewmyoweStyle = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  summaryCard: { 
    backgroundColor: '#4CAF50', 
    padding: 20, 
    margin: 15, 
    borderRadius: 15, 
    elevation: 5 
  },
  summaryLabel: { color: '#E8F5E9', fontSize: 12, textTransform: 'uppercase' },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  metaDate: { color: '#fff', fontSize: 10, marginTop: 5, opacity: 0.8 },
  listContainer: { padding: 15 },
  participantCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 2 
  },
  participantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  avatarText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 18 },
  participantName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  participantPhone: { fontSize: 12, color: '#777' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  itemDescription: { flex: 1, fontSize: 14, color: '#444' },
  badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginHorizontal: 10 },
  badgeText: { fontSize: 10, color: '#666', textTransform: 'capitalize' },
  itemPrice: { width: 80, textAlign: 'right', fontSize: 14, fontWeight: '600', color: '#333' },
  
  itemPriceimmuted: { backgroundColor: 'lightgrey', width: 80, textAlign: 'right', fontSize: 14, fontWeight: '600', color: '#333' },
  doneButton: { 
    backgroundColor: '#4CAF50', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 30 
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeButton: { 
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',    
    margin: 30
  },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },


});

export default {
  COLORS,
  authStyles,
  pinStyles,
  homeStyles,
  billStyles,
  billinitStyles,
  myoweStyle,
};
