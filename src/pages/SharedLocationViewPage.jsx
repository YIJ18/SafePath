
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, UserCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const sharedUserIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-violet.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const SharedLocationViewPage = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  const [sharedLocationData, setSharedLocationData] = useState(null);
  const [sharerProfile, setSharerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, -100.3995]); // Default center

  const fetchSharedLocation = useCallback(async () => {
    if (!shareId) return;

    const { data, error: fetchError } = await supabase
      .from('shared_locations')
      .select(`
        *,
        user:user_id ( profiles ( username, full_name, avatar_url ) )
      `)
      .eq('id', shareId)
      .eq('is_active', true)
      // .gt('expires_at', new Date().toISOString()) // Ensure not expired
      .single();

    if (fetchError) {
      console.error("Error fetching shared location:", fetchError);
      setError("No se pudo cargar la ubicación compartida o el enlace ha expirado/no es válido.");
      toast({ title: "Error", description: "No se pudo cargar la ubicación compartida.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError("Este enlace para compartir ubicación no es válido, ha expirado o ya no está activo.");
      setIsLoading(false);
      return;
    }
    
    // Check expiration client-side as well
    if (new Date(data.expires_at) < new Date()) {
        setError("Este enlace para compartir ubicación ha expirado.");
        setIsLoading(false);
        // Optionally, deactivate it in DB
        await supabase.from('shared_locations').update({ is_active: false }).eq('id', shareId);
        return;
    }


    setSharedLocationData(data);
    setSharerProfile(data.user?.profiles);
    if (data.latitude && data.longitude) {
      setMapCenter([data.latitude, data.longitude]);
    }
    setError(null);
    setIsLoading(false);
  }, [shareId, toast]);

  useEffect(() => {
    fetchSharedLocation();

    // Subscribe to realtime updates for this specific shared_location id
    const channel = supabase
      .channel(`shared_location_${shareId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'shared_locations', 
        filter: `id=eq.${shareId}` 
      }, 
      (payload) => {
        console.log('Shared location update received!', payload);
        const updatedData = payload.new;
        if (updatedData.is_active && new Date(updatedData.expires_at) > new Date()) {
          setSharedLocationData(updatedData);
          if (updatedData.latitude && updatedData.longitude) {
            setMapCenter([updatedData.latitude, updatedData.longitude]);
          }
        } else {
          setError("El enlace para compartir ubicación ha expirado o ha sido desactivado.");
          setSharedLocationData(null); // Clear data if no longer active
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shareId, fetchSharedLocation]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-white text-xl">Cargando ubicación compartida...</p></div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md bg-slate-800/80 border-red-500/50 shadow-xl backdrop-blur-md text-center p-8">
          <CardTitle className="text-2xl text-red-400 mb-4">Error al Cargar</CardTitle>
          <CardDescription className="text-gray-300">{error}</CardDescription>
        </Card>
      </div>
    );
  }

  if (!sharedLocationData || !sharedLocationData.latitude || !sharedLocationData.longitude) {
    return (
         <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-md bg-slate-800/80 border-yellow-500/50 shadow-xl backdrop-blur-md text-center p-8">
            <CardTitle className="text-2xl text-yellow-400 mb-4">Ubicación No Disponible</CardTitle>
            <CardDescription className="text-gray-300">La ubicación para este enlace no está disponible actualmente o el usuario ha dejado de compartir.</CardDescription>
            </Card>
        </div>
    );
  }
  
  const sharerName = sharerProfile?.full_name || sharerProfile?.username || "Alguien";

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-slate-800/80 border-purple-700/50 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-purple-300">Ubicación Compartida</CardTitle>
          <CardDescription className="text-gray-300">
            Estás viendo la ubicación de <span className="font-semibold text-purple-400">{sharerName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-[400px] md:h-[500px] rounded-md overflow-hidden border-2 border-purple-500/30">
            <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={true} className="h-full z-0" key={mapCenter.join(',')}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[sharedLocationData.latitude, sharedLocationData.longitude]} icon={sharedUserIcon}>
                <Popup>
                  {sharerName} está aquí. <br />
                  Última actualización: {formatDistanceToNow(new Date(sharedLocationData.updated_at), { addSuffix: true, locale: es })}.
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="text-center text-gray-400 space-y-1">
            <p className="flex items-center justify-center">
              <UserCircle className="mr-2 h-5 w-5 text-purple-400" />
              Compartido por: <strong className="ml-1 text-gray-200">{sharerName}</strong>
            </p>
            <p className="flex items-center justify-center">
              <Clock className="mr-2 h-5 w-5 text-purple-400" />
              Última actualización: <strong className="ml-1 text-gray-200">{format(new Date(sharedLocationData.updated_at), "Pp", { locale: es })} ({formatDistanceToNow(new Date(sharedLocationData.updated_at), { addSuffix: true, locale: es })})</strong>
            </p>
             <p className="text-xs text-gray-500">
              Este enlace expira el: {format(new Date(sharedLocationData.expires_at), "Pp", { locale: es })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedLocationViewPage;
  