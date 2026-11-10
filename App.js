import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HYPERNOVA</Text>
      <Text style={styles.subtitle}>HyperEVM Testnet</Text>
      <Text style={styles.status}>Wallet Guardian : OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#00BFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 12,
  },
  status: {
    color: '#00FF99',
    fontSize: 14,
    marginTop: 20,
  },
});
