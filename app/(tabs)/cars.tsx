import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Car, Plus, CreditCard as Edit3, Trash2, Fuel, Star, MapPin, DollarSign, X, Check, Zap, Battery, ChevronDown } from 'lucide-react-native';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  createCarProfile,
  updateCarProfile,
  deleteCarProfile,
  getUserCars,
  setMainCar,
  subscribeToUserCars,
  CarProfile,
} from '@/lib/database';

export default function CarsScreen() {
  const { theme, colors } = useContext(ThemeContext);
  const { userProfile, getCurrencySymbol } = useAuth();
  const [cars, setCars] = useState<CarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<CarProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    fuelType: 'petrol' as 'petrol' | 'electric' | 'hybrid',
    fuelEfficiency: '',
    fuelPrice: '',
    batteryCapacity: '',
    chargingSpeed: 'fast' as 'slow' | 'fast' | 'rapid' | 'ultra',
  });

  useEffect(() => {
    if (userProfile) {
      loadCars();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToUserCars(userProfile.uid, (updatedCars) => {
        setCars(updatedCars);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userProfile]);

  const loadCars = async () => {
    if (!userProfile) return;
    
    try {
      const userCars = await getUserCars(userProfile.uid);
      setCars(userCars);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      fuelType: 'petrol',
      fuelEfficiency: '',
      fuelPrice: '',
      batteryCapacity: '',
      chargingSpeed: 'fast',
    });
    setEditingCar(null);
  };

  const openModal = (car?: CarProfile) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        name: car.name,
        model: car.model,
        fuelType: car.fuelType,
        fuelEfficiency: car.fuelEfficiency.toString(),
        fuelPrice: car.fuelPrice.toString(),
        batteryCapacity: car.batteryCapacity?.toString() || '',
        chargingSpeed: car.chargingSpeed || 'fast',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const saveCar = async () => {
    if (!userProfile || !formData.name || !formData.model || !formData.fuelEfficiency || !formData.fuelPrice) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.fuelType === 'electric' && !formData.batteryCapacity) {
      Alert.alert('Error', 'Battery capacity is required for electric vehicles');
      return;
    }

    try {
      const carData: Omit<CarProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: userProfile.uid,
        name: formData.name,
        model: formData.model,
        fuelType: formData.fuelType,
        fuelEfficiency: parseFloat(formData.fuelEfficiency),
        fuelPrice: parseFloat(formData.fuelPrice),
        isMain: editingCar?.isMain || cars.length === 0,
        ...(formData.fuelType === 'electric' && {
          batteryCapacity: parseFloat(formData.batteryCapacity),
          chargingSpeed: formData.chargingSpeed,
        }),
      };

      if (editingCar) {
        await updateCarProfile(editingCar.id!, carData);
      } else {
        await createCarProfile(carData);
      }

      closeModal();
      Alert.alert('Success', `Car ${editingCar ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving car:', error);
      Alert.alert('Error', 'Failed to save car profile');
    }
  };

  const deleteCar = (carId: string) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCarProfile(carId);
              Alert.alert('Success', 'Car deleted successfully!');
            } catch (error) {
              console.error('Error deleting car:', error);
              Alert.alert('Error', 'Failed to delete car');
            }
          },
        },
      ]
    );
  };

  const setMainCarHandler = async (carId: string) => {
    if (!userProfile) return;
    
    try {
      await setMainCar(userProfile.uid, carId);
      Alert.alert('Success', 'Main car updated successfully!');
    } catch (error) {
      console.error('Error setting main car:', error);
      Alert.alert('Error', 'Failed to set main car');
    }
  };

  const calculateCostPer100km = (car: CarProfile) => {
    return ((100 / car.fuelEfficiency) * car.fuelPrice).toFixed(2);
  };

  const getFuelTypeIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return <Zap size={20} color={colors.secondary} />;
      case 'hybrid':
        return <Battery size={20} color={colors.accent} />;
      default:
        return <Fuel size={20} color={colors.secondary} />;
    }
  };

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return 'Electric';
      case 'hybrid':
        return 'Hybrid';
      default:
        return 'Petrol';
    }
  };

  const getEfficiencyUnit = (fuelType: string) => {
    return fuelType === 'electric' ? 'km/kWh' : 'km/L';
  };

  const getFuelPriceUnit = (fuelType: string) => {
    return fuelType === 'electric' ? '/kWh' : '/L';
  };

  const getChargingSpeedColor = (speed: string) => {
    switch (speed) {
      case 'ultra':
        return '#8B5CF6';
      case 'rapid':
        return colors.secondary;
      case 'fast':
        return colors.accent;
      case 'slow':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const styles = createStyles(colors, theme);

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cars</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cars.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No Cars Added</Text>
            <Text style={styles.emptyStateText}>
              Add your car profiles to get accurate fuel cost calculations for your trips
            </Text>
            <TouchableOpacity style={styles.addCarButton} onPress={() => openModal()}>
              <Plus size={20} color="white" />
              <Text style={styles.addCarButtonText}>Add Your First Car</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cars.map((car) => (
            <View key={car.id} style={[styles.carCard, car.isMain && styles.mainCarCard]}>
              {car.isMain && (
                <View style={styles.mainBadge}>
                  <Star size={16} color={colors.accent} fill={colors.accent} />
                  <Text style={styles.mainBadgeText}>Main Car</Text>
                </View>
              )}

              <View style={styles.carHeader}>
                <View style={styles.carInfo}>
                  <View style={styles.carTitleRow}>
                    {getFuelTypeIcon(car.fuelType)}
                    <View style={styles.carTitleText}>
                      <Text style={styles.carName}>{car.name}</Text>
                      <Text style={styles.carModel}>{car.model}</Text>
                    </View>
                    <View style={styles.fuelTypeBadge}>
                      <Text style={styles.fuelTypeText}>{getFuelTypeLabel(car.fuelType)}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.carActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(car)}
                  >
                    <Edit3 size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteCar(car.id!)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.carDetails}>
                <View style={styles.detailItem}>
                  {getFuelTypeIcon(car.fuelType)}
                  <View style={styles.detailContent}>
                    <Text style={styles.detailValue}>
                      {car.fuelEfficiency} {getEfficiencyUnit(car.fuelType)}
                    </Text>
                    <Text style={styles.detailLabel}>
                      {car.fuelType === 'electric' ? 'Energy Efficiency' : 'Fuel Efficiency'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <DollarSign size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailValue}>
                      {getCurrencySymbol()} {car.fuelPrice}{getFuelPriceUnit(car.fuelType)}
                    </Text>
                    <Text style={styles.detailLabel}>
                      {car.fuelType === 'electric' ? 'Electricity Price' : 'Fuel Price'}
                    </Text>
                  </View>
                </View>

                {car.fuelType === 'electric' && car.batteryCapacity && (
                  <View style={styles.detailItem}>
                    <Battery size={20} color={colors.accent} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailValue}>{car.batteryCapacity} kWh</Text>
                      <Text style={styles.detailLabel}>Battery Capacity</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailItem}>
                  <MapPin size={20} color={colors.accent} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailValue}>{userProfile.country}</Text>
                    <Text style={styles.detailLabel}>Location</Text>
                  </View>
                </View>
              </View>

              <View style={styles.costCalculation}>
                <Text style={styles.costLabel}>Cost per 100km:</Text>
                <Text style={styles.costValue}>
                  {getCurrencySymbol()} {calculateCostPer100km(car)}
                </Text>
              </View>

              {!car.isMain && (
                <TouchableOpacity
                  style={styles.setMainButton}
                  onPress={() => setMainCarHandler(car.id!)}
                >
                  <Text style={styles.setMainButtonText}>Set as Main Car</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Car Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., My Honda Civic"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Car Model *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="e.g., Honda Civic 2020"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fuel Type *</Text>
              <View style={styles.fuelTypeSelector}>
                {(['petrol', 'electric', 'hybrid'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.fuelTypeOption,
                      formData.fuelType === type && styles.fuelTypeOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, fuelType: type })}
                  >
                    {getFuelTypeIcon(type)}
                    <Text style={[
                      styles.fuelTypeOptionText,
                      formData.fuelType === type && styles.fuelTypeOptionTextActive
                    ]}>
                      {getFuelTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {formData.fuelType === 'electric' ? 'Energy Efficiency (km/kWh)' : 'Fuel Efficiency (km/L)'} *
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.fuelEfficiency}
                onChangeText={(text) => setFormData({ ...formData, fuelEfficiency: text })}
                placeholder={formData.fuelType === 'electric' ? 'e.g., 6.2' : 'e.g., 14.5'}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {formData.fuelType === 'electric' ? 'Electricity Price per kWh' : 'Fuel Price per Liter'} *
              </Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencyPrefix}>{getCurrencySymbol()}</Text>
                <TextInput
                  style={styles.priceInput}
                  value={formData.fuelPrice}
                  onChangeText={(text) => setFormData({ ...formData, fuelPrice: text })}
                  placeholder={formData.fuelType === 'electric' ? '0.12' : '1.45'}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {formData.fuelType === 'electric' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Battery Capacity (kWh) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.batteryCapacity}
                    onChangeText={(text) => setFormData({ ...formData, batteryCapacity: text })}
                    placeholder="e.g., 75"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Preferred Charging Speed</Text>
                  <View style={styles.chargingSpeedSelector}>
                    {(['slow', 'fast', 'rapid', 'ultra'] as const).map((speed) => (
                      <TouchableOpacity
                        key={speed}
                        style={[
                          styles.chargingSpeedOption,
                          formData.chargingSpeed === speed && styles.chargingSpeedOptionActive,
                          { borderColor: getChargingSpeedColor(speed) }
                        ]}
                        onPress={() => setFormData({ ...formData, chargingSpeed: speed })}
                      >
                        <Text style={[
                          styles.chargingSpeedText,
                          formData.chargingSpeed === speed && { color: getChargingSpeedColor(speed) }
                        ]}>
                          {speed.charAt(0).toUpperCase() + speed.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            <View style={styles.locationInfo}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={styles.locationText}>
                Currency and location will be set based on your profile settings ({getCurrencySymbol()}, {userProfile.country})
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveCar}>
              <Check size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {editingCar ? 'Update' : 'Add'} Car
              </Text>
            </TouchableOpacity>
          </View>
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
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  addCarButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addCarButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  carCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainCarCard: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  mainBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carInfo: {
    flex: 1,
  },
  carTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carTitleText: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  carModel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  fuelTypeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fuelTypeText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  carActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  carDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  costCalculation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  setMainButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  setMainButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  currencyPrefix: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
    backgroundColor: colors.background,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  fuelTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  fuelTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  fuelTypeOptionActive: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  fuelTypeOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  fuelTypeOptionTextActive: {
    color: colors.primary,
  },
  chargingSpeedSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chargingSpeedOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  chargingSpeedOptionActive: {
    backgroundColor: colors.background,
  },
  chargingSpeedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 16,
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