import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button,TouchableOpacity,StyleSheet  } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  const handleForgotPassword = async () => {
    try {
      const response = await fetch('https://example.com/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage('Un email de réinitialisation a été envoyé.');
      } else {
        setMessage('Erreur lors de l\'envoi de l\'email.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur réseau. Veuillez réessayer plus tard.');
    }
  };

  return (
    <View style={styles.container}>
       <View style={{marginBottom: 16}}>

        <Text style={styles.label}>Entrez votre adresse e-mail :</Text>
        <View style={[
          styles.inputWrapper,
          emailFocused && styles.inputFocused
        ]}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#999"
            onChangeText={setEmail} 
            value={email}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
     </View>
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleForgotPassword}
      >
        <Text style={styles.loginButtonText}>Réinitialiser le mot de passe</Text>
      </TouchableOpacity>
      {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#555',
  },
  inputWrapper: {
    borderRadius: 30,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden', // Empêche le débordement du fond
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    padding: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    borderColor: '#FFAE00',
    backgroundColor: '#fffdf6',
    shadowColor: '#FFAE00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#32CD32',
    borderRadius: 29,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})