import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Index screen - Auth state:', { user: user?.email, loading });
    
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('No user, redirecting to sign-in');
        router.replace('/(auth)/sign-in');
      }
    }
  }, [user, loading]);

  // Show loading screen while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B5284" />
      <Text style={styles.loadingText}>Loading naviGO...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B5284',
  },
});