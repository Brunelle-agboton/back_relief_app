import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type Props = {
  message: string;
};

export default function NotificationBanner({message }: Props) {
  return (
    <View style={styles.container}>
    <Avatar
        rounded
        icon={{name: 'user', type: 'font-awesome'}}
        activeOpacity={0.7}
        containerStyle={{flex: 2, marginLeft: 10, marginTop:115}}
        />
    <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A', // bleu foncé, à adapter
    padding: 10,
    borderRadius: 8,
    margin: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  text: {
    color: '#fff',
    flex: 1,
    flexWrap: 'wrap',
  },
});
