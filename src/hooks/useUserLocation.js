
import { useState, useCallback } from 'react';

const initialPosition = [20.5937, -100.3995]; // Default to a central location in Mexico

const useUserLocation = (toast) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialPosition);

  const handleLocationFound = useCallback((latlng) => {
    setUserLocation(latlng);
    if (latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
      setMapCenter([latlng.lat, latlng.lng]);
    }
    if (toast) {
        toast({ title: "Ubicación Encontrada", description: "Tu ubicación actual ha sido actualizada.", variant: "default" });
    }
  }, [toast]);

  return { userLocation, mapCenter, setMapCenter, handleLocationFound };
};

export default useUserLocation;
  