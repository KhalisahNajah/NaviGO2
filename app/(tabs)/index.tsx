import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Fuel,
  Clock,
  DollarSign,
  Route,
  Search,
  Target,
  Settings,
  X,
  Play,
} from 'lucide-react-native';
import MapViewComponent from '@/components/MapView';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  fuelCost: string;
  tollCost: string;
  totalCost: string;
  type: 'fastest' | 'cheapest' | 'balanced';
}

const { height } = Dimensions.get('window');

export default function Navigate() {
  const { theme, colors } = useContext(ThemeContext);
  const { getCurrencySymbol } = useUser();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const mockRoutes: RouteOption[] = [
    {
      id: '1',
      name: 'Federal Highway',
      distance: '45.2 km',
      duration: '42 min',
      fuelCost: `${getCurrencySymbol()}8.50`,
      tollCost: `${getCurrencySymbol()}2.00`,
      totalCost: `${getCurrencySymbol()}10.50`,
      type: 'fastest',
    },
    {
      id: '2',
      name: 'Local Roads',
      distance: '52.1 km',
      duration: '58 min',
      fuelCost: `${getCurrencySymbol()}9.80`,
      tollCost: `${getCurrencySymbol()}0.00`,
      totalCost: `${getCurrencySymbol()}9.80`,
      type: 'cheapest',
    },
    {
      id: '3',
      name: 'Express Highway',
      distance: '47.8 km',
      duration: '38 min',
      fuelCost: `${getCurrencySymbol()}9.00`,
      tollCost: `${getCurrencySymbol()}4.50`,
      totalCost: `${getCurrencySymbol()}13.50`,
      type: 'balanced',
    },
  ];

  const handleSearch = () => {
    if (fromLocation && toLocation) {
      setIsSearching(true);
      setTimeout(() => {
        setRoutes(mockRoutes);
        setIsSearching(false);
      }, 1500);
    }
  };

  const startNavigation = (route: RouteOption) => {
    setSelectedRoute(route);
    setShowRouteModal(true);
  };

  const confirmNavigation = () => {
    setShowRouteModal(false);
    Alert.alert(
      'Navigation Started',
      `Starting navigation via ${selectedRoute?.name}. Total cost: ${selectedRoute?.totalCost}`,
      [{ text: 'OK' }]
    );
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'fastest':
        return colors.secondary;
      case 'cheapest':
        return colors.accent;
      case 'balanced':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getRouteTypeLabel = (type: string) => {
    switch (type) {
      case 'fastest':
        return 'Fastest';
      case 'cheapest':
        return 'Cheapest';
      case 'balanced':
        return 'Balanced';
      default:
        return '';
    }
  };

  const clearSearch = () => {
    setFromLocation('');
    setToLocation('');
    setRoutes([]);
    setSelectedRoute(null);
    setShowSearch(false);
  };

  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          showSearch={false}
          onRouteSelect={(route) => {
            console.log('Route selected:', route);
          }}
        />
      </View>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://i.pinimg.com/736x/2c/42/0b/2c420ba439ecfff12f1b214fe42783f5.jpg' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Overlay */}
      <View style={styles.searchOverlay}>
        <TouchableOpacity 
          style={styles.searchTrigger}
          onPress={() => setShowSearch(true)}
        >
          <Search size={20} color={colors.textSecondary} />
          <Text style={styles.searchTriggerText}>Where to?</Text>
        </TouchableOpacity>
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearch(false)}
      >
        <SafeAreaView style={styles.searchModalContainer}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Plan Your Route</Text>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.inputContainer}>
              <Target size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="From (Current Location)"
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MapPin size={20} color={colors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="To (Destination)"
                value={toLocation}
                onChangeText={setToLocation}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.searchButton, (!fromLocation || !toLocation) && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!fromLocation || !toLocation || isSearching}
            >
              <Search size={20} color="white" />
              <Text style={styles.searchButtonText}>
                {isSearching ? 'Finding Routes...' : 'Find Routes'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Routes Results */}
          <ScrollView style={styles.routesSection} showsVerticalScrollIndicator={false}>
            {routes.length > 0 && (
              <View style={styles.routesHeader}>
                <Text style={styles.routesTitle}>Recommended Routes</Text>
                <Text style={styles.routesSubtitle}>Choose the best option for your trip</Text>
              </View>
            )}

            {routes.map((route) => (
              <TouchableOpacity 
                key={route.id} 
                style={styles.routeCard}
                onPress={() => {
                  startNavigation(route);
                  setShowSearch(false);
                }}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <View style={[styles.routeType, { backgroundColor: getRouteTypeColor(route.type) }]}>
                      <Text style={styles.routeTypeText}>{getRouteTypeLabel(route.type)}</Text>
                    </View>
                  </View>
                  <View style={styles.navigationButton}>
                    <Navigation size={20} color={colors.primary} />
                  </View>
                </View>

                <View style={styles.routeDetails}>
                  <View style={styles.routeDetail}>
                    <Route size={16} color={colors.textSecondary} />
                    <Text style={styles.routeDetailText}>{route.distance}</Text>
                  </View>
                  <View style={styles.routeDetail}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={styles.routeDetailText}>{route.duration}</Text>
                  </View>
                  <View style={styles.routeDetail}>
                    <Fuel size={16} color={colors.textSecondary} />
                    <Text style={styles.routeDetailText}>{route.fuelCost}</Text>
                  </View>
                  <View style={styles.routeDetail}>
                    <DollarSign size={16} color={colors.textSecondary} />
                    <Text style={styles.routeDetailText}>{route.totalCost}</Text>
                  </View>
                </View>

                <View style={styles.routeCosts}>
                  <Text style={styles.costBreakdown}>
                    Fuel: {route.fuelCost} • Tolls: {route.tollCost}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {isSearching && (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Calculating routes and fuel costs...</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Routes Overlay (when routes are found) */}
      {routes.length > 0 && !showSearch && (
        <View style={styles.routesOverlay}>
          <View style={styles.routesOverlayHeader}>
            <Text style={styles.routesOverlayTitle}>Recommended Routes</Text>
            <Text style={styles.routesOverlaySubtitle}>Choose the best option for your trip</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routesScrollView}>
            {routes.map((route) => (
              <TouchableOpacity 
                key={route.id} 
                style={styles.routeOverlayCard}
                onPress={() => startNavigation(route)}
              >
                <View style={styles.routeOverlayHeader}>
                  <Text style={styles.routeOverlayName}>{route.name}</Text>
                  <View style={[styles.routeOverlayType, { backgroundColor: getRouteTypeColor(route.type) }]}>
                    <Text style={styles.routeOverlayTypeText}>{getRouteTypeLabel(route.type)}</Text>
                  </View>
                </View>

                <View style={styles.routeOverlayDetails}>
                  <View style={styles.routeOverlayDetail}>
                    <Route size={14} color={colors.textSecondary} />
                    <Text style={styles.routeOverlayDetailText}>{route.distance}</Text>
                  </View>
                  <View style={styles.routeOverlayDetail}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={styles.routeOverlayDetailText}>{route.duration}</Text>
                  </View>
                  <View style={styles.routeOverlayDetail}>
                    <DollarSign size={14} color={colors.textSecondary} />
                    <Text style={styles.routeOverlayDetailText}>{route.totalCost}</Text>
                  </View>
                </View>

                <Text style={styles.routeOverlayCosts}>
                  Fuel: {route.fuelCost} • Tolls: {route.tollCost}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Navigation Confirmation Modal */}
      <Modal
        visible={showRouteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Navigation</Text>
            <TouchableOpacity onPress={() => setShowRouteModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedRoute && (
            <View style={styles.modalContent}>
              <View style={styles.selectedRouteCard}>
                <View style={styles.selectedRouteHeader}>
                  <Text style={styles.selectedRouteName}>{selectedRoute.name}</Text>
                  <View style={[styles.selectedRouteType, { backgroundColor: getRouteTypeColor(selectedRoute.type) }]}>
                    <Text style={styles.selectedRouteTypeText}>{getRouteTypeLabel(selectedRoute.type)}</Text>
                  </View>
                </View>

                <View style={styles.selectedRouteDetails}>
                  <View style={styles.selectedRouteDetail}>
                    <Route size={20} color={colors.textSecondary} />
                    <Text style={styles.selectedRouteDetailText}>{selectedRoute.distance}</Text>
                  </View>
                  <View style={styles.selectedRouteDetail}>
                    <Clock size={20} color={colors.textSecondary} />
                    <Text style={styles.selectedRouteDetailText}>{selectedRoute.duration}</Text>
                  </View>
                  <View style={styles.selectedRouteDetail}>
                    <DollarSign size={20} color={colors.textSecondary} />
                    <Text style={styles.selectedRouteDetailText}>{selectedRoute.totalCost}</Text>
                  </View>
                </View>

                <View style={styles.costBreakdownCard}>
                  <Text style={styles.costBreakdownTitle}>Cost Breakdown</Text>
                  <View style={styles.costBreakdownRow}>
                    <Text style={styles.costBreakdownLabel}>Fuel Cost:</Text>
                    <Text style={styles.costBreakdownValue}>{selectedRoute.fuelCost}</Text>
                  </View>
                  <View style={styles.costBreakdownRow}>
                    <Text style={styles.costBreakdownLabel}>Toll Cost:</Text>
                    <Text style={styles.costBreakdownValue}>{selectedRoute.tollCost}</Text>
                  </View>
                  <View style={[styles.costBreakdownRow, styles.totalCostRow]}>
                    <Text style={styles.totalCostLabel}>Total Cost:</Text>
                    <Text style={styles.totalCostValue}>{selectedRoute.totalCost}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowRouteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.startNavigationButton} 
              onPress={confirmNavigation}
            >
              <Play size={20} color="white" />
              <Text style={styles.startNavigationButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: `${colors.surface}F0`,
    backdropFilter: 'blur(10px)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 60,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  settingsButton: {
    padding: 8,
  },
  searchOverlay: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surface}F0`,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchTriggerText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    flex: 1,
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  routesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  routesHeader: {
    marginBottom: 16,
  },
  routesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  routesSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  routeType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeTypeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  navigationButton: {
    padding: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  routeCosts: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  costBreakdown: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  routesOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${colors.surface}F0`,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  routesOverlayHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  routesOverlayTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  routesOverlaySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  clearButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    padding: 8,
  },
  routesScrollView: {
    paddingLeft: 20,
  },
  routeOverlayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 280,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeOverlayName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    flex: 1,
  },
  routeOverlayType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeOverlayTypeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  routeOverlayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeOverlayDetail: {
    alignItems: 'center',
    gap: 4,
  },
  routeOverlayDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  routeOverlayCosts: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
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
  selectedRouteCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedRouteName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    flex: 1,
  },
  selectedRouteType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectedRouteTypeText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  selectedRouteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  selectedRouteDetail: {
    alignItems: 'center',
    gap: 8,
  },
  selectedRouteDetailText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  costBreakdownCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costBreakdownTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },
  costBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  costBreakdownLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  costBreakdownValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalCostLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  totalCostValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  startNavigationButton: {
    flex: 2,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startNavigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});