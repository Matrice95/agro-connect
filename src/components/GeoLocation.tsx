import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, FeatureGroup, Circle, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Map as LeafletMap, LatLng, Icon, LeafletMouseEvent, DivIcon } from 'leaflet';
import { Search, Crosshair, LogOut, Plus, MapPin, Navigation, Map, Edit, Trash2, MoreVertical, LayoutDashboard, Info, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { availableLocations, citiesCoordinates } from '../data/locations';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet default icon path issues
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Créer des icônes personnalisées pour les marqueurs
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const blueIcon = createCustomIcon('blue');
const redIcon = createCustomIcon('red');

function MapInteraction({ center, onMapClick, isAddingZone, searchMarker }: { 
  center: [number, number], 
  onMapClick: (e: LeafletMouseEvent) => void,
  isAddingZone: boolean,
  searchMarker: [number, number] | null
}) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  useEffect(() => {
    if (isAddingZone) {
      map.on('click', onMapClick);
      return () => {
        map.off('click', onMapClick);
      };
    }
  }, [map, onMapClick, isAddingZone]);

  return null;
}

export function GeoLocation() {
  const navigate = useNavigate();
  const [position, setPosition] = useState<[number, number]>([7.539989, -5.547080]); // Côte d'Ivoire center
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<'name' | 'coordinates'>('name');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [tempArea, setTempArea] = useState<[number, number] | null>(null);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [editingArea, setEditingArea] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  const [isLocationAvailable, setIsLocationAvailable] = useState(false);

  useEffect(() => {
    loadUserAreas();
    checkAuth();
    checkAdminStatus();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
    }
  };

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
    }
  };

  const loadUserAreas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des zones');
    }
  };

  const handleGeolocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition: [number, number] = [latitude, longitude];
        setPosition(newPosition);
        setSearchMarker(newPosition);
        mapRef.current?.setView(newPosition, 15);
        setLoading(false);
        
        // Vérifier si la position est proche d'une localité disponible
        const isAvailable = availableLocations.some(loc => {
          const distance = calculateDistance(
            newPosition[0],
            newPosition[1],
            loc.coordinates[0],
            loc.coordinates[1]
          );
          return distance <= 50; // Distance en kilomètres
        });
        setIsLocationAvailable(isAvailable);
        
        toast.success('Position trouvée !');
      },
      (error) => {
        setLoading(false);
        toast.error('Erreur de géolocalisation : ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchMode === 'coordinates') {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lon)) {
        toast.error('Coordonnées invalides');
        return;
      }
      
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        toast.error('Coordonnées hors limites');
        return;
      }
      
      const newPosition: [number, number] = [lat, lon];
      setPosition(newPosition);
      setSearchMarker(newPosition);
      mapRef.current?.setView(newPosition, 15);
      
      // Vérifier si les coordonnées sont proches d'une localité disponible
      const isAvailable = availableLocations.some(loc => {
        const distance = calculateDistance(lat, lon, loc.coordinates[0], loc.coordinates[1]);
        return distance <= 50; // Distance en kilomètres
      });
      setIsLocationAvailable(isAvailable);
      
      toast.success('Position trouvée !');
      return;
    }

    if (!searchQuery.trim()) return;

    // Rechercher dans les localités disponibles
    const cityName = searchQuery.toLowerCase().trim();
    const coordinates = citiesCoordinates[cityName];

    if (coordinates) {
      setPosition(coordinates);
      setSearchMarker(coordinates);
      
      // Vérifier si la ville est disponible dans availableLocations
      const location = availableLocations.find(
        loc => loc.name.toLowerCase() === cityName
      );

      if (location) {
        setSelectedLocation(location);
        setIsLocationAvailable(true);
        mapRef.current?.setView(coordinates, 12);
        toast.success(`${cityName.charAt(0).toUpperCase() + cityName.slice(1)} trouvée !`);
      } else {
        setIsLocationAvailable(false);
        mapRef.current?.setView(coordinates, 12);
        toast(`${cityName.charAt(0).toUpperCase() + cityName.slice(1)} n'est pas encore disponible pour le suivi agrométéorologique.`, {
          icon: 'ℹ️',
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        });
      }
    } else {
      toast.error('Ville non trouvée');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    setSearchMarker(location.coordinates);
    setIsLocationAvailable(true);
    mapRef.current?.setView(location.coordinates, 12);
  };

  return (
    <div className="min-h-screen bg-agro-gradient">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Géolocalisation</h1>
                <p className="text-sm opacity-90 font-light">Définissez vos zones d'intérêt</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  Administration
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-4">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Localités disponibles</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Actuellement, seule la région de Korhogo est disponible avec les cultures suivantes :
                      </p>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm text-blue-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Anacarde
                        </li>
                        <li className="text-sm text-blue-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Mangue
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Search Type Selector */}
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => setSearchMode('name')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      searchMode === 'name'
                        ? 'bg-green-600 text-white font-medium'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Localité
                  </button>
                  <button
                    onClick={() => setSearchMode('coordinates')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      searchMode === 'coordinates'
                        ? 'bg-green-600 text-white font-medium'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Coordonnées géographiques
                  </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  {searchMode === 'name' ? (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une localité..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-1">
                      <div className="relative flex-1">
                        <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="Latitude (ex: 9.458)"
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 rotate-90" />
                        <input
                          type="text"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="Longitude (ex: -5.629)"
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium min-w-[100px]"
                  >
                    Rechercher
                  </button>
                </form>

                {/* Action Buttons */}
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={handleGeolocation}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    Ma position
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Areas Section */}
          <div className="grid md:grid-cols-4 gap-6 p-6">
            <div className="md:col-span-3 h-[600px] rounded-xl overflow-hidden shadow-inner border border-gray-200">
              <MapContainer
                center={position}
                zoom={7}
                className="h-full w-full"
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapInteraction 
                  center={position} 
                  onMapClick={() => {}}
                  isAddingZone={false}
                  searchMarker={searchMarker}
                />
                
                {/* Marqueurs des localités disponibles */}
                {availableLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={location.coordinates}
                    icon={blueIcon}
                    eventHandlers={{
                      click: () => handleLocationClick(location),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-900">Cultures disponibles :</h4>
                          <ul className="mt-1 space-y-1">
                            {location.crops.map((crop, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {crop.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => navigate(`/dashboard/${location.id}`)}
                          className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Voir le tableau de bord
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Marqueur de recherche */}
                {searchMarker && (
                  <Marker
                    position={searchMarker}
                    icon={isLocationAvailable ? blueIcon : redIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900">Position recherchée</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {isLocationAvailable 
                            ? 'Cette zone est disponible pour le suivi agrométéorologique'
                            : 'Cette zone n\'est pas encore disponible'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div className="space-y-4">
              {selectedLocation ? (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    {selectedLocation.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedLocation.description}
                  </p>
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Cultures disponibles :</h3>
                    {selectedLocation.crops.map((crop: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-800">{crop.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{crop.description}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/${selectedLocation.id}`)}
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Voir le tableau de bord
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Aucune localité sélectionnée</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Cliquez sur un marqueur sur la carte ou recherchez une localité
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}