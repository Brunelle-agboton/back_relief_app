// components/NumberSpinner.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NumberSpinnerProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newVal: number) => void;
};

export function NumberSpinner({
  value,
  min = 0,
  max = 120,
  step = 1,
  onChange,
}: NumberSpinnerProps) {
  const decrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };
  const increment = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.divider} />
      <View style={styles.buttons}>
        <TouchableOpacity onPress={increment} style={styles.btn}>
          <Ionicons name="chevron-up" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={decrement} style={styles.btn}>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor:'#fff',
    borderWidth:     1,
    borderColor:     '#fff',
    borderRadius:    8,
    overflow:        'hidden',
    width:           80,
    height:          40,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  value: {
    flex:           1,
    textAlign:      'center',
    fontSize:       16,
    color:          '#333',
  },
  divider: {
    width:          1,
    height:         '60%',
    backgroundColor:'#CCC',
    marginHorizontal: 4,
  },
  buttons: {
    justifyContent: 'space-between',
  },
  btn: {
    width:           24,
    height:          18,
    alignItems:      'center',
    justifyContent:  'center',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 28,
    padding: 10,
    marginBottom: 8,
    width: '100%',
  },
  smallInput: {
    width: '40%',
  },
});
