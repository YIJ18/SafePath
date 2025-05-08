
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Share2, Copy, Link as LinkIcon, Unlink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import useUserLocation from '@/hooks/useUserLocation';

const ShareLocationCard = ({ variants }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userLocation } = useUserLocation(toast); // Use the hook for user's current location

  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [sharedLocationLink, setSharedLocationLink] = useState('');
  const [activeShareId, setActiveShareId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for active share on component mount
  useEffect(() => {
    const checkActiveShare = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shared_locations')
        .select('id, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.is_active) {
        setIsSharingLocation(true);
        setActiveShareId(data.id);
        setSharedLocationLink(`${window.location.origin}/view-share/${data.id}`);
      } else if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
        console.error("Error checking active share:", error);
      }
      setIsLoading(false);
    };
    checkActiveShare();
  }, [user]);

  // Update shared location periodically if sharing
  useEffect(() => {
    let intervalId;
    if (isSharingLocation && activeShareId && userLocation) {
      const updateLocation = async () => {
        if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') return;
        
        const { error } = await supabase
          .from('shared_locations')
          .update({ 
            latitude: userLocation.lat, 
            longitude: userLocation.lng,
            updated_at: new Date().toISOString() 
          })
          .eq('id', activeShareId);
        if (error) {
          console.error("Error updating shared location:", error);
          toast({ title: "Error al actualizar ubicación compartida", description: error.message, variant: "destructive" });
        }
      };
      updateLocation(); // Initial update
      intervalId = setInterval(updateLocation, 30000); // Update every 30 seconds
    }
    return () => clearInterval(intervalId);
  }, [isSharingLocation, activeShareId, userLocation, toast]);


  const handleToggleShareLocation = async () => {
    if (!user) {
      toast({ title: "Acción no permitida", description: "Debes iniciar sesión para compartir tu ubicación.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    if (isSharingLocation && activeShareId) {
      // Stop sharing
      const { error } = await supabase
        .from('shared_locations')
        .update({ is_active: false, expires_at: new Date().toISOString() })
        .eq('id', activeShareId);

      if (error) {
        toast({ title: "Error al detener", description: error.message, variant: "destructive" });
      } else {
        setIsSharingLocation(false);
        setSharedLocationLink('');
        setActiveShareId(null);
        toast({ title: "Compartir Ubicación Detenido", description: "Has dejado de compartir tu ubicación." });
      }
    } else {
      // Start sharing
      if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
        toast({ title: "Ubicación no disponible", description: "No se puede compartir la ubicación porque tu ubicación actual no está disponible.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const expires_at = new Date();
      expires_at.setHours(expires_at.getHours() + 24); // Link expires in 24 hours

      const { data, error } = await supabase
        .from('shared_locations')
        .insert([{ 
          user_id: user.id, 
          latitude: userLocation.lat, 
          longitude: userLocation.lng,
          is_active: true,
          expires_at: expires_at.toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        toast({ title: "Error al iniciar", description: error.message, variant: "destructive" });
      } else if (data) {
        setIsSharingLocation(true);
        setActiveShareId(data.id);
        const newLink = `${window.location.origin}/view-share/${data.id}`;
        setSharedLocationLink(newLink);
        toast({ title: "Ubicación Compartida", description: `Tu ubicación se está compartiendo. Enlace generado.` });
      }
    }
    setIsLoading(false);
  };

  const handleCopyLink = () => {
    if (sharedLocationLink) {
      navigator.clipboard.writeText(sharedLocationLink)
        .then(() => {
          toast({ title: "Enlace Copiado", description: "El enlace para compartir ubicación ha sido copiado al portapapeles." });
        })
        .catch(err => {
          console.error('Error al copiar enlace: ', err);
          toast({ title: "Error al Copiar", description: "No se pudo copiar el enlace.", variant: "destructive" });
        });
    }
  };

  return (
    <motion.div variants={variants}>
      <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-purple-300 flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-green-400" /> Compartir Ubicación
          </CardTitle>
          <CardDescription className="text-gray-400">
            Comparte tu ubicación en tiempo real con contactos de confianza. El enlace expira en 24 horas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={isSharingLocation ? "outline" : "default"}
            className={`w-full text-md py-3 ${isSharingLocation ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'bg-green-500 hover:bg-green-600 text-slate-900'}`}
            onClick={handleToggleShareLocation}
            disabled={isLoading}
          >
            {isLoading ? (isSharingLocation ? 'Deteniendo...' : 'Iniciando...') : 
              (isSharingLocation ? <><Unlink className="mr-2 h-5 w-5" />Dejar de Compartir</> : <><LinkIcon className="mr-2 h-5 w-5" />Iniciar Compartir</>)
            }
          </Button>
          {isSharingLocation && sharedLocationLink && (
            <div className="space-y-2 pt-2">
              <p className="text-sm text-gray-300">Enlace para compartir:</p>
              <div className="flex space-x-2">
                <Input type="text" value={sharedLocationLink} readOnly className="bg-slate-700 border-purple-600 text-gray-200 flex-grow" />
                <Button variant="ghost" size="icon" onClick={handleCopyLink} className="text-gray-400 hover:text-purple-400">
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Cualquiera con este enlace podrá ver tu ubicación mientras esté activo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ShareLocationCard;
  