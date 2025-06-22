import React, {useState} from 'react';
import Svg, { Image as SImage, Circle, RadialGradient, Stop, Defs } from 'react-native-svg';

const bodyImage = require('../assets/images/assis.png');
type Props = {
    onSelect: (zone: string) => void;
  };

export default function BodyMap({ onSelect }: Props) {
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    const handleSelect = (zone: string) => {
      setSelectedZone(zone);
      onSelect(zone);
    };
  
    return (
      <Svg width="90%" height="90%" viewBox="0 0 200 620" >
        {/* Image du corps */}
        <SImage
          href={bodyImage}
          x="0"
          y="100"
          preserveAspectRatio="xMidYMid slice"
        />
  
        <Defs>
          {/* Dégradé radial rouge */}
          <RadialGradient id="redGradient" cx="50%" cy="50%" r="80%">
            <Stop offset="0%" stopColor="red" stopOpacity="1" />
            <Stop offset="100%" stopColor="red" stopOpacity="0" />
          </RadialGradient>
        </Defs>
  
        {/* Cercle pour la tête */}
        {selectedZone === 'Tête' && (
          <Circle
            cx={60}
            cy={170}
            r={20}
            fill="url(#redGradient)" // Applique le dégradé
          />
        )}
        <Circle
          cx={50}
          cy={170}
          r={15}
          fill="transparent"
          onPress={() => handleSelect('Tête')}
        />
  
        {/* Cercle pour le bas du dos */}
        {selectedZone === 'Bas du dos' && (
          <Circle
            cx={50}
            cy={375}
            r={20}
            fill="url(#redGradient)" // Applique le dégradé
          />
        )}
        <Circle
          cx={50}
          cy={375}
          r={20}
          fill="transparent"
          onPress={() => handleSelect('Bas du dos')}
        />

        {/* Cercle pour le Milieu du dos*/}
        {selectedZone === 'Milieu du dos' && (
          <Circle
            cx={50}
            cy={310}
            r={20}
            fill="url(#redGradient)" // Applique le dégradé
          />
        )}
        <Circle
          cx={50}
          cy={310}
          r={20}
          fill="transparent"
          onPress={() => handleSelect('Milieu du dos')}
        />
      </Svg>
    );
  
}
