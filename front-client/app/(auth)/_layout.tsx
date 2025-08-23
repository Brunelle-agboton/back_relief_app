import { Stack } from 'expo-router';
    /**
      * AuthLayout configures a stack navigator for the authentication flow.
      * This ensures that screens like Login, Register, and Forgot Password
      * are presented in a separate navigation stack without the main app's tabs.
      * -credentials
      */
export default function AuthLayout() {
      return (
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
          <Stack.Screen name="forgot-password" />
         <Stack.Screen name="register/step1" />
         <Stack.Screen name="register/step2" />
         <Stack.Screen name="register/step3" />
         <Stack.Screen name="register-pro/step1-infos" />

        </Stack>
);
 }