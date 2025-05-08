
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MapPin, Wifi, BatteryCharging, PlusCircle, Navigation } from 'lucide-react';

const ConnectionStatus = () => {
  const [connectionInfo, setConnectionInfo] = useState(null);

  useEffect(() => {
    if (navigator.connection) {
      const updateConnectionStatus = () => {
        setConnectionInfo({
          type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
        });
      };
      updateConnectionStatus();
      navigator.connection.addEventListener('change', updateConnectionStatus);
      return () => navigator.connection.removeEventListener('change', updateConnectionStatus);
    } else {
      setConnectionInfo({ type: 'No disponible', downlink: 'N/A', rtt: 'N/A' });
    }
  }, []);

  let quality = 'desconocida';
  let color = 'text-gray-400';
  if (connectionInfo) {
    if (connectionInfo.type === '4g' || (connectionInfo.downlink && connectionInfo.downlink > 5)) {
      quality = 'Buena'; color = 'text-green-400';
    } else if (connectionInfo.type === '3g' || (connectionInfo.downlink && connectionInfo.downlink > 1)) {
      quality = 'Moderada'; color = 'text-yellow-400';
    } else if (connectionInfo.type !== 'No disponible') {
      quality = 'Débil'; color = 'text-red-400';
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Wifi className={`w-5 h-5 ${color}`} />
      <span className={color}>Conexión: {quality}</span>
      {connectionInfo && connectionInfo.downlink !== 'N/A' && <span className="text-xs text-gray-500">({connectionInfo.downlink} Mbps)</span>}
    </div>
  );
};

const DeviceStatusCard = ({ userLocation, sigfoxDeviceData, onSimulateSigfoxData, variants }) => {
  return (
    <motion.div variants={variants}>
      <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-purple-300 flex items-center">
            <Navigation className="mr-2 h-5 w-5 text-blue-400" /> Estado del Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-300">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span>Ubicación GPS: {userLocation && typeof userLocation.lat === 'number' ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Obteniendo...'}</span>
          </div>
          <ConnectionStatus />
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-5 h-5 text-green-400" />
            <span>Batería del Teléfono: {sigfoxDeviceData?.battery_percent ? `${sigfoxDeviceData.battery_percent}% (Sigfox)` : 'No disponible (simulado)'}</span>
          </div>
          <Button onClick={onSimulateSigfoxData} variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20">
            <PlusCircle className="mr-2 h-4 w-4" /> Simular Datos Sigfox
          </Button>
          {sigfoxDeviceData && (
            <div className="text-xs text-gray-400 border-t border-purple-700/50 pt-2 mt-2 space-y-1">
              <p><strong>Datos Sigfox:</strong></p>
              <p>Lat: {sigfoxDeviceData.latitude?.toFixed(4) || 'N/A'}, Lon: {sigfoxDeviceData.longitude?.toFixed(4) || 'N/A'}</p>
              <p>Precisión: {sigfoxDeviceData.accuracy_m !== null ? `${sigfoxDeviceData.accuracy_m}m` : 'N/A'}, Batería: {sigfoxDeviceData.battery_percent !== null ? `${sigfoxDeviceData.battery_percent}%` : 'N/A'}</p>
              <p>Última Actualización: {sigfoxDeviceData.formattedTime || 'N/A'}</p>
              <p>RSSI: {sigfoxDeviceData.rssi !== null ? `${sigfoxDeviceData.rssi} dBm` : 'N/A'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeviceStatusCard;
  