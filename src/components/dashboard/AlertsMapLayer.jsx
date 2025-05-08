
import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import { orangeIcon } from './MapComponent'; // Assuming icons are exported from MapComponent or a shared file
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AlertsMapLayer = ({ emergencyAlerts }) => {
  return (
    <>
      {emergencyAlerts.map(alert => (
        (typeof alert.latitude === 'number' && typeof alert.longitude === 'number') &&
        <React.Fragment key={alert.id}>
          <Marker 
            position={[alert.latitude, alert.longitude]} 
            icon={orangeIcon}
          >
            <Popup>
              <strong>Alerta de Emergencia</strong><br />
              Usuario: {alert.user?.profiles?.username || alert.user?.profiles?.full_name || 'Desconocido'}<br />
              Mensaje: {alert.message || "Sin mensaje adicional"}<br />
              Reportado: {format(new Date(alert.created_at), "Pp", { locale: es })}
            </Popup>
          </Marker>
          <Circle 
            center={[alert.latitude, alert.longitude]} 
            radius={500} // Smaller radius for individual alerts, or make it configurable
            pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.1 }} 
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default AlertsMapLayer;
  