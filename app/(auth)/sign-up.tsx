import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, LogIn, ArrowRight, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SignUp() {
  const { theme, colors } = useContext(ThemeContext);
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      // Navigation will be handled by the auth state change in index.tsx
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to sign-in page
  const goToSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const styles = createStyles(colors, theme);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B5284', '#5BA8A0', '#CBE54E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header with Logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/736x/2c/42/0b/2c420ba439ecfff12f1b214fe42783f5.jpg' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.subtitle}>Join the smart navigation revolution</Text>
            </View>

            {/* Sign Up Form Card */}
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Account</Text>
                <Text style={styles.formSubtitle}>Start your journey with us today</Text>
              </View>

              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <User size={20} color={colors.primary} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Full name"
                      placeholderTextColor="rgba(59, 82, 132, 0.5)"
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Mail size={20} color={colors.primary} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      placeholderTextColor="rgba(59, 82, 132, 0.5)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Lock size={20} color={colors.primary} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password (min. 6 characters)"
                      placeholderTextColor="rgba(59, 82, 132, 0.5)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="rgba(59, 82, 132, 0.7)" />
                      ) : (
                        <Eye size={20} color="rgba(59, 82, 132, 0.7)" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Lock size={20} color={colors.primary} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm password"
                      placeholderTextColor="rgba(59, 82, 132, 0.5)"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="rgba(59, 82, 132, 0.7)" />
                      ) : (
                        <Eye size={20} color="rgba(59, 82, 132, 0.7)" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity 
                  style={[styles.signUpButton, loading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#3B5284', '#5BA8A0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.signUpButtonText}>
                      {loading ? 'Creating Account...' : 'Register here'}
                    </Text>
                    <ArrowRight size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <View style={styles.termsSection}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign In Link - Updated to use router.push */}
              <View style={styles.signInSection}>
                <Text style={styles.signInText}>Already have an account?</Text>
                <TouchableOpacity 
                  style={[styles.signInButton, loading && styles.buttonDisabled]}
                  disabled={loading}
                  onPress={goToSignIn}
                >
                  <Text style={styles.signInButtonText}>Log In</Text>
                  <ArrowRight size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appTitle: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    backdropFilter: 'blur(10px)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(59, 82, 132, 0.7)',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 82, 132, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 82, 132, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 82, 132, 0.1)',
    borderRadius: 12,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 12,
    marginRight: 4,
  },
  signUpButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(59, 82, 132, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(59, 82, 132, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(59, 82, 132, 0.6)',
  },
  signInSection: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(59, 82, 132, 0.7)',
    marginBottom: 12,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 82, 132, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(59, 82, 132, 0.2)',
    gap: 8,
  },
  signInButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacing: {
    height: 40,
  },
});