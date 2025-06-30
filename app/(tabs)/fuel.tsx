import React, { useState, useEffect, useContext } from 'react';
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
} from 'react-native';
import { Fuel, Zap, MapPin, Clock, Star, Navigation, Filter, Search, X, Battery, Plug, CreditCard, Wifi, Coffee, Car, CircleCheck as CheckCircle, CircleAlert as AlertCircle, DollarSign } from 'lucide-react-native';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface CarProfile {
  id: string;
  name: string;
  model: string;
  fuelType: 'petrol' | 'electric' | 'hybrid';
  fuelEfficiency: number;
  fuelPrice: number;
  isMain: boolean;
}

interface Station {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  totalPorts?: number;
  availablePorts?: number;
  chargingSpeed?: 'slow' | 'fast' | 'rapid' | 'ultra';
  connectorTypes?: string[];
  pricing: string;
  amenities: string[];
  isOpen: boolean;
  estimatedTime?: string;
  networkProvider: string;
  fuelTypes?: string[];
}

interface FilterOptions {
  stationType: string[];
  amenities: string[];
  maxDistance: number;
  onlyAvailable: boolean;
}

export default function FuelScreen() {
  const { theme, colors } = useContext(ThemeContext);
  const { getCurrencySymbol } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showStationDetails, setShowStationDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'petrol' | 'electric'>('all');
  
  // Mock main car data - in real app, this would come from cars context/state
  const [mainCar] = useState<CarProfile>({
    id: '1',
    name: 'My Honda Civic',
    model: 'Honda Civic 2020',
    fuelType: 'petrol',
    fuelEfficiency: 14.5,
    fuelPrice: 1.45,
    isMain: true,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    stationType: [],
    amenities: [],
    maxDistance: 50,
    onlyAvailable: true,
  });

  const allStations: Station[] = [
    // Petrol Stations
    {
      id: '1',
      name: 'Shell Station',
      address: 'KLCC Shopping Centre, Kuala Lumpur',
      distance: '1.2 km',
      rating: 4.5,
      pricing: `${getCurrencySymbol()} 2.45/L`,
      amenities: ['Restroom', 'Food', 'ATM', 'Car Wash'],
      isOpen: true,
      networkProvider: 'Shell',
      fuelTypes: ['RON95', 'RON97', 'Diesel'],
    },
    {
      id: '2',
      name: 'Petronas Station',
      address: 'Pavilion KL, Bukit Bintang',
      distance: '2.1 km',
      rating: 4.3,
      pricing: `${getCurrencySymbol()} 2.42/L`,
      amenities: ['Restroom', 'Food', 'Coffee', 'ATM'],
      isOpen: true,
      networkProvider: 'Petronas',
      fuelTypes: ['PRIMAX95', 'PRIMAX97', 'Diesel Max'],
    },
    {
      id: '3',
      name: 'BHP Station',
      address: 'Mid Valley Megamall, KL',
      distance: '3.5 km',
      rating: 4.1,
      pricing: `${getCurrencySymbol()} 2.40/L`,
      amenities: ['Restroom', 'Convenience Store'],
      isOpen: false,
      networkProvider: 'BHP',
      fuelTypes: ['RON95', 'RON97', 'Diesel'],
    },
    // EV Charging Stations
    {
      id: '4',
      name: 'Tesla Supercharger',
      address: 'KLCC Shopping Centre, Kuala Lumpur',
      distance: '2.1 km',
      rating: 4.8,
      totalPorts: 12,
      availablePorts: 8,
      chargingSpeed: 'ultra',
      connectorTypes: ['Tesla', 'CCS2'],
      pricing: `${getCurrencySymbol()} 1.20/kWh`,
      amenities: ['WiFi', 'Restroom', 'Food Court', 'Shopping'],
      isOpen: true,
      estimatedTime: '25 min',
      networkProvider: 'Tesla',
    },
    {
      id: '5',
      name: 'ChargEV Station',
      address: 'Pavilion KL, Bukit Bintang',
      distance: '3.5 km',
      rating: 4.5,
      totalPorts: 8,
      availablePorts: 3,
      chargingSpeed: 'fast',
      connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
      pricing: `${getCurrencySymbol()} 0.85/kWh`,
      amenities: ['WiFi', 'Restroom', 'Shopping', 'Parking'],
      isOpen: true,
      estimatedTime: '45 min',
      networkProvider: 'ChargEV',
    },
    {
      id: '6',
      name: 'JomCharge Hub',
      address: 'Mid Valley Megamall, KL',
      distance: '5.2 km',
      rating: 4.2,
      totalPorts: 6,
      availablePorts: 0,
      chargingSpeed: 'rapid',
      connectorTypes: ['CCS2', 'Type 2'],
      pricing: `${getCurrencySymbol()} 1.00/kWh`,
      amenities: ['Restroom', 'Food Court', 'Shopping'],
      isOpen: true,
      estimatedTime: '35 min',
      networkProvider: 'JomCharge',
    },
  ];

  // Filter stations based on main car type and active tab
  const getFilteredStations = () => {
    let filtered = allStations;

    // Filter by tab selection
    if (activeTab === 'petrol') {
      filtered = filtered.filter(station => station.fuelTypes);
    } else if (activeTab === 'electric') {
      filtered = filtered.filter(station => station.chargingSpeed);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply availability filter for EV stations
    if (filters.onlyAvailable) {
      filtered = filtered.filter(station => {
        if (station.chargingSpeed) {
          return station.availablePorts && station.availablePorts > 0;
        }
        return station.isOpen;
      });
    }

    return filtered;
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

  const getChargingSpeedLabel = (speed: string) => {
    switch (speed) {
      case 'ultra':
        return 'Ultra Fast (150kW+)';
      case 'rapid':
        return 'Rapid (50-150kW)';
      case 'fast':
        return 'Fast (22-50kW)';
      case 'slow':
        return 'Slow (3-22kW)';
      default:
        return speed;
    }
  };

  const getAvailabilityStatus = (station: Station) => {
    if (!station.isOpen) return { color: '#EF4444', text: 'Closed' };
    
    if (station.chargingSpeed) {
      if (station.availablePorts === 0) return { color: '#EF4444', text: 'Full' };
      if (station.availablePorts && station.availablePorts <= 2) return { color: colors.accent, text: 'Limited' };
      return { color: colors.secondary, text: 'Available' };
    }
    
    return { color: colors.secondary, text: 'Open' };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color={colors.accent} fill={colors.accent} />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color={colors.accent} fill={colors.accent} style={{ opacity: 0.5 }} />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color={colors.border} />);
    }

    return stars;
  };

  const openStationDetails = (station: Station) => {
    setSelectedStation(station);
    setShowStationDetails(true);
  };

  const getDirections = (station: Station) => {
    Alert.alert(
      'Navigate to Station',
      `Opening directions to ${station.name}`,
      [{ text: 'OK' }]
    );
  };

  const filteredStations = getFilteredStations();

  // Auto-select tab based on main car type
  useEffect(() => {
    if (mainCar.fuelType === 'electric') {
      setActiveTab('electric');
    } else if (mainCar.fuelType === 'petrol') {
      setActiveTab('petrol');
    }
  }, [mainCar.fuelType]);

  const styles = createStyles(colors, theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fuel & Charging</Text>
        <Text style={styles.subtitle}>Find stations for your {mainCar.name}</Text>
      </View>

      {/* Car Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Fuel size={16} color={activeTab === 'all' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Stations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'petrol' && styles.activeTab]}
          onPress={() => setActiveTab('petrol')}
        >
          <Fuel size={16} color={activeTab === 'petrol' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'petrol' && styles.activeTabText]}>
            Petrol
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'electric' && styles.activeTab]}
          onPress={() => setActiveTab('electric')}
        >
          <Zap size={16} color={activeTab === 'electric' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'electric' && styles.activeTabText]}>
            Electric
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MapPin size={20} color={colors.secondary} />
          <Text style={styles.statNumber}>{filteredStations.length}</Text>
          <Text style={styles.statLabel}>Stations</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color={colors.secondary} />
          <Text style={styles.statNumber}>
            {filteredStations.filter(s => {
              if (s.chargingSpeed) return s.availablePorts && s.availablePorts > 0;
              return s.isOpen;
            }).length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={20} color={colors.accent} />
          <Text style={styles.statNumber}>
            {getCurrencySymbol()}
          </Text>
          <Text style={styles.statLabel}>Currency</Text>
        </View>
      </View>

      {/* Stations List */}
      <ScrollView style={styles.stationsList} showsVerticalScrollIndicator={false}>
        {filteredStations.map((station) => {
          const availability = getAvailabilityStatus(station);
          const isEVStation = !!station.chargingSpeed;
          
          return (
            <TouchableOpacity
              key={station.id}
              style={styles.stationCard}
              onPress={() => openStationDetails(station)}
            >
              <View style={styles.stationHeader}>
                <View style={styles.stationInfo}>
                  <View style={styles.stationTitleRow}>
                    {isEVStation ? (
                      <Zap size={20} color={getChargingSpeedColor(station.chargingSpeed!)} />
                    ) : (
                      <Fuel size={20} color={colors.accent} />
                    )}
                    <Text style={styles.stationName}>{station.name}</Text>
                  </View>
                  <Text style={styles.stationNetwork}>{station.networkProvider}</Text>
                </View>
                <View style={styles.stationMeta}>
                  <View style={styles.rating}>
                    {renderStars(station.rating)}
                    <Text style={styles.ratingText}>{station.rating}</Text>
                  </View>
                  <View style={[styles.availabilityBadge, { backgroundColor: availability.color }]}>
                    <Text style={styles.availabilityText}>{availability.text}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.stationAddress}>{station.address}</Text>

              <View style={styles.stationDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{station.distance}</Text>
                </View>
                
                {isEVStation ? (
                  <>
                    <View style={styles.detailItem}>
                      <Plug size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {station.availablePorts}/{station.totalPorts} available
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Zap size={16} color={getChargingSpeedColor(station.chargingSpeed!)} />
                      <Text style={styles.detailText}>{getChargingSpeedLabel(station.chargingSpeed!)}</Text>
                    </View>
                    {station.estimatedTime && (
                      <View style={styles.detailItem}>
                        <Clock size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{station.estimatedTime}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.detailItem}>
                    <Fuel size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {station.fuelTypes?.join(', ') || 'Multiple fuel types'}
                    </Text>
                  </View>
                )}
              </View>

              {isEVStation && station.connectorTypes && (
                <View style={styles.connectorTypes}>
                  {station.connectorTypes.map((type, index) => (
                    <View key={index} style={styles.connectorTag}>
                      <Text style={styles.connectorText}>{type}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.stationFooter}>
                <Text style={styles.pricing}>{station.pricing}</Text>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => getDirections(station)}
                >
                  <Navigation size={16} color={colors.primary} />
                  <Text style={styles.directionsText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredStations.length === 0 && (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No Stations Found</Text>
            <Text style={styles.emptyStateText}>
              No {activeTab === 'all' ? '' : activeTab} stations found in your area. Try adjusting your search or filters.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Station Details Modal */}
      <Modal
        visible={showStationDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStationDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Station Details</Text>
            <TouchableOpacity onPress={() => setShowStationDetails(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedStation && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.stationDetailCard}>
                <Text style={styles.detailStationName}>{selectedStation.name}</Text>
                <Text style={styles.detailStationNetwork}>{selectedStation.networkProvider}</Text>
                <Text style={styles.detailStationAddress}>{selectedStation.address}</Text>

                {selectedStation.chargingSpeed ? (
                  <>
                    <View style={styles.detailStats}>
                      <View style={styles.detailStatItem}>
                        <Plug size={24} color={colors.primary} />
                        <Text style={styles.detailStatNumber}>
                          {selectedStation.availablePorts}/{selectedStation.totalPorts}
                        </Text>
                        <Text style={styles.detailStatLabel}>Available Ports</Text>
                      </View>
                      <View style={styles.detailStatItem}>
                        <Zap size={24} color={getChargingSpeedColor(selectedStation.chargingSpeed)} />
                        <Text style={styles.detailStatNumber}>{selectedStation.chargingSpeed.toUpperCase()}</Text>
                        <Text style={styles.detailStatLabel}>Charging Speed</Text>
                      </View>
                      {selectedStation.estimatedTime && (
                        <View style={styles.detailStatItem}>
                          <Clock size={24} color={colors.accent} />
                          <Text style={styles.detailStatNumber}>{selectedStation.estimatedTime}</Text>
                          <Text style={styles.detailStatLabel}>Est. Time</Text>
                        </View>
                      )}
                    </View>

                    {selectedStation.connectorTypes && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Connector Types</Text>
                        <View style={styles.detailConnectors}>
                          {selectedStation.connectorTypes.map((type, index) => (
                            <View key={index} style={styles.detailConnectorTag}>
                              <Text style={styles.detailConnectorText}>{type}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.detailStats}>
                    <View style={styles.detailStatItem}>
                      <Fuel size={24} color={colors.accent} />
                      <Text style={styles.detailStatNumber}>
                        {selectedStation.fuelTypes?.length || 3}
                      </Text>
                      <Text style={styles.detailStatLabel}>Fuel Types</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <Clock size={24} color={colors.secondary} />
                      <Text style={styles.detailStatNumber}>24/7</Text>
                      <Text style={styles.detailStatLabel}>Operating Hours</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Amenities</Text>
                  <View style={styles.amenitiesGrid}>
                    {selectedStation.amenities.map((amenity, index) => (
                      <View key={index} style={styles.amenityItem}>
                        {amenity === 'WiFi' && <Wifi size={16} color={colors.textSecondary} />}
                        {amenity === 'Food' && <Coffee size={16} color={colors.textSecondary} />}
                        {amenity === 'Parking' && <Car size={16} color={colors.textSecondary} />}
                        {!['WiFi', 'Food', 'Parking'].includes(amenity) && 
                          <CheckCircle size={16} color={colors.textSecondary} />}
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.pricingSection}>
                  <CreditCard size={20} color={colors.primary} />
                  <Text style={styles.pricingText}>{selectedStation.pricing}</Text>
                </View>
              </View>
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => {
                if (selectedStation) getDirections(selectedStation);
                setShowStationDetails(false);
              }}
            >
              <Navigation size={20} color="white" />
              <Text style={styles.navigateButtonText}>Navigate to Station</Text>
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  filterButton: {
    backgroundColor: colors.background,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  stationsList: {
    flex: 1,
    padding: 20,
  },
  stationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stationName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    flex: 1,
  },
  stationNetwork: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.secondary,
  },
  stationMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  stationAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  stationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  connectorTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  connectorTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  connectorText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pricing: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
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
  stationDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailStationName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  detailStationNetwork: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    marginBottom: 8,
  },
  detailStationAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  detailStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  detailStatNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  detailStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },
  detailConnectors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailConnectorTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  detailConnectorText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pricingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});