import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
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

// Declare global google maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewComponent({
  onRouteSelect,
  showSearch = true,
  initialRegion,
}: MapViewComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadGoogleMapsScript();
    getCurrentLocation();
  }, []);

  const loadGoogleMapsScript = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Set up callback
    window.initMap = initializeMap;

    // Add script to document
    document.head.appendChild(script);

    // Handle script load error
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      Alert.alert('Error', 'Failed to load Google Maps. Please check your internet connection.');
    };
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    try {
      const defaultCenter = initialRegion 
        ? { lat: initialRegion.latitude, lng: initialRegion.longitude }
        : { lat: 37.78825, lng: -122.4324 }; // San Francisco default

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMapLoaded(true);
      console.log('Google Maps initialized successfully');

      // Add current location marker if available
      if (currentLocation) {
        addCurrentLocationMarker();
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // Update map center if map is loaded
          if (googleMapRef.current) {
            googleMapRef.current.setCenter({
              lat: location.latitude,
              lng: location.longitude
            });
            addCurrentLocationMarker();
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (San Francisco)
          const defaultLocation = {
            latitude: 37.78825,
            longitude: -122.4324,
          };
          setCurrentLocation(defaultLocation);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      // Use default location
      setCurrentLocation({
        latitude: 37.78825,
        longitude: -122.4324,
      });
    }
  };

  const addCurrentLocationMarker = () => {
    if (!googleMapRef.current || !currentLocation) return;

    new window.google.maps.Marker({
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      map: googleMapRef.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#2563EB" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      },
    });
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

  const selectSearchResult = async (result: SearchResult) => {
    setSelectedDestination(result.structured_formatting.main_text);
    setSearchQuery(result.structured_formatting.main_text);
    setShowSearchResults(false);
    
    // Get place details and add marker
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,name,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.result && data.result.geometry && googleMapRef.current) {
        const location = data.result.geometry.location;
        
        // Add destination marker
        new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: googleMapRef.current,
          title: data.result.name || data.result.formatted_address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#EF4444" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
          },
        });
        
        // Center map on destination
        googleMapRef.current.setCenter({ lat: location.lat, lng: location.lng });
        googleMapRef.current.setZoom(15);
        
        // Calculate mock routes
        calculateRoutes();
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
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
    
    // Clear markers and reset map
    if (googleMapRef.current) {
      // This would clear all markers - in a real app you'd want to manage markers more carefully
      initializeMap();
    }
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

  const centerOnCurrentLocation = () => {
    if (googleMapRef.current && currentLocation) {
      googleMapRef.current.setCenter({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      });
      googleMapRef.current.setZoom(15);
    } else {
      getCurrentLocation();
    }
  };

  const changeMapType = () => {
    if (!googleMapRef.current) return;
    
    const currentType = googleMapRef.current.getMapTypeId();
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % types.length;
    
    googleMapRef.current.setMapTypeId(types[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Google Maps Container */}
      <View style={styles.mapContainer}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
          }}
        />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading Google Maps...</Text>
          </View>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={centerOnCurrentLocation}>
            <Crosshair size={20} color="#2563EB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={changeMapType}>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 248, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B5284',
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