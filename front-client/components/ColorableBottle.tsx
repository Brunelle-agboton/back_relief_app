import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Mask, Ellipse } from 'react-native-svg';
import type { FC } from 'react';

interface ColorableBottleProps {
  id: string;
  label: string;
  Component: React.FC<any>,
  isSelected: boolean;
  onPress: (id: string) => void;
  size: number;
}

export default function ColorableBottle({
  id,
  label,
  Component,
  isSelected,
  onPress,
  size,
}: ColorableBottleProps) {
  const fillColor = isSelected ? '#9BD9FF' : '#fff';
  const strokeColor = isSelected ? '#fff' : '#9BD9FF';

  return (
    <View>
        <TouchableOpacity
      style={[styles.bottleWrapper, isSelected && styles.bottleSelected]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
        <Component
        width={size}
        height={size * (50 / 42)} // adapte selon ton viewBox
        fill={fillColor}
        stroke={strokeColor}
      />
    </TouchableOpacity>
    <View style={styles.labelContent}>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottleWrapper: {
    width: 50 + 16,
    height: 45 + 16 + 20,
    borderWidth: 2,
    borderColor: '#9BD9FF',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  bottleSelected: {
    backgroundColor: '#9BD9FF',
    borderColor: '#9BD9FF',
  },
  labelContent: {
    fontSize: 12,
    color: '#333',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    color: '#00010aff',
    marginTop: 4,
  },
  labelSelected: {
    color: '#000',
    fontWeight: '600',
  },
});
