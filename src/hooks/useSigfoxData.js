
import { useState } from 'react';
import { decodeOysterGPS } from '@/lib/sigfoxDecoder';
import { formatUnixTimestamp } from '@/lib/dateUtils';

const useSigfoxData = (toast, setMapCenter) => {
  const [sigfoxDeviceData, setSigfoxDeviceData] = useState(null);

  const simulateSigfoxData = () => {
    const payloadHex = "001c761b03fab1be005a60"; // Example payload
    const decodedData = decodeOysterGPS(payloadHex);
    const mockTimestamp = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600);
    
    const newSigfoxData = {
      ...decodedData,
      timestamp: mockTimestamp,
      formattedTime: formatUnixTimestamp(mockTimestamp),
      rssi: -Math.floor(Math.random() * 50 + 50) // Simulate RSSI value
    };
    setSigfoxDeviceData(newSigfoxData);

    if (newSigfoxData.latitude !== null && newSigfoxData.longitude !== null && typeof newSigfoxData.latitude === 'number' && typeof newSigfoxData.longitude === 'number') {
        if(setMapCenter) setMapCenter([newSigfoxData.latitude, newSigfoxData.longitude]);
    }
    if (toast) {
        toast({ title: "Datos Sigfox Simulados", description: "Se han cargado datos de ejemplo de un dispositivo Sigfox." });
    }
  };

  return { sigfoxDeviceData, simulateSigfoxData };
};

export default useSigfoxData;
  