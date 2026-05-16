import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedRow: {
    backgroundColor: '#E8F5E9', // Very Light Green
    borderColor: '#C8E6C9',
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '600', color: '#333' },
  contactPhone: { fontSize: 13, color: '#777', marginTop: 2 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
  },
  checkMark: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999', fontSize: 14 },
});