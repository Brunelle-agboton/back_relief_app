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
import { Slider } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W } = Dimensions.get('window');

interface PainModalProps {
  visible: boolean;
  zone: string;
  SvgPreview: React.FC<React.SVGProps<SVGSVGElement>>;
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
const Preview = SvgPreview;

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
            <Preview
              width={260}
              height={200}
              preserveAspectRatio="xMidYMid meet"/>
          </View>

          {/* Slider EVA */}
          <Text style={styles.sliderLabel}>Quel est ton niveau de douleur ?</Text>
          <View style={styles.sliderWrapper}>
            <LinearGradient
                colors={['#FF3320','#FFAE00', '#39DF87']} // vert à rouge
                start={[0, 0.5]}
                end={[1, 0]}
                style={styles.gradientTrack}
                />
            <Slider
              value={level}
              onValueChange={onChangeLevel}
              minimumValue={1}
              maximumValue={10}
              step={1}
              minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
              thumbStyle={styles.thumb}
              style={styles.sliderAbsolute}
            />
             <View style={styles.sliderLabel}>
                 <Text style={[styles.boundLabel, { left: 0 }]}>1</Text>
            <Text style={[styles.boundLabel, { right: 0 }]}>10</Text>
             </View>
            {/* <Text style={[styles.boundLabel, { left: 0 }]}>1</Text>
            <Text style={[styles.boundLabel, { right: 0 }]}>10</Text> */}
          </View>

          {/* Description */}
          <TextInput
            style={styles.textArea}
            placeholder="Description de la douleur"
            multiline
            numberOfLines={8}
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
              <Text style={styles.btnTextSave}>Enregistrer</Text>
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
    backgroundColor: 'rgba(250, 250, 250, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: BOX_W,
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
     marginLeft: 58,
    marginTop: 20,
    marginBottom: 12,
  },
  previewContainer: {
    height: '35%',
    alignItems: 'center',
    marginTop: 25,
  },
  sliderLabel: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sliderWrapper: {
    position: 'relative',
    height: SLIDER_H,
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 16,
  },
  gradientTrack: {
    height: 20,
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 14,
  },
  sliderAbsolute: {
    position: 'absolute',
    width: '93%',
    height: SLIDER_H,
    paddingHorizontal: 9,
    marginLeft: 12,
    marginRight: 12,
  },
  thumb: {
    width: 21,
    height: 21,
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
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 28, alignItems: 'center'
  },
  btnCancel: {flex: 1, marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
        borderWidth: 1,

    borderColor: '#ccc',
    borderRadius: 28, alignItems: 'center'
  },
  btnTextCancel: {
    fontSize: 16,
    color: '#666',
  },
  btnSave: {
    flex: 1, marginHorizontal: 10,
    backgroundColor: '#39DF87',
    paddingVertical: 10,
    paddingHorizontal: 20,
borderRadius: 28, alignItems: 'center'
  },
  btnTextSave: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
