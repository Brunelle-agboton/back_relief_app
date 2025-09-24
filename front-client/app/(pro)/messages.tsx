import React from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';

const MessagesPage: React.FC = () => {
  const messages = [
    {
      id: '1',
      name: 'Jacques Tullius',
      avatar: 'https://via.placeholder.com/40',
      time: 'Aujourd’hui 17:46',
      preview: '24 ans, lombalgie, douleurs aux trapèzes...',
      content: 'Bonjour Taneli! Voici des vidéos que j’ai prise conce...',
      unread: true,
    },
    {
      id: '2',
      name: 'Julie Lefèvre',
      avatar: 'https://via.placeholder.com/40',
      time: 'Lu 15 sept 14:14',
      preview: '63 ans, lombalgie, tendinite épaule gauche...',
      content: 'Merci pour tes retours, ma douleur à l’épaule a bien...',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <TextInput style={styles.searchBar} placeholder="Rechercher un patient" />
      {messages.map((message) => (
        <View key={message.id} style={styles.messageItem}>
          <Image source={{ uri: message.avatar }} style={styles.avatar} />
          <View style={styles.messageDetails}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{message.name}</Text>
              <Text style={styles.time}>{message.time}</Text>
            </View>
            <Text style={styles.preview}>{message.preview}</Text>
            <Text style={styles.content}>{message.content}</Text>
          </View>
          {message.unread && <View style={styles.unreadDot} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  searchBar: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, marginBottom: 10 },
  messageItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  messageDetails: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontWeight: 'bold' },
  time: { color: '#666' },
  preview: { fontSize: 12, color: '#666' },
  content: { fontSize: 14 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', marginLeft: 10 },
});

export default MessagesPage;