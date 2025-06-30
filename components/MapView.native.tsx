import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  Search,
  Navigation,
  MapPin,
  Crosshair,
  Layers,
  Route,
  Clock,
  DollarSign,
  X,
  Star,
} from 'lucide-react-native';

interface MapViewComponentProps {
  onRouteSelect?: (route: any) => void;
  showSearch?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface RouteOption {
  id: string;
  summary: string;
  distance: string;
  duration: string;
  fuelCost: string;
  tollCost: string;
  totalCost: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
  type: 'fastest' | 'cheapest' | 'balanced';
}

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyBzw3e-CjEHqn3iq4QfLS6GkQ6jrm7eqL0';

export default function MapViewComponent({
  onRouteSelect,
  showSearch = true,
  initialRegion,
}: MapViewComponentProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    latitude: number;
    longitude: number;
    title: string;
  } | null>(null);
  
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(currentLocation);
      setRegion({
        ...currentLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...currentLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}&types=establishment|geocode`
      );
      
      const data = await response.json();
      
      if (data.predictions) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.result && data.result.geometry) {
        const location = data.result.geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          title: data.result.name || data.result.formatted_address,
        };
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
    return null;
  };

  const selectSearchResult = async (result: SearchResult) => {
    const placeDetails = await getPlaceDetails(result.place_id);
    
    if (placeDetails) {
      setSelectedDestination(placeDetails);
      setSearchQuery(result.structured_formatting.main_text);
      setShowSearchResults(false);
      
      // Animate to the selected location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...placeDetails,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      // Calculate routes if we have user location
      if (userLocation) {
        calculateRoutes(userLocation, placeDetails);
      }
    }
  };

  const calculateRoutes = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => {
    try {
      // Mock route calculation - in a real app, you'd use Google Directions API
      const mockRoutes: RouteOption[] = [
        {
          id: '1',
          summary: 'Via Main Highway',
          distance: '24.5 km',
          duration: '28 min',
          fuelCost: '$4.20',
          tollCost: '$2.50',
          totalCost: '$6.70',
          coordinates: [
            origin,
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.3,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.3,
            },
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.7,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.7,
            },
            destination,
          ],
          type: 'fastest',
        },
        {
          id: '2',
          summary: 'Via Local Roads',
          distance: '28.2 km',
          duration: '35 min',
          fuelCost: '$4.80',
          tollCost: '$0.00',
          totalCost: '$4.80',
          coordinates: [
            origin,
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.2,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.4,
            },
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.6,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.8,
            },
            destination,
          ],
          type: 'cheapest',
        },
        {
          id: '3',
          summary: 'Via Express Route',
          distance: '26.1 km',
          duration: '32 min',
          fuelCost: '$4.50',
          tollCost: '$1.25',
          totalCost: '$5.75',
          coordinates: [
            origin,
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.4,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.2,
            },
            {
              latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.8,
              longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.6,
            },
            destination,
          ],
          type: 'balanced',
        },
      ];
      
      setRoutes(mockRoutes);
      setSelectedRoute(mockRoutes[0]);
      setShowRoutes(true);
    } catch (error) {
      console.error('Error calculating routes:', error);
    }
  };

  const selectRoute = (route: RouteOption) => {
    setSelectedRoute(route);
    onRouteSelect?.(route);
    
    // Fit the route on the map
    if (mapRef.current && route.coordinates.length > 0) {
      mapRef.current.fitToCoordinates(route.coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'fastest':
        return '#10B981';
      case 'cheapest':
        return '#F59E0B';
      case 'balanced':
        return '#2563EB';
      default:
        return '#6B7280';
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedDestination(null);
    setRoutes([]);
    setSelectedRoute(null);
    setShowRoutes(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType={mapType}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#2563EB"
          />
        )}
        
        {/* Destination Marker */}
        {selectedDestination && (
          <Marker
            coordinate={selectedDestination}
            title={selectedDestination.title}
            pinColor="#EF4444"
          />
        )}
        
        {/* Route Polyline */}
        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor={getRouteTypeColor(selectedRoute.type)}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for places..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchPlaces(text);
              }}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.place_id}
                  style={styles.searchResultItem}
                  onPress={() => selectSearchResult(result)}
                >
                  <MapPin size={16} color="#6B7280" />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultMain}>
                      {result.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.searchResultSecondary}>
                      {result.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={getCurrentLocation}>
          <Crosshair size={20} color="#2563EB" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
            const currentIndex = types.indexOf(mapType);
            const nextIndex = (currentIndex + 1) % types.length;
            setMapType(types[nextIndex]);
          }}
        >
          <Layers size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Route Options */}
      {showRoutes && routes.length > 0 && (
        <View style={styles.routeContainer}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Choose Route</Text>
            <TouchableOpacity onPress={() => setShowRoutes(false)}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  selectedRoute?.id === route.id && styles.selectedRouteCard,
                ]}
                onPress={() => selectRoute(route)}
              >
                <View style={styles.routeCardHeader}>
                  <Text style={styles.routeSummary}>{route.summary}</Text>
                  <View
                    style={[
                      styles.routeTypeBadge,
                      { backgroundColor: getRouteTypeColor(route.type) },
                    ]}
                  >
                    <Text style={styles.routeTypeText}>
                      {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.routeDetails}>
                  <View style={styles.routeDetail}>
                    <Route size={14} color="#6B7280" />
                    <Text style={styles.routeDetailText}>{route.distance}</Text>
                  </View>
                  <View style={styles.routeDetail}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.routeDetailText}>{route.duration}</Text>
                  </View>
                  <View style={styles.routeDetail}>
                    <DollarSign size={14} color="#6B7280" />
                    <Text style={styles.routeDetailText}>{route.totalCost}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  searchResults: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultMain: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  searchResultSecondary: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 140 : 120,
    gap: 12,
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  routeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  routeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginLeft: 20,
    marginRight: 8,
    minWidth: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteCard: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeSummary: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  routeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeTypeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  routeDetails: {
    gap: 8,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
});