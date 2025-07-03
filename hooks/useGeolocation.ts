import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  distance?: number;
}

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
  isInRange: boolean;
}

// Coordenadas da Praça Cívica, Goiânia
const EVENT_LOCATION = {
  latitude: -16.6864,
  longitude: -49.2653,
  name: 'Praça Cívica, Goiânia'
};

// Raio de alcance em km
const TARGET_RADIUS = 200;

// Função para calcular distância entre dois pontos (fórmula de Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
    isInRange: false
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalização não suportada pelo navegador'
      }));
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const distance = calculateDistance(
        latitude, 
        longitude, 
        EVENT_LOCATION.latitude, 
        EVENT_LOCATION.longitude
      );

      const isInRange = distance <= TARGET_RADIUS;

      setState({
        location: {
          latitude,
          longitude,
          distance: Math.round(distance)
        },
        loading: false,
        error: null,
        isInRange
      });
    };

    const error = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Erro de geolocalização: ${error.message}`
      }));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutos
    });
  }, []);

  const getRegionalMessage = () => {
    if (!state.location) return null;
    
    if (state.isInRange) {
      return `Você está a ${state.location.distance}km do evento! 🎯`;
    } else {
      return `Você está a ${state.location.distance}km do evento. Considere a viagem! 🚗`;
    }
  };

  const getRegionalKeywords = () => {
    if (!state.isInRange) return [];
    
    // Keywords baseadas na distância
    if (state.location && state.location.distance) {
      if (state.location.distance <= 50) {
        return ['Goiânia', 'região metropolitana', 'próximo ao evento'];
      } else if (state.location.distance <= 100) {
        return ['Goiás', 'interior', 'região central'];
      } else {
        return ['Centro-Oeste', 'DF', 'MG', 'região'];
      }
    }
    
    return [];
  };

  return {
    ...state,
    eventLocation: EVENT_LOCATION,
    targetRadius: TARGET_RADIUS,
    getRegionalMessage,
    getRegionalKeywords
  };
}; 