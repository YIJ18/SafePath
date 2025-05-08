
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { AlertTriangle, Speaker, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import useUserLocation from '@/hooks/useUserLocation'; // Assuming userLocation is needed here

const ReportUnsafeRouteDialog = ({ onReport }) => {
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (description) {
      onReport(description);
      setDescription('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-yellow-500/10 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
          <AlertTriangle className="mr-2 h-4 w-4" /> Reportar Ruta Insegura (Ubicación Actual)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-purple-700 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Reportar Ruta Insegura en tu Ubicación Actual</DialogTitle>
          <DialogDescription className="text-gray-400">
            Describe brevemente por qué esta ruta (tu ubicación actual) es insegura. Tu reporte será anónimo si no has iniciado sesión.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description_dialog_card" className="text-right text-gray-300">
              Descripción
            </Label>
            <Input
              id="description_dialog_card"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 bg-slate-700 border-purple-600 text-gray-200 placeholder-gray-500"
              placeholder="Ej: Poca iluminación, actividad sospechosa"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-purple-500 text-purple-400 hover:bg-purple-500/20">Cancelar</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">Enviar Reporte</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EmergencyActionsCard = ({ onReportUnsafeRoute, variants }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userLocation } = useUserLocation(toast); // Get userLocation from the hook

  const handleEmergency = async () => {
    if (!user) {
      toast({ title: "Acción no permitida", description: "Debes iniciar sesión para activar una alerta de emergencia.", variant: "destructive" });
      return;
    }
    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      toast({ title: "Ubicación no disponible", description: "No se puede activar la emergencia sin tu ubicación actual.", variant: "destructive" });
      return;
    }

    setIsEmergencyActive(true);
    const message = prompt("Opcional: Añade un breve mensaje a tu alerta de emergencia:");

    const { error } = await supabase
      .from('emergency_alerts')
      .insert([{ 
        user_id: user.id, 
        latitude: userLocation.lat, 
        longitude: userLocation.lng,
        message: message || "¡Emergencia!" 
      }]);

    if (error) {
      toast({
        title: "Error al Enviar Alerta",
        description: error.message,
        variant: "destructive",
      });
      setIsEmergencyActive(false);
    } else {
      toast({
        title: "¡Alerta de Emergencia Enviada!",
        description: "Tu alerta ha sido registrada y sería visible para otros usuarios.",
        variant: "destructive",
        duration: 10000,
      });
      // Keep emergency active visually for some time
      setTimeout(() => setIsEmergencyActive(false), 30000);
    }
  };
  
  return (
    <motion.div variants={variants}>
      <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl text-purple-300 flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-red-500" /> Acciones de Emergencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={isEmergencyActive ? "destructive" : "default"}
            className={`w-full text-lg py-6 ${isEmergencyActive ? 'bg-red-700 hover:bg-red-800 animate-pulse' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={handleEmergency}
            disabled={isEmergencyActive}
          >
            <Speaker className="mr-2 h-6 w-6" /> {isEmergencyActive ? "Emergencia Activada" : "Botón de Emergencia"}
          </Button>
          <ReportUnsafeRouteDialog onReport={onReportUnsafeRoute} />
          <p className="text-xs text-gray-500 text-center pt-2">
            Haz clic en el mapa para reportar una ubicación peligrosa específica. El botón de arriba reportará tu ubicación actual.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmergencyActionsCard;
  