
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { redIcon } from './MapComponent'; // Assuming icons are exported
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UnsafeRoutesMapLayer = ({ unsafeRoutes }) => {
  return (
    <>
      {unsafeRoutes.map(route => (
        (typeof route.latitude === 'number' && typeof route.longitude === 'number') &&
        <Marker key={route.id} position={[route.latitude, route.longitude]} icon={redIcon}>
          <Popup>
            <strong>Ruta Insegura Reportada</strong><br />
            Descripción: {route.description}<br />
            Categoría: {route.category || 'General'}<br />
            Reportado: {format(new Date(route.reported_at), "Pp", { locale: es })}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default UnsafeRoutesMapLayer;
  