import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('IndexScreen: Auth state check - User:', user?.email || 'None', 'Loading:', loading);
    
    if (!loading) {
      if (user) {
        console.log('IndexScreen: User authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('IndexScreen: No user, redirecting to sign-in');
        router.replace('/(auth)/sign-in');
      }
    }
  }, [user, loading]);

  console.log('IndexScreen: Rendering loading screen');

  // Show loading screen while checking auth state
  return (
    <View style={styles.container}>
      <LoadingScreen 
        message={loading ? "Checking authentication..." : "Redirecting..."}
        showLogo={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
});