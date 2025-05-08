
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import LocationMarker from '@/components/dashboard/LocationMarker';

export const redIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export const blueIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export const orangeIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-orange.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});


const MapComponent = ({ 
  mapCenter, 
  userLocation, 
  sigfoxDeviceData, 
  onLocationFound, 
  onMapClickToReport,
  children // For map layers like alerts and unsafe routes
}) => {
  
  return (
    <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-300 flex items-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" /> Mapa Interactivo
        </CardTitle>
        <CardDescription className="text-gray-400">Visualiza tu ubicación, rutas inseguras y alertas.</CardDescription>
      </CardHeader>
      <CardContent className="h-[500px] p-0 relative">
        <MapContainer 
            center={mapCenter} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="h-full z-0" 
            key={mapCenter.toString() + (userLocation ? `${userLocation.lat}-${userLocation.lng}`: '')}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            onLocationFound={onLocationFound} 
            onMapClick={onMapClickToReport}
          />
          
          {children}

          {sigfoxDeviceData && typeof sigfoxDeviceData.latitude === 'number' && typeof sigfoxDeviceData.longitude === 'number' && (
            <Marker position={[sigfoxDeviceData.latitude, sigfoxDeviceData.longitude]} icon={blueIcon}>
              <Popup>
                Dispositivo Sigfox (Simulado) <br />
                Batería: {sigfoxDeviceData.battery_percent}% <br />
                Precisión: {sigfoxDeviceData.accuracy_m}m <br />
                Última vez: {sigfoxDeviceData.formattedTime}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default MapComponent;
  