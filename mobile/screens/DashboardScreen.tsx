import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Button title="Catalog" onPress={() => navigation.navigate('Catalog')} />
      <Button title="Chat" onPress={() => navigation.navigate('Chat')} />
      <Button title="Orders" onPress={() => navigation.navigate('Orders')} />
      <Button title="Incidents" onPress={() => navigation.navigate('Incidents')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 12 },
});
