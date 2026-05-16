import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 5 },
  listPadding: { padding: 15 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconContainer: { 
    backgroundColor: '#E8F5E9', 
    padding: 10, 
    borderRadius: 12, 
    marginRight: 15 
  },
  titleContainer: { flex: 1 },
  splitName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 12, color: '#999', marginTop: 2 },
  cardFooter: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 12,
    alignItems: 'center'
  },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { fontSize: 13, color: '#666', marginLeft: 5 },
  priceTotal: { marginLeft: 'auto', fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#999' }
});