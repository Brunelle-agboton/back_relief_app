import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, FormMessage, ScrollScreen, Text, TextField } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleForgotPassword = async () => {
    setSubmitting(true);
    setMessage('');
    setError('');
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
        setError("Erreur lors de l'envoi de l'email.");
      }
    } catch (e) {
      console.error(e);
      setError('Erreur réseau. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollScreen centered>
      <View>
        <Text variant="h1">Mot de passe oublié</Text>
        <Text variant="sub">
          Renseignez votre adresse e-mail : nous vous enverrons un lien de réinitialisation.
        </Text>
      </View>

      <TextField
        label="Adresse e-mail"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      <FormMessage message={error} testID="forgot-password-error" />
      <FormMessage message={message} tone="success" testID="forgot-password-success" />

      <Button
        accessibilityLabel="Réinitialiser le mot de passe"
        title="Réinitialiser le mot de passe"
        size="lg"
        block
        loading={submitting}
        onPress={handleForgotPassword}
      />
    </ScrollScreen>
  );
}
