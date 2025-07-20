import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../app/loading';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
     router.replace('/(tabs)');
  } else {
    router.replace('/_home');
  }
  return ;
}