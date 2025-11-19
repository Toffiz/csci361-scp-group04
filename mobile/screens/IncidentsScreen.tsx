import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IncidentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incidents</Text>
      <Text>Incident reports and status will go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 8 },
});
