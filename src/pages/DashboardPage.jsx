
import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

import MapComponent from '@/components/dashboard/MapComponent.jsx';
import EmergencyActionsCard from '@/components/dashboard/EmergencyActionsCard.jsx';
import DeviceStatusCard from '@/components/dashboard/DeviceStatusCard.jsx';
import InfoHelpCard from '@/components/dashboard/InfoHelpCard.jsx';
import ShareLocationCard from '@/components/dashboard/ShareLocationCard.jsx';
import AlertsMapLayer from '@/components/dashboard/AlertsMapLayer.jsx';
import UnsafeRoutesMapLayer from '@/components/dashboard/UnsafeRoutesMapLayer.jsx';


import useUserLocation from '@/hooks/useUserLocation.js';
import useSigfoxData from '@/hooks/useSigfoxData.js';
import useUnsafeRoutes from '@/hooks/useUnsafeRoutes.js'; // Now uses Supabase

const DashboardPage = () => {
  const { toast } = useToast();
  
  const { userLocation, mapCenter, setMapCenter, handleLocationFound } = useUserLocation(toast);
  const { sigfoxDeviceData, simulateSigfoxData } = useSigfoxData(toast, setMapCenter);
  // useUnsafeRoutes now handles its own data fetching and reporting logic with Supabase
  const { unsafeRoutes, handleMapClickToReport, handleReportUnsafeRouteOnDialog } = useUnsafeRoutes(toast, userLocation);

  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  const fetchEmergencyAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select(`
        id, latitude, longitude, message, created_at,
        user:user_id ( profiles ( username, full_name ) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching emergency alerts:", error);
      toast({ title: "Error al cargar alertas", description: error.message, variant: "destructive" });
    } else {
      setEmergencyAlerts(data || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmergencyAlerts();

    const channel = supabase
      .channel('emergency_alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, payload => {
        console.log('Change received for emergency_alerts!', payload);
        fetchEmergencyAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmergencyAlerts]);


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <MapComponent
        mapCenter={mapCenter}
        userLocation={userLocation}
        sigfoxDeviceData={sigfoxDeviceData}
        onLocationFound={handleLocationFound}
        onMapClickToReport={handleMapClickToReport} 
      >
        <UnsafeRoutesMapLayer unsafeRoutes={unsafeRoutes} />
        <AlertsMapLayer emergencyAlerts={emergencyAlerts} />
      </MapComponent>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EmergencyActionsCard
          onReportUnsafeRoute={handleReportUnsafeRouteOnDialog}
          variants={cardVariants}
        />
        <DeviceStatusCard
          userLocation={userLocation}
          sigfoxDeviceData={sigfoxDeviceData}
          onSimulateSigfoxData={simulateSigfoxData}
          variants={cardVariants}
        />
        <ShareLocationCard variants={cardVariants} />
        <InfoHelpCard variants={cardVariants} className="md:col-span-2 lg:col-span-1" />
      </div>
    </motion.div>
  );
};

export default DashboardPage;
  