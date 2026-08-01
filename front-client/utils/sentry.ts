import * as Sentry from '@sentry/react-native';

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  // Ne pas initialiser si le DSN n'est pas configuré (ex: développement local)
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    // Envoyer 20% des transactions pour le monitoring de performance
    tracesSampleRate: 0.2,
    // Désactiver les logs Sentry dans la console
    debug: false,
    // Ne pas envoyer d'erreurs en mode dev (sauf si DSN explicitement défini)
    enabled: !__DEV__,
    beforeSend(event) {
      // Ne jamais envoyer de données personnelles dans les messages d'erreur
      return event;
    },
  });
}

export { Sentry };
