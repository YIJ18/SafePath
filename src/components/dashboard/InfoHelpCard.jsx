
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const InfoHelpCard = ({ variants, className }) => {
  return (
    <motion.div variants={variants} className={cn(className)}>
      <Card className="bg-slate-800/70 border-purple-700/50 shadow-xl backdrop-blur-md h-full">
        <CardHeader>
          <CardTitle className="text-xl text-purple-300 flex items-center">
            <HelpCircle className="mr-2 h-5 w-5 text-teal-400" /> Información y Ayuda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400">
            Bienvenido al panel de SafePath. Aquí puedes gestionar tu seguridad y conectarte con otros.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
            <li>Usa el mapa para ver tu ubicación y zonas reportadas.</li>
            <li>El botón de emergencia alertará (simuladamente) a tus contactos.</li>
            <li>Reporta rutas inseguras para ayudar a la comunidad.</li>
            <li>Comparte tu ubicación en tiempo real (simulado) con quien desees.</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            La funcionalidad del dispositivo Sigfox, las alertas en tiempo real y el compartir ubicación real requieren un backend (servidor) que no está implementado en esta demostración frontend. Los datos de Sigfox y los enlaces para compartir son simulados.
          </p>
          <Button variant="link" className="text-teal-400 p-0 h-auto">
            Leer más sobre seguridad
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InfoHelpCard;
  