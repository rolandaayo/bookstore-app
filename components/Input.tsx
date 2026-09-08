import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInputProps,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
}

export default function Input({ label, error, secureToggle = false, style, ...props }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [show, setShow] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: c.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: c.card, borderColor: error ? Colors.error : c.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: c.text }, style]}
          placeholderTextColor={c.placeholder}
          secureTextEntry={secureToggle ? !show : props.secureTextEntry}
          autoCapitalize="none"
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShow((s) => !s)} style={styles.toggle}>
            <Text style={{ color: c.subtext, fontSize: 13 }}>{show ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 13,
  },
  toggle: { paddingLeft: 10 },
  error: { color: Colors.error, fontSize: 12, marginTop: 4 },
});
