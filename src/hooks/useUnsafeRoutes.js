import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const useUnsafeRoutes = (toast, userLocation) => {
  const [unsafeRoutes, setUnsafeRoutes] = useState([]);
  const { user } = useAuth();

  const fetchUnsafeRoutes = useCallback(async () => {
    const { data, error } = await supabase
      .from('unsafe_routes_reports')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error) {
      console.error("Error fetching unsafe routes:", error);
      if (toast) {
        toast({
          title: "Error al cargar rutas inseguras",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      setUnsafeRoutes(data || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchUnsafeRoutes();

    const channel = supabase
      .channel('unsafe_routes_reports_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'unsafe_routes_reports'
      }, payload => {
        console.log('Change received for unsafe_routes_reports!', payload);
        fetchUnsafeRoutes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnsafeRoutes]);

  const reportUnsafeRoute = async (latitude, longitude, description, category = 'General') => {
    if (!description) {
      if (toast) toast({
        title: "Descripción requerida",
        description: "Por favor, proporciona una descripción del peligro.",
        variant: "destructive"
      });
      return;
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      if (toast) toast({
        title: "Ubicación inválida",
        description: "No se pudo obtener una ubicación válida para el reporte.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('unsafe_routes_reports')
      .insert([{
        user_id: user ? user.id : null,
        latitude,
        longitude,
        description,
        category
      }]);

    if (error) {
      console.error("Error reporting unsafe route:", error);
      if (toast) toast({
        title: "Error al reportar ruta",
        description: error.message,
        variant: "destructive"
      });
    } else {
      if (toast) toast({
        title: "Ruta Insegura Reportada",
        description: "Gracias por tu contribución a la seguridad de la comunidad."
      });
    }
    return !error;
  };

  const handleMapClickToReport = useCallback(async (latlng) => {
    const description = prompt("Describe brevemente el peligro en esta ubicación:");
    if (description && latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
      await reportUnsafeRoute(latlng.lat, latlng.lng, description);
    }
  }, [reportUnsafeRoute]);

  const handleReportUnsafeRouteOnDialog = useCallback(async (description) => {
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      await reportUnsafeRoute(userLocation.lat, userLocation.lng, description);
    } else {
      if (toast) {
        toast({
          title: "Ubicación no disponible",
          description: "No se pudo reportar la ruta porque tu ubicación actual no está disponible.",
          variant: "destructive"
        });
      }
    }
  }, [reportUnsafeRoute, userLocation]);

  const enviarAlertaDeEmergencia = async (mensaje = "Alerta de emergencia") => {
    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      if (toast) {
        toast({
          title: "Ubicación no disponible",
          description: "No se pudo enviar la alerta porque tu ubicación no está disponible.",
          variant: "destructive"
        });
      }
      return false;
    }

    const { error } = await supabase
      .from('alerts')
      .insert([{
        device: user?.email || 'desconocido',
        message: mensaje,
        lat: userLocation.lat,
        lon: userLocation.lng,
        status: 'pendiente'
      }]);

    if (error) {
      console.error("Error al guardar alerta:", error);
      if (toast) {
        toast({
          title: "Error al enviar alerta",
          description: error.message,
          variant: "destructive"
        });
      }
      return false;
    }

    if (toast) {
      toast({
        title: "Alerta enviada",
        description: "Tu ubicación ha sido reportada."
      });
    }

    return true;
  };

  return {
    unsafeRoutes,
    fetchUnsafeRoutes,
    handleMapClickToReport,
    handleReportUnsafeRouteOnDialog,
    enviarAlertaDeEmergencia
  };
};

export default useUnsafeRoutes;
