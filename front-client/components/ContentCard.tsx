import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

type CardProps = {
  title: string;
  imageSource: any; // require ou uri
  onPress?: () => void;
};

export function ContentCard({ title, imageSource, onPress }: CardProps) {
  return (
    <TouchableOpacity style={cardStyles.container} activeOpacity={0.8} onPress={onPress}>
      <ImageBackground
        source={imageSource}
        style={cardStyles.background}
        imageStyle={cardStyles.imageRadius}
      >
        <View style={cardStyles.overlay} />
        <Text style={cardStyles.title}
         numberOfLines={2}              
          ellipsizeMode="tail"           
          adjustsFontSizeToFit={true}    
          minimumFontScale={0.8}        
          >{title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    flex:1,
    height: 115,
     flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    
  },
  background: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
  },
  imageRadius: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.01,
  },
  title: {
    fontSize: 29,
    fontWeight: '500',
    color:'#E2E2E2',
    lineHeight: 27,  
  },
});
