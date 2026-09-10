import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message }: Props) {
  const scheme = useColorScheme() ?? 'light';
  return (
    <View style={[styles.container, { backgroundColor: Colors[scheme].background }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={[styles.text, { color: Colors[scheme].subtext }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
  },
});
