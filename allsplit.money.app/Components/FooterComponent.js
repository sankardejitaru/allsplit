import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

export default function Footer() {
    const navigation = useNavigation();
   const handlemyProfilePress = () => {
    navigation.replace('Profile');
  };
  const handlemyesignPress = () => {
    navigation.replace('eSign Documents');
  };
   const handlemyeattestPress = () => {
    navigation.replace('eAttest Documents');
  };
  const handlehomePress = () => {
    navigation.replace('Dashboard');
  }
return (
<View style={foo.footer}>
           <View style={foo.bottomNav}>
           <TouchableOpacity style={foo.navItem}  onPress={handlehomePress}>
             <Ionicons name="home-outline" size={24} color="#fff" />
             <Text style={{ color: '#fff' }}>Home</Text>
           </TouchableOpacity>
           <TouchableOpacity style={foo.navItem} onPress={handlemyesignPress}>
             <Ionicons name="create-outline" size={24} color="#fff" />
             <Text style={{ color: '#fff' }}>eSign</Text>
           </TouchableOpacity>
           <TouchableOpacity style={foo.navItem} onPress={handlemyeattestPress}>
             <Ionicons name="document-text-outline" size={24} color="#fff" />
             <Text style={{ color: '#fff' }}>eAttest</Text>
           </TouchableOpacity>
           <TouchableOpacity style={foo.navItem} onPress={handlemyProfilePress}>
             <Ionicons name="person-outline" size={24} color="#fff" />
             <Text style={{ color: '#fff' }}>Profile</Text>
           </TouchableOpacity>
         </View>
   
         </View>
    );
}

const foo = StyleSheet.create({
    footer: {
    padding: 15,
    backgroundColor: '#99CCFF',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderColor: '#ddd',
    marginTop: 'auto',
    width: '100%',

  },
  navItem: { alignItems: 'center' },
})