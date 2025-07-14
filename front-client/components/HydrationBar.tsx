import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import ColorableBottle from '@/components/ColorableBottle';

// Importe tes 5 SVG comme composants React via react-native-svg-transformer
import Bottle33 from '@/assets/images/hydra/33CL.svg';
import Bottle50 from '@/assets/images/hydra/50CL.svg';
import Bottle1L  from '@/assets/images/hydra/1L.svg';
import Bottle2L  from '@/assets/images/hydra/2L.svg';
import Bottle3Plus from '@/assets/images/hydra/3L+.svg';

const { width } = Dimensions.get('window');
const ICON_SIZE = width * 0.14;

type Bottle = {
  id: string;
  label: string;
  Component: React.FC<any>;
};

const BOTTLES: Bottle[] = [
  { id: '33cl', label: '33 cl', Component: Bottle33 },
  { id: '50cl', label: '50 cl', Component: Bottle50 },
  { id: '1l',  label: '1 L',   Component: Bottle1L },
  { id: '2l',  label: '2 L',   Component: Bottle2L },
  { id: '3l+', label: '3 L+',  Component: Bottle3Plus },
];

interface Props {
  onSelect: (sizeId: string) => void;
  selectedId?: string;
}

export default function HydrationSelector({ onSelect, selectedId }: Props) {
  const [current, setCurrent] = useState<string | null>(selectedId || null);

  const handlePress = (id: string) => {
    setCurrent(id);
    onSelect(id);
  };

  return (
   <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {BOTTLES.map(({ id, label, Component }) => (
          <ColorableBottle
            key={id}
            id={id}
            label={label}
            Component={Component}
            isSelected={current === id}
            onPress={handlePress}
            size={50}
          />
        ))}
        
      </ScrollView>
    </>
  );
}

const CARD_PADDING = 10;
const CARD_SIZE = ICON_SIZE + CARD_PADDING * 2;

const styles = StyleSheet.create({
    scroll: { paddingLeft: 20 },

  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bottleWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE + 20, // pour le label
    borderWidth: 1,
    borderColor: '#9BD9FF',
    borderRadius: 12,
    padding: CARD_PADDING,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bottleSelected: {
    backgroundColor: '#9BD9FF',
    borderColor: '#9BD9FF',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
