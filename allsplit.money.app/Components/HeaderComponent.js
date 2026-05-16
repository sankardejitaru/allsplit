import React, { Suspense } from 'react';
import { useNavigationState,useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet,TouchableOpacity} from 'react-native';
import { Appbar, Avatar,  Button, List, Switch } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons'; 



export default function Header({ children }) {
  const navigation = useNavigation();
  const currentRouteName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  return (
    <View >
          
          {/* Header */}

           <Appbar.Header style={head.containerheader}>
             {navigation.canGoBack() && (

        <Appbar.BackAction color="#fff" onPress={() => { 
      navigation.goBack(); // fallback
    
}} />
             )}
        <Appbar.Content  titleStyle={head.header} title={currentRouteName} />
      </Appbar.Header>
        </View>
 
  );
}


const head = StyleSheet.create({
  containerheader: {
    backgroundColor: '#99CCFF', 
    color:"#fff",
  },
  header: { color:"#fff", width: "90%", textAlign: "center", justifyContent: "center", fontSize: 20, fontWeight: 'bold' },
   backButton: { 
    color:"#fff"
  },

})
