import { View, ActivityIndicator } from 'react-native';
import { Sentry } from '../utils/sentry';
Sentry.captureMessage('Test Sentry OK');

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#32CD32" />
    </View>
  );
}