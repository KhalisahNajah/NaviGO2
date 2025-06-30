import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Search, Navigation, MapPin, Crosshair, Layers, Route, Clock, DollarSign, X, Map as MapIcon, CircleAlert as AlertCircle } from 'lucide-react-native';

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
}

interface RouteOption {
  id: string;
  summary: string;
  distance: string;
  duration: string;
  fuelCost: string;
  tollCost: string;
  totalCost: string;
  type: 'fastest' | 'cheapest' | 'balanced';
}

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyBzw3e-CjEHqn3iq4QfLS6GkQ6jrm7eqL0';

export default function MapViewComponent({
  onRouteSelect,
  showSearch = true,
  initialRegion,
}: MapViewComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to San Francisco if location access is denied
          setCurrentLocation({
            latitude: 37.78825,
            longitude: -122.4324,
          });
        }
      );
    } else {
      // Default location if geolocation is not supported
      setCurrentLocation({
        latitude: 37.78825,
        longitude: -122.4324,
      });
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

  const selectSearchResult = (result: SearchResult) => {
    setSelectedDestination(result.structured_formatting.main_text);
    setSearchQuery(result.structured_formatting.main_text);
    setShowSearchResults(false);
    
    // Calculate mock routes
    calculateRoutes();
  };

  const calculateRoutes = () => {
    const mockRoutes: RouteOption[] = [
      {
        id: '1',
        summary: 'Via Main Highway',
        distance: '24.5 km',
        duration: '28 min',
        fuelCost: '$4.20',
        tollCost: '$2.50',
        totalCost: '$6.70',
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
        type: 'balanced',
      },
    ];
    
    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
    setShowRoutes(true);
  };

  const selectRoute = (route: RouteOption) => {
    setSelectedRoute(route);
    onRouteSelect?.(route);
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

  const openInGoogleMaps = () => {
    if (selectedDestination && currentLocation) {
      const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${encodeURIComponent(selectedDestination)}`;
      window.open(url, '_blank');
    } else if (selectedDestination) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(selectedDestination)}`;
      window.open(url, '_blank');
    } else {
      const url = 'https://www.google.com/maps';
      window.open(url, '_blank');
    }
  };

  const getStaticMapUrl = () => {
    const center = currentLocation 
      ? `${currentLocation.latitude},${currentLocation.longitude}`
      : '37.78825,-122.4324';
    
    const markers = currentLocation 
      ? `&markers=color:blue%7Clabel:A%7C${currentLocation.latitude},${currentLocation.longitude}`
      : '';
    
    const destinationMarker = selectedDestination && currentLocation
      ? `&markers=color:red%7Clabel:B%7C${currentLocation.latitude + 0.01},${currentLocation.longitude + 0.01}`
      : '';
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=13&size=${Math.floor(width)}x${Math.floor(height * 0.6)}&maptype=${mapType}&key=${GOOGLE_MAPS_API_KEY}${markers}${destinationMarker}`;
  };

  return (
    <View style={styles.container}>
      {/* Static Map Display */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: getStaticMapUrl() }}
          style={styles.staticMap}
          resizeMode="cover"
        />
        
        {/* Web Notice Overlay */}
        <View style={styles.webNoticeOverlay}>
          <View style={styles.webNotice}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.webNoticeText}>
              Interactive map available on mobile. Click "Open in Google Maps" for full navigation.
            </Text>
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={getCurrentLocation}>
            <Crosshair size={20} color="#2563EB" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const types: Array<'roadmap' | 'satellite' | 'hybrid'> = ['roadmap', 'satellite', 'hybrid'];
              const currentIndex = types.indexOf(mapType);
              const nextIndex = (currentIndex + 1) % types.length;
              setMapType(types[nextIndex]);
            }}
          >
            <Layers size={20} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={openInGoogleMaps}>
            <MapIcon size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

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

      {/* Route Options */}
      {showRoutes && routes.length > 0 && (
        <View style={styles.routeContainer}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Choose Route</Text>
            <TouchableOpacity style={styles.openMapsButton} onPress={openInGoogleMaps}>
              <MapIcon size={16} color="white" />
              <Text style={styles.openMapsButtonText}>Open in Google Maps</Text>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  staticMap: {
    width: '100%',
    height: '100%',
  },
  webNoticeOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  webNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webNoticeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 80,
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
    outlineStyle: 'none',
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
    top: 140,
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
    paddingBottom: 20,
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
  openMapsButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  openMapsButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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