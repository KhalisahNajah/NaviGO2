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
        <Image
          source={{ uri: 'https://i.pinimg.com/736x/2c/42/0b/2c420ba439ecfff12f1b214fe42783f5.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <ActivityIndicator size="large" color="#3B5284" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
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
  logo: {
    width: 120,
    height: 80,
    marginBottom: 20,
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
});