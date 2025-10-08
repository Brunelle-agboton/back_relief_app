import { Stack } from 'expo-router';
import BackButton from '@/components/BackButton';
import { PractitionerProvider } from '@/context/PractitionerContext';

    /**
      * AuthLayout configures a stack navigator for the authentication flow.
      * This ensures that screens like Login, Register, and Forgot Password
      * are presented in a separate navigation stack without the main app's tabs.
      * -credentials
      */
export default function AuthLayout() {
      return (
        <PractitionerProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="register/step1" />
            <Stack.Screen name="register/step2" />
            <Stack.Screen name="register/step3" />
            <Stack.Screen name="register-pro/step1-infos"
              options={{
                headerLeft:  () => <BackButton />
              }}/>
            <Stack.Screen name="register-pro/step2-specialities"
              options={{
                headerLeft:  () => <BackButton />
              }}/>
            <Stack.Screen name="register-pro/step3-availabilities"
              options={{
                headerLeft:  () => <BackButton />
              }}/>
            <Stack.Screen name="register-pro/step1-infos-exercices"
              options={{
                headerLeft:  () => <BackButton />
              }}/>
            <Stack.Screen name="register-pro/step-meet-tantely"
              options={{
                headerLeft:  () => <BackButton />
              }}/>
          </Stack>
        </PractitionerProvider>
      );
}
