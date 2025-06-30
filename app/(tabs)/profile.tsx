import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { User, Camera, CreditCard as Edit3, Globe, DollarSign, MapPin, Settings, Navigation, Fuel, Route, Shield, X, Check, ChevronRight, Bell, Moon, Volume2, ChevronDown, LogOut, Award, Calendar, Star } from 'lucide-react-native';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { theme, colors, toggleTheme } = useContext(ThemeContext);
  const { userProfile, updateUserProfile, logout, getCurrencySymbol, getAvatarImage, getUserTenure } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const regions = [
    { code: 'NA', name: 'North America', countries: ['United States', 'Canada', 'Mexico'] },
    { code: 'SEA', name: 'Southeast Asia', countries: ['Malaysia', 'Singapore', 'Thailand', 'Indonesia', 'Philippines'] },
    { code: 'EU', name: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain'] },
    { code: 'OCE', name: 'Oceania', countries: ['Australia', 'New Zealand'] },
    { code: 'EA', name: 'East Asia', countries: ['Japan', 'South Korea', 'China', 'Taiwan'] },
  ];

  const fuelTypes = {
    'Malaysia': ['RON95', 'RON97', 'Diesel', 'Electric'],
    'United States': ['Regular (87)', 'Mid-Grade (89)', 'Premium (91+)', 'Diesel', 'Electric'],
    'Australia': ['Unleaded 91', 'Unleaded 95', 'Unleaded 98', 'Diesel', 'Electric'],
    'United Kingdom': ['Unleaded 95', 'Super Unleaded 97', 'Diesel', 'Electric'],
    'Singapore': ['RON92', 'RON95', 'RON98', 'Diesel', 'Electric'],
    'Default': ['Regular', 'Premium', 'Diesel', 'Electric'],
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tenure = getUserTenure();
  const avatarImage = getAvatarImage();

  const saveProfile = async () => {
    try {
      await updateUserProfile(editedProfile);
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const selectCurrency = async (currency: typeof currencies[0]) => {
    try {
      await updateUserProfile({ currency: currency.code });
      setShowCurrencyModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const selectRegion = async (region: typeof regions[0]) => {
    try {
      await updateUserProfile({ 
        region: region.name,
        country: region.countries[0]
      });
      setShowRegionModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const selectFuelType = async (fuelType: string) => {
    try {
      await updateUserProfile({ preferredFuelType: fuelType });
      setShowFuelTypeModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleSetting = async (key: string) => {
    try {
      await updateUserProfile({
        navigationSettings: {
          ...userProfile.navigationSettings,
          [key]: !userProfile.navigationSettings[key]
        }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getCurrentFuelTypes = () => {
    return fuelTypes[userProfile.country as keyof typeof fuelTypes] || fuelTypes.Default;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigate to sign-in page after successful logout
              router.replace('/(auth)/sign-in');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const changeProfilePicture = () => {
    const avatarInfo = getAvatarInfo();
    Alert.alert(
      'Your naviGO Avatar',
      `${avatarInfo.description}\n\n🏆 ${tenure.title}: ${tenure.years > 0 ? `${tenure.years} year${tenure.years > 1 ? 's' : ''}` : `${tenure.months} month${tenure.months > 1 ? 's' : ''}`} with naviGO\n\n${avatarInfo.nextLevel}`,
      [{ text: 'Got it!' }]
    );
  };

  const getAvatarInfo = () => {
    const { months, years } = tenure;
    
    if (years >= 5) {
      return {
        description: '🏎️ You\'ve unlocked the Highway Hero avatar! This sleek blue sports car represents your mastery of navigation.',
        nextLevel: 'You\'ve reached the highest level! Keep navigating to maintain your legendary status.'
      };
    } else if (years >= 1) {
      return {
        description: '🏁 You\'ve unlocked the Mini Racer avatar! This purple race car shows your growing expertise.',
        nextLevel: `Drive for ${5 - years} more year${5 - years > 1 ? 's' : ''} to unlock the legendary Highway Hero avatar!`
      };
    } else if (months >= 5) {
      return {
        description: '🚗 You\'ve unlocked the Tiny Tires avatar! This orange car represents your developing navigation skills.',
        nextLevel: `Navigate for ${12 - months} more month${12 - months > 1 ? 's' : ''} to unlock the Mini Racer avatar!`
      };
    } else {
      return {
        description: '🚙 Welcome! You have the New Driver avatar - a friendly yellow car perfect for beginners.',
        nextLevel: `Use naviGO for ${5 - months} more month${5 - months > 1 ? 's' : ''} to unlock the Tiny Tires avatar!`
      };
    }
  };

  const getAvatarBorderColor = () => {
    const { months, years } = tenure;
    if (years >= 5) return '#2563EB'; // Blue for Highway Hero
    if (years >= 1) return '#8B5CF6'; // Purple for Mini Racer
    if (months >= 5) return '#F59E0B'; // Orange for Tiny Tires
    return '#CBE54E'; // Yellow-green for New Driver
  };

  const getProgressPercentage = () => {
    const { months, years } = tenure;
    if (years >= 5) return 100; // Max level
    if (years >= 1) return 75 + ((years - 1) / 4) * 25; // 75-100%
    if (months >= 5) return 50 + ((months - 5) / 7) * 25; // 50-75%
    return (months / 5) * 50; // 0-50%
  };

  const styles = createStyles(colors, theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setEditedProfile(userProfile);
              setShowEditProfile(true);
            }}
          >
            <Edit3 size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profilePictureContainer} onPress={changeProfilePicture}>
            <Image 
              source={{ uri: avatarImage }} 
              style={[styles.profilePicture, { borderColor: getAvatarBorderColor() }]} 
            />
            <View style={[styles.tenureBadge, { backgroundColor: getAvatarBorderColor() }]}>
              <Award size={12} color="white" />
            </View>
            <View style={styles.avatarGlow} />
          </TouchableOpacity>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
          <View style={styles.tenureInfo}>
            <Award size={16} color={getAvatarBorderColor()} />
            <Text style={[styles.tenureText, { color: getAvatarBorderColor() }]}>{tenure.title}</Text>
            <Star size={14} color={getAvatarBorderColor()} fill={getAvatarBorderColor()} />
          </View>
          <View style={styles.locationInfo}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>{userProfile.country}, {userProfile.region}</Text>
          </View>
          <View style={styles.memberSinceInfo}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.memberSinceText}>
              Member since {userProfile.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driving Journey</Text>
          
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIcon, { backgroundColor: getAvatarBorderColor() }]}>
              <Award size={24} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{tenure.title}</Text>
              <Text style={styles.achievementDescription}>
                {tenure.years > 0 
                  ? `${tenure.years} year${tenure.years > 1 ? 's' : ''} of smart navigation`
                  : `${tenure.months} month${tenure.months > 1 ? 's' : ''} of smart navigation`
                }
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: getAvatarBorderColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {tenure.years >= 5 
                    ? 'Max Level Achieved! 🏆' 
                    : tenure.years >= 1 
                    ? `Next: Highway Hero (${5 - tenure.years} year${5 - tenure.years > 1 ? 's' : ''} to go)`
                    : tenure.months >= 5 
                    ? `Next: Mini Racer (${12 - tenure.months} month${12 - tenure.months > 1 ? 's' : ''} to go)`
                    : `Next: Tiny Tires (${5 - tenure.months} month${5 - tenure.months > 1 ? 's' : ''} to go)`
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Avatar Gallery */}
          <View style={styles.avatarGallery}>
            <Text style={styles.avatarGalleryTitle}>Avatar Collection</Text>
            <View style={styles.avatarGrid}>
              {/* New Driver */}
              <View style={[styles.avatarGridItem, tenure.months >= 0 && styles.unlockedAvatar]}>
                <Image 
                  source={{ uri: 'https://i.pinimg.com/736x/57/81/49/578149670952517683.jpg' }} 
                  style={[styles.avatarGridImage, tenure.months < 0 && styles.lockedAvatarImage]} 
                />
                <Text style={[styles.avatarGridLabel, tenure.months < 0 && styles.lockedAvatarLabel]}>
                  New Driver
                </Text>
                {tenure.months >= 0 && <View style={styles.unlockedBadge}><Star size={10} color="#CBE54E" fill="#CBE54E" /></View>}
              </View>

              {/* Tiny Tires */}
              <View style={[styles.avatarGridItem, tenure.months >= 5 && styles.unlockedAvatar]}>
                <Image 
                  source={{ uri: 'https://i.pinimg.com/736x/57/81/49/578149670952511475.jpg' }} 
                  style={[styles.avatarGridImage, tenure.months < 5 && styles.lockedAvatarImage]} 
                />
                <Text style={[styles.avatarGridLabel, tenure.months < 5 && styles.lockedAvatarLabel]}>
                  Tiny Tires
                </Text>
                {tenure.months >= 5 && <View style={styles.unlockedBadge}><Star size={10} color="#F59E0B" fill="#F59E0B" /></View>}
              </View>

              {/* Mini Racer */}
              <View style={[styles.avatarGridItem, tenure.years >= 1 && styles.unlockedAvatar]}>
                <Image 
                  source={{ uri: 'https://i.pinimg.com/736x/57/81/49/578149670952511535.jpg' }} 
                  style={[styles.avatarGridImage, tenure.years < 1 && styles.lockedAvatarImage]} 
                />
                <Text style={[styles.avatarGridLabel, tenure.years < 1 && styles.lockedAvatarLabel]}>
                  Mini Racer
                </Text>
                {tenure.years >= 1 && <View style={styles.unlockedBadge}><Star size={10} color="#8B5CF6" fill="#8B5CF6" /></View>}
              </View>

              {/* Highway Hero */}
              <View style={[styles.avatarGridItem, tenure.years >= 5 && styles.unlockedAvatar]}>
                <Image 
                  source={{ uri: 'https://i.pinimg.com/736x/57/81/49/578149670952511534.jpg' }} 
                  style={[styles.avatarGridImage, tenure.years < 5 && styles.lockedAvatarImage]} 
                />
                <Text style={[styles.avatarGridLabel, tenure.years < 5 && styles.lockedAvatarLabel]}>
                  Highway Hero
                </Text>
                {tenure.years >= 5 && <View style={styles.unlockedBadge}><Star size={10} color="#2563EB" fill="#2563EB" /></View>}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowCurrencyModal(true)}>
            <View style={styles.settingLeft}>
              <DollarSign size={20} color={colors.secondary} />
              <Text style={styles.settingLabel}>Currency</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{userProfile.currency} ({getCurrencySymbol()})</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setShowRegionModal(true)}>
            <View style={styles.settingLeft}>
              <Globe size={20} color={colors.accent} />
              <Text style={styles.settingLabel}>Region</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{userProfile.region}</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setShowFuelTypeModal(true)}>
            <View style={styles.settingLeft}>
              <Fuel size={20} color={colors.tertiary} />
              <Text style={styles.settingLabel}>Preferred Fuel</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{userProfile.preferredFuelType}</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Navigation Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Route size={20} color={colors.primary} />
              <Text style={styles.settingLabel}>Avoid Unpaved Roads</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, userProfile.navigationSettings.avoidUnpavedRoads && styles.toggleActive]}
              onPress={() => toggleSetting('avoidUnpavedRoads')}
            >
              <View style={[styles.toggleThumb, userProfile.navigationSettings.avoidUnpavedRoads && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <DollarSign size={20} color={colors.accent} />
              <Text style={styles.settingLabel}>Avoid Toll Roads</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, userProfile.navigationSettings.avoidTolls && styles.toggleActive]}
              onPress={() => toggleSetting('avoidTolls')}
            >
              <View style={[styles.toggleThumb, userProfile.navigationSettings.avoidTolls && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Navigation size={20} color={colors.secondary} />
              <Text style={styles.settingLabel}>Avoid Highways</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, userProfile.navigationSettings.avoidHighways && styles.toggleActive]}
              onPress={() => toggleSetting('avoidHighways')}
            >
              <View style={[styles.toggleThumb, userProfile.navigationSettings.avoidHighways && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={colors.tertiary} />
              <Text style={styles.settingLabel}>Voice Guidance</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, userProfile.navigationSettings.voiceGuidance && styles.toggleActive]}
              onPress={() => toggleSetting('voiceGuidance')}
            >
              <View style={[styles.toggleThumb, userProfile.navigationSettings.voiceGuidance && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, theme === 'dark' && styles.toggleActive]}
              onPress={toggleTheme}
            >
              <View style={[styles.toggleThumb, theme === 'dark' && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, userProfile.navigationSettings.notifications && styles.toggleActive]}
              onPress={() => toggleSetting('notifications')}
            >
              <View style={[styles.toggleThumb, userProfile.navigationSettings.notifications && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={colors.secondary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Settings size={20} color={colors.tertiary} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>naviGO v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.name || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={editedProfile?.email || ''}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                editable={false}
              />
              <Text style={styles.inputNote}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.textInput}
                value={editedProfile?.country || ''}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, country: text })}
                placeholder="Enter your country"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditProfile(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Check size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[styles.optionItem, userProfile.currency === currency.code && styles.optionItemActive]}
                onPress={() => selectCurrency(currency)}
              >
                <Text style={styles.optionText}>{currency.name} ({currency.symbol})</Text>
                <Text style={styles.optionCode}>{currency.code}</Text>
                {userProfile.currency === currency.code && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Region Selection Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Region</Text>
            <TouchableOpacity onPress={() => setShowRegionModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.code}
                style={[styles.optionItem, userProfile.region === region.name && styles.optionItemActive]}
                onPress={() => selectRegion(region)}
              >
                <View style={styles.regionInfo}>
                  <Text style={styles.optionText}>{region.name}</Text>
                  <Text style={styles.regionCountries}>{region.countries.join(', ')}</Text>
                </View>
                {userProfile.region === region.name && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Fuel Type Selection Modal */}
      <Modal
        visible={showFuelTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFuelTypeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Fuel Type</Text>
            <TouchableOpacity onPress={() => setShowFuelTypeModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Available in {userProfile.country}</Text>
            {getCurrentFuelTypes().map((fuelType) => (
              <TouchableOpacity
                key={fuelType}
                style={[styles.optionItem, userProfile.preferredFuelType === fuelType && styles.optionItemActive]}
                onPress={() => selectFuelType(fuelType)}
              >
                <Text style={styles.optionText}>{fuelType}</Text>
                {userProfile.preferredFuelType === fuelType && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(203, 229, 78, 0.1)',
    zIndex: -1,
  },
  tenureBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  tenureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tenureText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  memberSinceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberSinceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
    marginBottom: 20,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  avatarGallery: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarGalleryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarGridItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  unlockedAvatar: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  avatarGridImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  lockedAvatarImage: {
    opacity: 0.3,
  },
  avatarGridLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    textAlign: 'center',
  },
  lockedAvatarLabel: {
    color: colors.textSecondary,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.secondary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  inputNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionItemActive: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  optionCode: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  regionInfo: {
    flex: 1,
  },
  regionCountries: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});