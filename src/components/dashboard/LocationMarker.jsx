
import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const userIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
});

function LocationMarker({ onLocationFound, onMapClick, isSharing }) {
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);

  const map = useMapEvents({
    click(e) {
      if (e.latlng && typeof e.latlng.lat === 'number' && typeof e.latlng.lng === 'number') {
        onMapClick(e.latlng);
      }
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("La geolocalización no es soportada por este navegador.");
      return;
    }

    if (isSharing) {
      map.locate(); // Get initial location for sharing
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
            setPosition(latlng);
            onLocationFound(latlng); 
            map.panTo(latlng); // Gently pan, don't flyTo to avoid aggressive zoom changes during sharing
          }
        },
        (err) => {
          console.error(`ERROR(${err.code}): ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      map.locate({setView: true, maxZoom: 16}); // Standard locate when not sharing
      
      map.on('locationfound', (e) => {
         if (e.latlng && typeof e.latlng.lat === 'number' && typeof e.latlng.lng === 'number') {
            setPosition(e.latlng);
            onLocationFound(e.latlng);
         }
      });
      map.on('locationerror', (e) => {
        console.error("Error de geolocalización:", e.message);
      });
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.off('locationfound');
      map.off('locationerror');
    };
  }, [map, onLocationFound, isSharing]);


  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>{isSharing ? "Compartiendo esta ubicación en tiempo real (simulado)" : "Estás aquí"}</Popup>
    </Marker>
  );
}

export default LocationMarker;
  