import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Slider } from 'react-native-elements';
import Svg, { Image as SImage} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W } = Dimensions.get('window');

interface PainModalProps {
  visible: boolean;
  zone: string;
  SvgPreview: string;
  level: number;
  desc: string;
  onChangeLevel: (v: number) => void;
  onChangeDesc: (t: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PainModal({
  visible,
  zone,
  SvgPreview,
  level,
  desc,
  onChangeLevel,
  onChangeDesc,
  onClose,
  onSave,
}: PainModalProps) {

    
   // Fonction pour interpoler la couleur
   const getColor = (value: number) => {
    const red = Math.round((10 - value) * 25.5); // Diminue le rouge
    const green = Math.round(value * 25.5); // Augmente le vert
    return `rgb(${red}, ${green}, 0)`; // Couleur entre rouge et vert
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* Titre */}
          <Text style={styles.title}>{zone}</Text>
          <Text style={styles.subtitle}>Où as‑tu mal précisément ?</Text>

          {/* Preview du muscle */}
          <View style={styles.previewContainer}>
            <Svg width={150} height={200} 
            >
                <SImage
                href={SvgPreview}
                x="0"
                y="100"
                preserveAspectRatio="xMidYMid slice"
                />
            </Svg>
          </View>

          {/* Slider EVA */}
          <Text style={styles.sliderLabel}>Quel est ton niveau de douleur ?</Text>
          <View style={styles.sliderWrapper}>
            <LinearGradient
  colors={['#4ADE80', '#F87171']} // vert à rouge
  start={[0, 0]}
              end={[1, 0]}
  style={styles.gradientTrack}
/>
            <Slider
              value={level}
              onValueChange={onChangeLevel}
              minimumValue={1}
              maximumValue={10}
              step={1}
               minimumTrackTintColor={getColor(level)}
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor={getColor(level)}
              thumbStyle={styles.thumb}
              trackStyle={styles.invisibleTrack}
              style={styles.sliderAbsolute}
            />
            <Text style={[styles.boundLabel, { left: 0 }]}>1</Text>
            <Text style={[styles.boundLabel, { right: 0 }]}>10</Text>
          </View>

          {/* Description */}
          <TextInput
            style={styles.textArea}
            placeholder="Description de la douleur"
            multiline
            numberOfLines={4}
            value={desc}
            onChangeText={onChangeDesc}
            textAlignVertical="top"
          />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
              <Text style={styles.btnTextCancel}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.btnSave}>
              <Text style={styles.btnTextSave}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const BOX_W = W * 0.95;
const SLIDER_H = 40;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 250, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: BOX_W,
    backgroundColor: 'rgba(138, 138, 138, 0.4)',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderLabel: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  sliderWrapper: {
    position: 'relative',
    height: SLIDER_H,
    justifyContent: 'center',
    marginBottom: 16,
  },
   segment: {
    height: '100%',
  },
  gradientTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderAbsolute: {
    position: 'absolute',
    width: '100%',
    height: SLIDER_H,
    paddingHorizontal: 9,
    marginLeft: 12,

  },
  invisibleTrack: {
    height: 20,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  thumb: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderColor: '#333',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  boundLabel: {
    position: 'absolute',
    top: -2,
    fontSize: 12,
    color: '#333',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  btnTextCancel: {
    fontSize: 16,
    color: '#666',
  },
  btnSave: {
    backgroundColor: '#4ADE80',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnTextSave: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
