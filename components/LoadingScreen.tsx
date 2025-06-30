import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({ 
  message = "Loading naviGO...", 
  showLogo = true 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/2c/42/0b/2c420ba439ecfff12f1b214fe42783f5.jpg' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>naviGO</Text>
        </View>
      )}
      <ActivityIndicator size="large" color="#3B5284" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.version}>Powered by Expo SDK 53</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#3B5284',
  },
  spinner: {
    marginVertical: 10,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B5284',
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5D6E1E',
    textAlign: 'center',
    marginTop: 10,
  },
});